import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import { writeFile, readFile, readdir, stat, unlink, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { insertSchoolSyncStatus, upsertSchoolRecord } from "./supabase.js";
const baseDir = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(baseDir, "../data");
const SCHOOL_LIST_FILE = path.join(DATA_DIR, "school-list.json");
const OUTPUT_FILE = path.join(DATA_DIR, "schools.json");
const DEBUG_OUTPUT_DIR = DATA_DIR;
const FRONTEND_SCHOOL_LIST_FILE = path.join(baseDir, "../../src/app/data/schools.ts");
const BASE_URL = process.env.DAPO_BASE_URL || "https://dapo.kemendikdasmen.go.id/";
const DEBUG_RETENTION_DAYS = Number(process.env.DEBUG_RETENTION_DAYS || 180);
const DEBUG_CLEANUP_ENABLED = process.env.DEBUG_CLEANUP_ENABLED !== "false";
async function ensureDataDirectory() {
    await mkdir(DATA_DIR, { recursive: true });
}
async function ensureFileExists(filePath, defaultContent) {
    try {
        await stat(filePath);
    }
    catch (error) {
        if (error?.code === "ENOENT") {
            await writeFile(filePath, defaultContent, "utf8");
        }
        else {
            throw error;
        }
    }
}
async function ensureSchoolListFile() {
    await ensureDataDirectory();
    await ensureFileExists(SCHOOL_LIST_FILE, "[]");
}
async function ensureOutputFile() {
    await ensureDataDirectory();
    await ensureFileExists(OUTPUT_FILE, JSON.stringify({ updatedAt: new Date().toISOString(), schools: [] }, null, 2));
}
export async function loadSchoolList() {
    await ensureSchoolListFile();
    const raw = await readFile(SCHOOL_LIST_FILE, "utf8");
    return JSON.parse(raw);
}
async function saveCatalog(catalog) {
    await ensureDataDirectory();
    await writeFile(OUTPUT_FILE, JSON.stringify(catalog, null, 2), "utf8");
}
async function persistSchoolToSupabase(school, syncStatus) {
    try {
        const schoolId = await upsertSchoolRecord(school, syncStatus);
        if (schoolId) {
            await insertSchoolSyncStatus(schoolId, syncStatus);
        }
    }
    catch (error) {
        console.error("Supabase persistence failed:", error instanceof Error ? error.message : error);
        throw error;
    }
}
async function cleanupDebugHtmlFiles() {
    if (!DEBUG_CLEANUP_ENABLED)
        return 0;
    await mkdir(DEBUG_OUTPUT_DIR, { recursive: true });
    const files = (await readdir(DEBUG_OUTPUT_DIR))
        .filter((name) => name.startsWith("debug-") && name.endsWith(".html"))
        .map((name) => path.join(DEBUG_OUTPUT_DIR, name));
    if (files.length === 0)
        return 0;
    const cutoff = Date.now() - DEBUG_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    const candidates = await Promise.all(files.map(async (filePath) => {
        const stats = await stat(filePath);
        const content = await readFile(filePath, "utf8");
        const hash = createHash("sha256").update(content).digest("hex");
        return { filePath, mtimeMs: stats.mtimeMs, hash };
    }));
    const filesToDelete = new Set();
    const byHash = new Map();
    for (const candidate of candidates) {
        if (candidate.mtimeMs < cutoff) {
            filesToDelete.add(candidate.filePath);
            continue;
        }
        const bucket = byHash.get(candidate.hash) || [];
        bucket.push({ filePath: candidate.filePath, mtimeMs: candidate.mtimeMs });
        byHash.set(candidate.hash, bucket);
    }
    for (const bucket of byHash.values()) {
        bucket.sort((a, b) => b.mtimeMs - a.mtimeMs);
        bucket.slice(1).forEach((entry) => filesToDelete.add(entry.filePath));
    }
    await Promise.all(Array.from(filesToDelete).map(async (filePath) => {
        try {
            await unlink(filePath);
        }
        catch (error) {
            console.warn(`Failed to delete debug file ${filePath}:`, error);
        }
    }));
    return filesToDelete.size;
}
function normalizeText(value) {
    return value?.trim().replace(/\s+/g, " ");
}
function normalizeToken(value) {
    return value?.trim().toLowerCase().replace(/[\s\-_]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "") || "";
}
function createSlug(value, fallback) {
    const primary = normalizeToken(value);
    if (primary)
        return primary;
    const secondary = normalizeToken(fallback);
    if (secondary)
        return secondary;
    return `school-${Date.now()}`;
}
async function loadFrontendSchoolAllowlist() {
    const raw = await readFile(FRONTEND_SCHOOL_LIST_FILE, "utf8");
    const allowlist = new Set();
    for (const match of raw.matchAll(/slug:\s*"([^"]+)"/g)) {
        const slug = normalizeToken(match[1]);
        if (slug)
            allowlist.add(slug);
    }
    for (const match of raw.matchAll(/name:\s*"([^"]+)"/g)) {
        const normalizedName = normalizeToken(match[1]);
        if (normalizedName)
            allowlist.add(normalizedName);
    }
    return allowlist;
}
function shouldKeepEntry(entry, allowlist) {
    return [entry.slug, entry.npsn].some((value) => allowlist.has(normalizeToken(value)));
}
function parseNumber(value) {
    if (!value)
        return undefined;
    const cleaned = value.replace(/[^0-9]/g, "");
    return cleaned ? Number(cleaned) : undefined;
}
function isPlaceholderText(value) {
    const text = normalizeText(value);
    return !text || text === "-" || text.toLowerCase().includes("loading");
}
function maybePlaceholderPage($) {
    const checks = [
        $("h1.school-name").text(),
        $(".school-header h1").text(),
        $(".total-students").text(),
        $(".male-students").text(),
        $(".female-students").text(),
    ];
    const dashCount = checks.reduce((count, value) => count + (isPlaceholderText(value) ? 1 : 0), 0);
    if (dashCount >= 3) {
        return true;
    }
    const panelPlaceholders = $(".panel-body p").toArray().some((el) => {
        const text = normalizeText($(el).text());
        return text === "-" || text?.startsWith("-");
    });
    return panelPlaceholders;
}
function selectPanelValue($, label) {
    const normalizedLabel = label.trim().replace(/:$/, "");
    const paragraph = $(".panel-body p").filter((_, el) => {
        const strongText = normalizeText($(el).find("strong").text())?.replace(/:$/, "");
        return strongText === normalizedLabel;
    }).first();
    if (!paragraph.length)
        return undefined;
    const cloned = paragraph.clone();
    cloned.find("strong").remove();
    return normalizeText(cloned.text());
}
function buildSyncStatus(entry, success, message, sourceUrl) {
    return {
        npsn: entry.npsn,
        slug: entry.slug,
        status: success ? "success" : "failed",
        message,
        scrapedAt: new Date().toISOString(),
        sourceUrl,
    };
}
function resolveSchoolIdentifier(entry) {
    const overrides = {
        "sdn-sukaindah-01": "370506873E4B12FE32DB",
        "sdn-sukaindah-02": "8E007D309C6134C370C8",
        "sdn-sukaindah-03": "B524DA9D1DA079FC62CC",
        "sdn-sukaindah-04": "0604C4B7A8D83E2DC7E8",
    };
    return overrides[entry.slug] || entry.npsn;
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function navigateToSchoolViaSearch(page, entry) {
    const searchUrl = new URL("pencarian", BASE_URL).toString();
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await sleep(1200);
    const queries = [entry.npsn, entry.slug, entry.slug.replace(/-/g, " ")];
    const inputSelectors = [
        'input[name="keyword"]',
        'input[name*="keyword" i]',
        'input[name*="search" i]',
        'input[name*="cari" i]',
        'input[name*="npsn" i]',
        'input[type="search"]',
        'input[type="text"]',
        'input.form-control',
        'input[placeholder*="keyword" i]',
        'input[placeholder*="search" i]',
        'input[placeholder*="cari" i]',
        'input[placeholder*="npsn" i]',
    ];
    const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button',
        '[role="button"]',
    ];
    for (const query of queries) {
        const filled = await page.evaluate((value, selectors) => {
            const normalizeVisible = (element) => {
                if (!element || !(element instanceof HTMLElement))
                    return false;
                const style = window.getComputedStyle(element);
                const rect = element.getBoundingClientRect();
                return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
            };
            const target = selectors
                .map((selector) => document.querySelector(selector))
                .find((element) => Boolean(element) && normalizeVisible(element) && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement));
            if (!target)
                return false;
            const prototype = target instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
            const valueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
            valueSetter?.call(target, value);
            target.focus();
            target.dispatchEvent(new Event("input", { bubbles: true }));
            target.dispatchEvent(new Event("change", { bubbles: true }));
            return true;
        }, query, inputSelectors);
        if (!filled) {
            continue;
        }
        await sleep(800);
        await page.keyboard.press("Enter").catch(() => undefined);
        await page.evaluate((selectors) => {
            const isVisible = (element) => {
                if (!element || !(element instanceof HTMLElement))
                    return false;
                const style = window.getComputedStyle(element);
                const rect = element.getBoundingClientRect();
                return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
            };
            const form = document.querySelector("form");
            if (form) {
                if (typeof form.requestSubmit === "function") {
                    form.requestSubmit();
                    return;
                }
                form.submit();
                return;
            }
            for (const selector of selectors) {
                const button = document.querySelector(selector);
                if (button && isVisible(button)) {
                    button.click();
                    return;
                }
            }
        }, submitSelectors);
        await sleep(3500);
        const currentUrl = page.url();
        if (currentUrl.includes("/sekolah/")) {
            return page.content();
        }
        const resultLink = await page.evaluate((npsn, slug) => {
            const normalize = (value) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
            const targetNpsn = normalize(npsn);
            const targetSlug = normalize(slug);
            const anchors = Array.from(document.querySelectorAll("a")).filter((anchor) => anchor.href.includes("/sekolah/"));
            const matched = anchors.find((anchor) => {
                const text = normalize(anchor.textContent || "");
                const href = normalize(anchor.href);
                return text.includes(targetNpsn) || text.includes(targetSlug) || href.includes(targetNpsn) || href.includes(targetSlug);
            });
            return matched?.href || null;
        }, entry.npsn, entry.slug);
        if (resultLink) {
            await page.goto(resultLink, { waitUntil: "domcontentloaded", timeout: 60000 });
            await page.waitForFunction(() => document.readyState === "complete", { timeout: 60000 }).catch(() => undefined);
            await sleep(1500);
            const bodyText = await page.evaluate(() => document.body.innerText.toLowerCase());
            if (!/404 error|halaman tidak ditemukan|silakan memasukan kata kunci/.test(bodyText)) {
                return page.content();
            }
        }
    }
    for (const query of queries) {
        for (const param of ["keyword", "q", "search", "cari", "npsn"]) {
            const queryUrl = new URL("pencarian", BASE_URL);
            queryUrl.searchParams.set(param, query);
            await page.goto(queryUrl.toString(), { waitUntil: "domcontentloaded", timeout: 60000 });
            await sleep(2500);
            const currentUrl = page.url();
            if (currentUrl.includes("/sekolah/")) {
                return page.content();
            }
            const resultLink = await page.evaluate((npsn, slug) => {
                const normalize = (value) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
                const targetNpsn = normalize(npsn);
                const targetSlug = normalize(slug);
                const anchors = Array.from(document.querySelectorAll("a")).filter((anchor) => anchor.href.includes("/sekolah/"));
                const matched = anchors.find((anchor) => {
                    const text = normalize(anchor.textContent || "");
                    const href = normalize(anchor.href);
                    return text.includes(targetNpsn) || text.includes(targetSlug) || href.includes(targetNpsn) || href.includes(targetSlug);
                });
                return matched?.href || null;
            }, entry.npsn, entry.slug);
            if (resultLink) {
                await page.goto(resultLink, { waitUntil: "domcontentloaded", timeout: 60000 });
                await page.waitForFunction(() => document.readyState === "complete", { timeout: 60000 }).catch(() => undefined);
                await sleep(1500);
                const bodyText = await page.evaluate(() => document.body.innerText.toLowerCase());
                if (!/404 error|halaman tidak ditemukan|silakan memasukan kata kunci/.test(bodyText)) {
                    return page.content();
                }
            }
        }
    }
    return undefined;
}
async function fetchSchoolPageWithBrowser(url, entry) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    let page;
    try {
        page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36");
        await page.setViewport({ width: 1440, height: 1200 });
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForFunction(() => document.readyState === "complete", { timeout: 60000 });
        await sleep(2500);
        const pageSummary = await page.evaluate(() => {
            const bodyText = document.body.innerText.toLowerCase();
            return {
                is404: /404 error|halaman tidak ditemukan/.test(bodyText),
                hasProfileTabs: !!document.querySelector("#profil, #rekapitulasi, #kontak, .profile-content"),
                hasSchoolName: !!document.querySelector(".profile .info h2.name, h1.school-name, .school-header h1"),
            };
        });
        if ((!pageSummary.hasProfileTabs && !pageSummary.hasSchoolName) || pageSummary.is404) {
            const viaSearch = entry ? await navigateToSchoolViaSearch(page, entry) : undefined;
            if (viaSearch) {
                return viaSearch;
            }
        }
        const tabSelectors = [".nav.nav-tabs a", ".nav-tabs a", "[role='tab']", "[data-toggle='tab']", "a[href*='#']"];
        for (const selector of tabSelectors) {
            const links = await page.$$(selector);
            if (links.length) {
                for (const link of links) {
                    try {
                        await link.click();
                        await sleep(600);
                    }
                    catch {
                        // abaikan tab yang tidak bisa diklik
                    }
                }
                break;
            }
        }
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight / 2);
        });
        await sleep(2000);
        const content = await page.content();
        try {
            const id = String(url).split('/').filter(Boolean).pop() || 'page';
            const debugPath = path.join(baseDir, `../data/debug-${id}.html`);
            await writeFile(debugPath, content, 'utf8');
            console.log(`Saved debug HTML to ${debugPath}`);
        }
        catch (err) {
            console.warn('Failed to save debug HTML:', err instanceof Error ? err.message : err);
        }
        return content;
    }
    catch (error) {
        if (page) {
            try {
                const content = await page.content();
                const id = String(url).split('/').filter(Boolean).pop() || 'page';
                const debugPath = path.join(baseDir, `../data/debug-${id}-error.html`);
                await writeFile(debugPath, content, 'utf8');
                console.log(`Saved error debug HTML to ${debugPath}`);
            }
            catch (saveError) {
                console.warn('Failed to save error debug HTML:', saveError instanceof Error ? saveError.message : saveError);
            }
        }
        throw error;
    }
    finally {
        await browser.close();
    }
}
async function fetchSchoolPage(npsn, entry) {
    const url = new URL(`sekolah/${encodeURIComponent(npsn)}`, BASE_URL).toString();
    try {
        return await fetchSchoolPageWithBrowser(url, entry);
    }
    catch (browserError) {
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; WebPortalScraper/1.0; +https://example.com)"
            },
            timeout: 20000,
        });
        try {
            const id = String(url).split('/').filter(Boolean).pop() || 'page';
            const debugPath = path.join(baseDir, `../data/debug-${id}-fallback.html`);
            await writeFile(debugPath, String(response.data), 'utf8');
            console.log(`Saved fallback debug HTML to ${debugPath}`);
        }
        catch (err) {
            console.warn('Failed to save fallback debug HTML:', err instanceof Error ? err.message : err);
        }
        return response.data;
    }
}
async function fetchSchoolPageWithRetry(npsn, attempts = 3, entry) {
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            const html = await fetchSchoolPage(npsn, entry);
            const $ = cheerio.load(html);
            if (maybePlaceholderPage($)) {
                if (attempt < attempts) {
                    await new Promise((resolve) => setTimeout(resolve, 1200));
                    continue;
                }
            }
            return html;
        }
        catch (error) {
            lastError = error;
            if (attempt < attempts) {
                await new Promise((resolve) => setTimeout(resolve, 1200));
            }
        }
    }
    throw lastError ?? new Error("Failed to fetch school page after retries");
}
export function parseSchoolFromHtml(html, entry) {
    const $ = cheerio.load(html);
    const name = normalizeText($("h1.school-name").text())
        || normalizeText($(".school-header h1").text())
        || normalizeText($(".profile .info h2.name").text())
        || normalizeText($(".info h2.name").text())
        || normalizeText($(".name").first().text())
        || entry.slug;
    // Default fallbacks
    let npsn = selectPanelValue($, "NPSN") || entry.npsn;
    let status = normalizeText($(".school-status").text()) || selectPanelValue($, "Status") || undefined;
    let accreditation = normalizeText($(".accreditation").text()) || selectPanelValue($, "Akreditasi") || undefined;
    let yearEstablished = undefined;
    // Parse #profil panel structured values (strong label : value)
    const profil = $("#profil");
    if (profil && profil.length) {
        profil.find(".panel-body p").each((_, el) => {
            const label = normalizeText($(el).find("strong").first().text())?.replace(/:$/, "") || undefined;
            const cloned = $(el).clone();
            cloned.find("strong").remove();
            const value = normalizeText(cloned.text()) || undefined;
            if (!label || !value)
                return;
            if (/npsn/i.test(label))
                npsn = value;
            else if (/status$/i.test(label))
                status = value;
            else if (/bentuk pendidikan/i.test(label)) {
                // store as part of status or accreditation if needed
            }
            else if (/tanggal sk pendirian/i.test(label) || /tanggal sk/i.test(label)) {
                const m = value.match(/(\d{4})/);
                if (m)
                    yearEstablished = m[1];
            }
            else if (/sk pendirian/i.test(label)) {
                // could store SK number if needed
            }
        });
    }
    // Rekapitulasi: extract PTK/PD counts from classes used in the markup
    const rekap = $("#rekapitulasi");
    let totalStudents = undefined;
    let maleStudents = undefined;
    let femaleStudents = undefined;
    let totalTeachers = undefined;
    if (rekap && rekap.length) {
        const pdText = normalizeText(rekap.find(".pd").first().text()) || normalizeText(rekap.find(".pd").last().text());
        const ptkTotal = normalizeText(rekap.find(".ptk-total").first().text()) || undefined;
        if (pdText)
            totalStudents = parseNumber(pdText);
        const maleText = normalizeText(rekap.find(".pd_laki").first().text()) || normalizeText(rekap.find(".pd_laki").last().text());
        const femaleText = normalizeText(rekap.find(".pd_perempuan").first().text()) || normalizeText(rekap.find(".pd_perempuan").last().text());
        if (maleText)
            maleStudents = parseNumber(maleText);
        if (femaleText)
            femaleStudents = parseNumber(femaleText);
        if (ptkTotal)
            totalTeachers = parseNumber(ptkTotal);
    }
    // Sarpras: count values inside table by reading numeric links
    const facilities = [];
    $("#rekapitulasi .panel-body table.table tr").each((_, tr) => {
        const key = normalizeText($(tr).find("td").eq(1).text());
        const before = normalizeText($(tr).find("a").eq(0).text());
        const after = normalizeText($(tr).find("a").eq(1).text());
        if (key) {
            const num = parseNumber(after || before);
            if (num !== undefined) {
                facilities.push({ name: key, count: num });
            }
        }
    });
    // Rombel count
    const rombel = parseNumber($(".rombel").first().text()) || undefined;
    // Kontak: structured address and coordinates
    const kontak = $("#kontak");
    let address = undefined;
    let kodePos = undefined;
    let kecamatan = undefined;
    let desa = undefined;
    let contact = undefined;
    let email = undefined;
    let lat = undefined;
    let lon = undefined;
    if (kontak && kontak.length) {
        kontak.find(".panel-body p").each((_, el) => {
            const label = normalizeText($(el).find("strong").first().text())?.replace(/:$/, "") || undefined;
            const cloned = $(el).clone();
            cloned.find("strong").remove();
            const value = normalizeText(cloned.text()) || undefined;
            if (!label || !value)
                return;
            if (/alamat/i.test(label))
                address = value;
            else if (/kode pos/i.test(label) || /kodepos/i.test(label))
                kodePos = value;
            else if (/kecamatan/i.test(label))
                kecamatan = value.replace(/^kec\.\s*/i, "");
            else if (/desa|kelurahan/i.test(label))
                desa = value;
            else if (/lintang/i.test(label))
                lat = value;
            else if (/bujur/i.test(label))
                lon = value;
        });
    }
    // More structured parsing inside each tab when available
    const profilEl = $("#profil").first();
    if (profilEl && profilEl.length) {
        profilEl.find("p, li, tr").each((_, el) => {
            const strongText = normalizeText($(el).find("strong").first().text())?.replace(/:$/, "") || undefined;
            const cloned = $(el).clone();
            cloned.find("strong").remove();
            const valueText = normalizeText(cloned.text());
            if (strongText && valueText) {
                if (/npsn/i.test(strongText)) {
                    // prefer explicit NPSN found in profil tab
                    // keep as string (may be encoded) but normalize
                    try {
                        // override only if valueText is not just '-'
                        if (!isPlaceholderText(valueText)) {
                            // do not coerce to number; keep raw
                            // set npsn variable (shadowing outer npsn is okay)
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            // assign to a local var then later use when building result
                        }
                    }
                    catch { }
                }
                if (/status/i.test(strongText)) {
                    // override status
                    if (!isPlaceholderText(valueText)) {
                        // set status variable
                    }
                }
                if (/akreditasi|akreditasi/i.test(strongText)) {
                    if (!isPlaceholderText(valueText)) {
                        // set accreditation
                    }
                }
                if (/alamat|alamat lengkap/i.test(strongText)) {
                    if (!isPlaceholderText(valueText)) {
                        // set address
                    }
                }
            }
        });
    }
    // Kontak parsing: find phone/email inside #kontak
    const kontakEl = $("#kontak").first();
    let kontakPhone = undefined;
    let kontakEmail = undefined;
    if (kontakEl && kontakEl.length) {
        const mail = kontakEl.find("a[href^='mailto:']").first().attr("href");
        if (mail)
            kontakEmail = mail.replace(/^mailto:/i, "").trim();
        const kontakText = normalizeText(kontakEl.text());
        if (kontakText) {
            const phoneMatch = kontakText.match(/(\+?\d[\d\s().-]{5,}\d)/);
            if (phoneMatch)
                kontakPhone = phoneMatch[0].replace(/\s+/g, " ");
            const emailMatch = kontakText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
            if (emailMatch)
                kontakEmail = emailMatch[0];
        }
    }
    // prefer kontak values if found
    const finalContact = kontakPhone || contact;
    const finalEmail = kontakEmail || email;
    const totalClassrooms = parseNumber($(".total-classrooms").text()) || undefined;
    const totalStudyGroups = parseNumber($(".total-study-groups").text()) || undefined;
    const profileSummary = normalizeText($(".profile-summary").text()) || normalizeText($(".panel-heading").first().text()) || undefined;
    const profileDetails = $("#profil .panel-body p")
        .map((_, el) => normalizeText($(el).text()))
        .get()
        .filter((value) => Boolean(value));
    const gradeStats = [];
    $(".grade-row").each((_, row) => {
        const label = normalizeText($(row).find(".grade-label").text());
        const total = parseNumber($(row).find(".grade-total").text());
        const male = parseNumber($(row).find(".grade-male").text());
        const female = parseNumber($(row).find(".grade-female").text());
        if (label && total !== undefined && male !== undefined && female !== undefined) {
            const gradeMatch = label.match(/\d+/);
            gradeStats.push({
                grade: gradeMatch ? Number(gradeMatch[0]) : 0,
                label,
                total,
                male,
                female,
            });
        }
    });
    const derivedName = name ?? entry.slug;
    return {
        npsn,
        name: derivedName,
        address,
        kodePos,
        kecamatan,
        desa,
        contact: finalContact,
        email: finalEmail,
        accreditation,
        status,
        yearEstablished,
        totalStudents,
        maleStudents,
        femaleStudents,
        totalTeachers,
        totalClassrooms,
        totalStudyGroups,
        profileSummary,
        profileDetails: profileDetails.length > 0 ? profileDetails : undefined,
        facilities: facilities.length > 0 ? facilities : undefined,
        gradeStats: gradeStats.length > 0 ? gradeStats : undefined,
        syncStatus: undefined,
    };
}
export async function scrapeSchool(entry) {
    const schoolIdentifier = resolveSchoolIdentifier(entry);
    const sourceUrl = `${BASE_URL}/sekolah/${encodeURIComponent(schoolIdentifier)}`;
    try {
        console.log(`Scraping ${entry.slug} using identifier ${schoolIdentifier}`);
        const html = await fetchSchoolPageWithRetry(schoolIdentifier, 3, entry);
        const payload = parseSchoolFromHtml(html, entry);
        const syncStatus = buildSyncStatus(entry, true, "Sinkronisasi DAPO berhasil", sourceUrl);
        await persistSchoolToSupabase(payload, syncStatus);
        return { entry, success: true, payload: { ...payload, syncStatus: `${syncStatus.message} ${new Date(syncStatus.scrapedAt).toLocaleDateString("id-ID")}` }, syncStatus };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        const syncStatus = buildSyncStatus(entry, false, `Sinkronisasi DAPO gagal: ${message}`, sourceUrl);
        return { entry, success: false, syncStatus };
    }
}
export async function syncAllSchools() {
    const removedDebugFiles = await cleanupDebugHtmlFiles();
    if (removedDebugFiles > 0) {
        console.log(`Cleaned up ${removedDebugFiles} debug HTML files before sync.`);
    }
    const allowlist = await loadFrontendSchoolAllowlist();
    const allEntries = await loadSchoolList();
    const entries = allEntries.filter((entry) => shouldKeepEntry(entry, allowlist));
    const results = [];
    if (entries.length !== allEntries.length) {
        console.log(`Filtering scraper target list from ${allEntries.length} entries to ${entries.length} frontend-matching schools.`);
    }
    for (const entry of entries) {
        const result = await scrapeSchool(entry);
        results.push(result);
    }
    const catalog = {
        updatedAt: new Date().toISOString(),
        schools: results
            .filter((result) => result.success && result.payload)
            .map((result) => result.payload),
        results,
    };
    await saveCatalog(catalog);
    return catalog;
}
export async function loadCatalog() {
    await ensureOutputFile();
    const raw = await readFile(OUTPUT_FILE, "utf8");
    return JSON.parse(raw);
}
export async function getSchoolByNpsn(npsn) {
    const catalog = await loadCatalog();
    return catalog.schools.find((school) => school.npsn === npsn);
}
if (process.argv[1]?.endsWith("scraper.ts")) {
    const catalog = await syncAllSchools();
    console.log(`Scraped ${catalog.schools.length} school records. Output saved to ${OUTPUT_FILE}`);
}
//# sourceMappingURL=scraper.js.map