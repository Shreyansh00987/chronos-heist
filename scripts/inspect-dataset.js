const fs = require('fs');
const lines = fs.readFileSync('.env.local', 'utf8').split(/\r?\n/);
const env = {};
for (const l of lines) {
  const idx = l.indexOf('=');
  if (idx > 0) {
    let val = l.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[l.slice(0, idx).trim()] = val;
  }
}

const https = require('https');
const query = encodeURIComponent('*[]{ _type, _id, name, title }');
const url = `https://${env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${env.NEXT_PUBLIC_SANITY_DATASET}?query=${query}`;

https.get(url, {
  headers: { Authorization: `Bearer ${env.SANITY_API_WRITE_TOKEN}` }
}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const json = JSON.parse(data);
    const types = {};
    for (const doc of (json.result || [])) {
      types[doc._type] = (types[doc._type] || 0) + 1;
    }
    console.log('Doc counts by type:', types);
  });
});
