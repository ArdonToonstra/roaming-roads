/*
  convertPolarstepsToJson.cjs - CommonJS version for projects with "type": "module"
*/
const fs = require('fs');
const path = require('path');
let yaml;
try {
  yaml = require('js-yaml');
} catch (e) {
  console.warn('Optional dependency "js-yaml" not found. Falling back to a minimal YAML parser for simple files. For robust parsing, run: npm install js-yaml');
  yaml = {
    load: (txt) => {
      // Very small and forgiving YAML parser for simple key: value + lists used in PolarstepsExport
      // This is NOT a general YAML parser. It supports top-level keys and simple lists of maps.
      const lines = txt.split(/\r?\n/);
      const out = {};
      let currentList = null;
      let currentObj = null;
      for (let raw of lines) {
        const line = raw.replace(/^\s+|\s+$/g, '');
        if (!line || line.startsWith('#')) continue;
        if (line.endsWith(':') && !line.includes(' ')) {
          // top-level key starting a block
          const key = line.slice(0, -1);
          out[key] = [];
          currentList = key;
          currentObj = null;
          continue;
        }
        if (line.startsWith('- ')) {
          // new list item
          if (!currentList) continue;
          currentObj = {};
          out[currentList].push(currentObj);
          const rest = line.slice(2).trim();
          if (rest) {
            const kv = rest.split(/:\s+(.*)/);
            if (kv.length >= 2) currentObj[kv[0]] = kv[1];
          }
          continue;
        }
        const kv = line.split(/:\s+(.*)/);
        if (kv.length >= 2) {
          const key = kv[0];
          const val = kv[1];
          if (currentObj) currentObj[key] = val;
          else out[key] = val;
        }
      }
      return out;
    }
  };
}

const INPUT_DIR = path.join(__dirname, '..', '..', 'PolarstepsExport');
const OUT_DIR = path.join(__dirname, '..', 'imports', 'polarsteps');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function safeParseDate(s) {
  if (!s) return null;
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString();
  const m = String(s).match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (m) {
    const day = m[1].padStart(2, '0');
    const month = m[2].padStart(2, '0');
    const year = m[3] ? (m[3].length === 2 ? '20' + m[3] : m[3]) : new Date().getFullYear();
    const iso = `${year}-${month}-${day}`;
    const dd = new Date(iso);
    if (!isNaN(dd.getTime())) return dd.toISOString();
  }
  return null;
}

function periodFromRaw(startRaw, endRaw) {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  function toDate(r) {
    if (!r) return null;
    // If already ISO-like string, try direct parse
    const asIso = new Date(r);
    if (!isNaN(asIso.getTime())) return asIso;
    // Try dd/mm or dd/mm/yy
    const m = String(r).match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
    if (m) {
      const day = m[1].padStart(2, '0');
      const month = m[2].padStart(2, '0');
      const year = m[3] ? (m[3].length === 2 ? '20' + m[3] : m[3]) : new Date().getFullYear();
      const d = new Date(`${year}-${month}-${day}`);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  }

  const s = toDate(startRaw);
  const e = toDate(endRaw);
  if (!s && !e) return null;
  if (!s && e) {
    return `${months[e.getUTCMonth()]} ${e.getUTCFullYear()}`;
  }
  if (s && !e) return `${months[s.getUTCMonth()]} ${s.getUTCFullYear()}`;
  // both present
  const sMonth = months[s.getUTCMonth()];
  const eMonth = months[e.getUTCMonth()];
  const sYear = s.getUTCFullYear();
  const eYear = e.getUTCFullYear();
  if (sYear === eYear) {
    if (sMonth === eMonth) return `${sMonth} ${sYear}`;
    return `${sMonth} – ${eMonth} ${sYear}`;
  }
  return `${sMonth} ${sYear} – ${eMonth} ${eYear}`;
}

function mapItineraryBlocks(travel_itinerary) {
  if (!Array.isArray(travel_itinerary)) return [];
  return travel_itinerary
    .map((item, idx) => {
    // Some fallback YAML parsers produce lists of small objects that need merging per list index.
    // Ensure we have a proper merged item object.
    const merged = Array.isArray(item) ? Object.assign({}, ...item) : item || {};
    const lat = (merged.location_gps_lat !== undefined && merged.location_gps_lat !== null) ? Number(merged.location_gps_lat) : (merged.lat ? Number(merged.lat) : null);
    const lng = (merged.location_gps_lon !== undefined && merged.location_gps_lon !== null) ? Number(merged.location_gps_lon) : (merged.lon ? Number(merged.lon) : null);
    const location = (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) ? { coordinates: [lng, lat] } : undefined;

    // Detect activities: prefer explicit activities array, else any array-valued prop with string entries
    let activities = null;
    if (Array.isArray(merged.activities) && merged.activities.length) {
      activities = merged.activities.map(a => String(a).trim()).join('\n\n');
    } else {
      // find any array-valued property that looks like activities (array of strings)
      for (const k of Object.keys(merged)) {
        if (Array.isArray(merged[k]) && merged[k].every(v => typeof v === 'string' || typeof v === 'number')) {
          activities = merged[k].map(a => String(a).trim()).join('\n\n');
          break;
        }
      }
      if (!activities && merged.notes) activities = String(merged.notes).trim();
    }

    // accommodation may be empty string in Polarsteps; normalize to null
  const accommodation = merged.accommodation && String(merged.accommodation).trim() ? merged.accommodation : null;

  // Skip items that contain no meaningful data (avoid many empty placeholders)
  const hasMeaning = (merged.location_name || merged.locationName || merged.location || activities || merged.date || accommodation || (lat !== null && lng !== null));
  if (!hasMeaning) return null;

    return {
      blockType: 'fullDay',
      id: `import-${idx + 1}`,
      day: merged.day || (idx + 1),
      date: merged.date || null,
      locationName: merged.location_name || merged.locationName || merged.location || null,
      location,
      description: merged.description || null,
      activities: activities || null,
      accommodation,
    };
    })
    .filter(Boolean);
}

function parseTravelItineraryFromText(txt) {
  const lines = txt.split(/\r?\n/);
  // find the line index where travel_itinerary: appears
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*travel_itinerary\s*:\s*$/.test(lines[i])) { start = i; break; }
  }
  if (start === -1) return null;
  // collect indented block starting after start
  const block = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    // stop if we hit a top-level key (no indent) followed by ':'
    if (/^\S+\s*:\s*$/.test(line)) break;
    block.push(line);
  }

  const items = [];
  let cur = null;
  for (let i = 0; i < block.length; i++) {
    const raw = block[i];
    if (/^\s*-\s*(.*)/.test(raw)) {
      // start new item
      if (cur) items.push(cur);
      cur = {};
      const m = raw.match(/^\s*-\s*(.*)/);
      if (m && m[1] && m[1].includes(':')) {
        const kv = m[1].split(/:\s+(.*)/);
        if (kv.length >= 2) cur[kv[0].trim()] = kv[1].trim();
      }
      continue;
    }
    if (!cur) continue;
    // key: value lines inside item
    const kv = raw.match(/^\s*([^:\s]+)\s*:\s*(.*)$/);
    if (kv) {
      const key = kv[1];
      const val = kv[2] || '';
      if (val === '') {
        // possibly a nested list (like activities:)
        if (/^\s*activities\s*:\s*$/.test(raw)) {
          // collect following lines that start with - under this indentation
          const activityLines = [];
          const indentMatch = raw.match(/^(\s*)/);
          const baseIndent = indentMatch ? indentMatch[1].length : 0;
          let j = i + 1;
          for (; j < block.length; j++) {
            const next = block[j];
            const nextTrim = next.replace(/\t/g, '  ');
            const nextIndent = nextTrim.match(/^(\s*)/)[1].length;
            if (nextIndent <= baseIndent) break;
            const actMatch = nextTrim.match(/^\s*-\s*(.*)$/);
            if (actMatch) activityLines.push(actMatch[1].trim());
          }
          cur.activities = activityLines;
          i = j - 1;
          continue;
        }
      } else {
        cur[key] = val.trim();
        continue;
      }
    }
    // continued line on previous key -> append
    const cont = raw.trim();
    if (cont && cur) {
      // try to append to last key if exists
      const keys = Object.keys(cur);
      if (keys.length) {
        const last = keys[keys.length - 1];
        cur[last] = (cur[last] ? String(cur[last]) + '\n' : '') + cont;
      }
    }
  }
  if (cur) items.push(cur);
  return items;
}

console.log('Scanning', INPUT_DIR);
const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
if (files.length === 0) {
  console.warn('No YAML files found in', INPUT_DIR);
  process.exit(0);
}

files.forEach((file) => {
  const full = path.join(INPUT_DIR, file);
  try {
    const content = fs.readFileSync(full, 'utf8');
    const data = yaml.load(content);
    if (!data || typeof data !== 'object') {
      console.warn('Skipping', file, '- not an object');
      return;
    }

    // If travel_itinerary wasn't parsed into an array, try a targeted parser on the raw text
    // Prefer the structured travel_itinerary parsed by js-yaml when available.
    let travel_itinerary = data.travel_itinerary || data.itinerary || data.travelItinerary;
    if (!Array.isArray(travel_itinerary) || travel_itinerary.length === 0) {
      // Attempt an extraction from the raw file text to capture nested lists (activities) reliably.
      const extracted = parseTravelItineraryFromText(content);
      if (Array.isArray(extracted) && extracted.length) travel_itinerary = extracted;
      else travel_itinerary = [];
    }

    const mapped = {
      title: data.title || data.name || data.url_key || path.basename(file, path.extname(file)),
      slug: data.url_key || data.slug || (data.title ? String(data.title).toLowerCase().replace(/[^a-z0-9-]+/g, '-') : undefined),
      description: data.description || null,
      startDate: safeParseDate(data.start_date) || null,
      endDate: safeParseDate(data.end_date) || null,
      period: periodFromRaw(data.start_date || data.startDate, data.end_date || data.endDate) || null,
      country: data.country || null,
      budget: data.budget ? { amount: data.budget.total ?? data.budget.amount ?? 0, currency: data.budget.currency || 'EUR' } : null,
      itinerary: mapItineraryBlocks(travel_itinerary || []),
      sourceFile: file,
      importedAt: new Date().toISOString(),
    };

    const outName = (mapped.slug || path.basename(file, path.extname(file))).replace(/[^a-z0-9-_]/gi, '_') + '.json';
    const outPath = path.join(OUT_DIR, outName);
    fs.writeFileSync(outPath, JSON.stringify(mapped, null, 2), 'utf8');
    console.log('Wrote:', outPath);
  } catch (err) {
    console.error('Failed to convert', file, err);
  }
});

