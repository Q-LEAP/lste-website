// Generates a static .ics file for the LSTE 2026 event date, so the
// "Add to calendar" button on /schedule/ works for Apple Calendar and
// Outlook (Google Calendar gets its own render?action=TEMPLATE link,
// authored directly in schedule/index.html, no generation needed there).
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_PATH = path.join(ROOT, 'assets/downloads/lste-2026.ics');

const EVENT = {
  uid: 'lste-2026@lste.lu',
  summary: 'LSTE 2026 — Luxembourg Software Testing Event',
  // Luxembourg is UTC+1 (CET, no DST) in late November.
  dtstart: '20261126T073000Z',
  dtend: '20261126T170000Z',
  location: 'Conference Center Hôtel Parc Belle-Vue, 5 Avenue Marie-Thérèse, L-2132 Luxembourg',
  description: "Luxembourg's software testing conference, 8th edition. Free to attend. https://lste.lu/",
  url: 'https://lste.lu/',
};

// RFC 5545: escape , ; \ and newlines in TEXT values.
function escapeText(s) {
  return s.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

// RFC 5545: fold lines longer than 75 octets, continuation starts with a space.
function foldLine(line) {
  const bytes = Buffer.from(line, 'utf8');
  if (bytes.length <= 75) return line;
  const chunks = [];
  let start = 0;
  let limit = 75;
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    chunks.push(bytes.slice(start, end).toString('utf8'));
    start = end;
    limit = 74; // continuation lines lose 1 octet to the leading space
  }
  return chunks.join('\r\n ');
}

function buildIcs() {
  const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LSTE//Luxembourg Software Testing Event//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${EVENT.uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${EVENT.dtstart}`,
    `DTEND:${EVENT.dtend}`,
    `SUMMARY:${escapeText(EVENT.summary)}`,
    `LOCATION:${escapeText(EVENT.location)}`,
    `DESCRIPTION:${escapeText(EVENT.description)}`,
    `URL:${EVENT.url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

async function main() {
  await mkdir(path.dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, buildIcs(), 'utf8');
  console.log(`Wrote ${OUT_PATH}`);
}

main();
