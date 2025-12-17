#!/usr/bin/env node
/*
  Simple importer script that posts JSON files from cms/imports/polarsteps/
  into the running Payload CMS via the REST API.

  Usage (PowerShell):
    $env:IMPORT_ADMIN_EMAIL = 'admin@example.com';
    $env:IMPORT_ADMIN_PASSWORD = 's3cret';
    node .\scripts\importPolarstepsToPayload.cjs

  Environment variables:
    IMPORT_ADMIN_EMAIL (required) - admin user's email
    IMPORT_ADMIN_PASSWORD (required) - admin user's password
    CMS_URL (optional) - base URL where the CMS is reachable (default: http://localhost:3000)
    DRY_RUN (optional) - if set to '1' will not POST, only show what would be sent
*/

const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const CMS_URL = process.env.CMS_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.IMPORT_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.IMPORT_ADMIN_PASSWORD;
const DRY_RUN = process.env.DRY_RUN === '1';

if (!DRY_RUN && (!ADMIN_EMAIL || !ADMIN_PASSWORD)) {
  console.error('ERROR: set IMPORT_ADMIN_EMAIL and IMPORT_ADMIN_PASSWORD environment variables before running (or run with DRY_RUN=1).');
  process.exit(1);
}

async function fetchWithCookies(url, opts = {}, cookieJar = {}) {
  // Minimal fetch wrapper using built-in fetch (Node 18+). Preserves cookies between requests using cookieJar object.
  const headers = Object.assign({}, opts.headers || {});
  if (cookieJar.cookie) headers['Cookie'] = cookieJar.cookie;
  const res = await fetch(url, Object.assign({}, opts, { headers }));
  // Capture set-cookie
  const sc = res.headers.get('set-cookie');
  if (sc) {
    // keep the raw value; for Payload we only need the payload-token cookie presented back
    // If there are multiple cookies, join them
    cookieJar.cookie = sc.split(/, (?=[^ ;]+=)/).map(c=>c.split(';')[0]).join('; ');
  }
  return res;
}

async function login(cookieJar) {
  const loginUrl = new URL('/api/users/login', CMS_URL).toString();
  console.log('Logging in to', loginUrl, 'as', ADMIN_EMAIL);
  const res = await fetchWithCookies(loginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  }, cookieJar);

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Login failed: ${res.status} ${res.statusText}\n${txt}`);
  }
  console.log('Login ok, cookieJar:', cookieJar.cookie ? '[has cookie]' : '[no cookie]');
}

async function importFiles() {
  const importDir = path.resolve(__dirname, '..', 'imports', 'polarsteps');
  if (!fs.existsSync(importDir)) {
    console.error('Import directory not found:', importDir);
    process.exit(1);
  }
  const files = fs.readdirSync(importDir).filter(f => f.endsWith('.json'));
  if (!files.length) {
    console.log('No JSON files found in', importDir);
    return;
  }

  const cookieJar = {};
  if (!DRY_RUN) {
    await login(cookieJar);
  } else {
    console.log('DRY_RUN set, skipping login and POSTs — only previewing payloads');
  }

  // Helper: find existing country by name or create a minimal one
  async function findOrCreateCountry(name) {
    if (!name) return null;
    if (DRY_RUN) {
      console.log('[DRY_RUN] would resolve country:', name);
      return null;
    }
    // Try to find
    const findUrl = new URL(`/api/countries?where[name][equals]=${encodeURIComponent(name)}&limit=1`, CMS_URL).toString();
    try {
      const res = await fetchWithCookies(findUrl, { method: 'GET' }, cookieJar);
      if (res.ok) {
        const json = await res.json();
        if (json && json.totalDocs > 0 && Array.isArray(json.docs) && json.docs[0].id) return json.docs[0].id;
      }
    } catch (e) {
      // ignore
    }
    // Not found — create a minimal country document (name only)
    try {
      const createUrl = new URL('/api/countries', CMS_URL).toString();
      const res2 = await fetchWithCookies(createUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      }, cookieJar);
      if (res2.ok) {
        const created = await res2.json();
        return created.id || created._id || null;
      }
    } catch (e) {
      // ignore
    }
    return null;
  }

  for (const file of files) {
    const full = path.join(importDir, file);
    console.log('Reading', full);
    const raw = fs.readFileSync(full, 'utf8');
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error('Invalid JSON in', full, e.message);
      continue;
    }
    // Strip any incoming id/slug/timestamps — Payload will enforce uniqueness on create.
    // Some exported JSON files include an `id`, `_id`, `slug`, or timestamps from the source; remove them so the CMS assigns new values.
    if (data) {
      if (data.id) delete data.id;
      if (data._id) delete data._id;
      if (data.slug) delete data.slug;
      if (data.createdAt) delete data.createdAt;
      if (data.updatedAt) delete data.updatedAt;
    }

    // Remove any string-valued id/_id fields inside the document (these often come from the exporter)
    // Keep numeric ids (used for relations) intact.
    function stripStringIds(obj) {
      if (!obj || typeof obj !== 'object') return;
      if (Array.isArray(obj)) {
        for (const item of obj) stripStringIds(item);
        return;
      }
      for (const k of Object.keys(obj)) {
        const v = obj[k];
        if ((k === 'id' || k === '_id') && typeof v === 'string') {
          delete obj[k];
          continue;
        }
        if (typeof v === 'object' && v !== null) stripStringIds(v);
      }
    }
    stripStringIds(data);

    // Always set a cover image relation so validation passes (you can change in UI later)
    data.coverImage = { id: 9 };

    // Resolve country name -> numeric id for countries array (updated schema - now multiple countries)
    if (data.country && typeof data.country === 'string') {
      const cid = await findOrCreateCountry(data.country);
      if (cid) {
        // Convert single country to countries array
        data.countries = [cid];
      } else {
        // Fallback to Jordan (id: 5) if resolution fails
        data.countries = [5];
      }
      // Remove old singular country field
      delete data.country;
    }

    // Ensure itinerary blocks include required fields and match new schema
    if (Array.isArray(data.itinerary)) {
      for (const block of data.itinerary) {
        if (block && block.blockType === 'fullDay') {
          if (!block.locationName) block.locationName = 'Unknown location';
          
          // Normalize location into GeoJSON Point expected by Payload/PostGIS
          // Payload expects an object with a `type` (e.g. 'Point') and `coordinates` [lng, lat]
          if (block.location && Array.isArray(block.location.coordinates) && block.location.coordinates.length === 2) {
            const coords = block.location.coordinates;
            block.location = { type: 'Point', coordinates: coords };
          }
          
          // Map old field names to new schema if needed
          if (block.day && !block.time) {
            block.time = `Day ${block.day}`;
          }
          
          // Add empty gallery array if not present (simplified schema)
          if (!block.gallery) {
            block.gallery = [];
          }
        }
      }
    }

    // Set default values for new required fields
    if (!data.status) {
      data.status = 'draft'; // Set to draft by default
    }

    const url = new URL('/api/trips', CMS_URL).toString();
    console.log('\n==> Importing', file, '->', url);
    if (DRY_RUN) {
      console.log(JSON.stringify(data, null, 2).slice(0, 1000));
      continue;
    }

    const res = await fetchWithCookies(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }, cookieJar);

    const body = await res.text();
    if (!res.ok) {
      console.error('Failed to import', file, res.status, res.statusText, '\n', body);
    } else {
      console.log('Imported', file, '->', res.statusText);
      try {
        const json = JSON.parse(body);
        console.log('Created id:', json.id || json._id || json);
      } catch (e) {
        console.log('Response:', body.slice(0, 500));
      }
    }
  }
}

importFiles().catch(err => {
  console.error('Import script error:', err);
  process.exit(1);
});

