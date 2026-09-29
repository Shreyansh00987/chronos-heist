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
const req = https.get('https://api.sanity.io/v2024-01-01/projects', {
  headers: {
    Authorization: `Bearer ${env.SANITY_API_WRITE_TOKEN}`
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('User projects Status:', res.statusCode);
    try {
      const json = JSON.parse(data);
      console.log('Projects:', JSON.stringify(json.map(p => ({id: p.id, displayName: p.displayName})), null, 2));
    } catch (e) {
      console.log('Raw:', data);
    }
  });
});
req.on('error', (err) => console.error('Error:', err));
