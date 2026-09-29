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
const query = encodeURIComponent('*[_type == "era"]{_id, name, year}');
const url = `https://${env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${env.NEXT_PUBLIC_SANITY_DATASET}?query=${query}`;

const req = https.get(url, {
  headers: {
    Authorization: `Bearer ${env.SANITY_API_READ_TOKEN}`
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const json = JSON.parse(data);
      console.log('Result:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Raw:', data);
    }
  });
});
req.on('error', (err) => console.error('Error:', err));
