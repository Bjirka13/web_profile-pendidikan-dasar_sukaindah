import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseSchoolFromHtml } from './src/scraper.ts';

const htmlPath = path.resolve('example/SDN 01/Data Pokok SD NEGERI SUKAINDAH 01 - Pauddikdasmen (Profil).html');
const html = await readFile(htmlPath, 'utf8');
const entry = { id: 1, slug: 'sdn-sukaindah-01', npsn: '20217401' };
const result = parseSchoolFromHtml(html, entry);
console.log(JSON.stringify({
  npsn: result.npsn,
  name: result.name,
  status: result.status,
  accreditation: result.accreditation,
  yearEstablished: result.yearEstablished,
  address: result.address,
  kodePos: result.kodePos,
  kecamatan: result.kecamatan,
  desa: result.desa,
  contact: result.contact,
  email: result.email,
  totalStudents: result.totalStudents,
  maleStudents: result.maleStudents,
  femaleStudents: result.femaleStudents,
  totalTeachers: result.totalTeachers,
  profileSummary: result.profileSummary,
}, null, 2));
