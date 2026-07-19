import type { SchoolCatalog, SchoolListEntry, ScrapeResult, ScrapedSchoolData } from "./types.js";
export declare function parseSchoolFromHtml(html: string, entry: SchoolListEntry): ScrapedSchoolData;
export declare function scrapeSchool(entry: SchoolListEntry): Promise<ScrapeResult>;
export declare function syncAllSchools(): Promise<SchoolCatalog>;
export declare function loadCatalog(): Promise<SchoolCatalog>;
export declare function getSchoolByNpsn(npsn: string): Promise<ScrapedSchoolData | undefined>;
//# sourceMappingURL=scraper.d.ts.map