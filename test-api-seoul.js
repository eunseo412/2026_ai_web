const fs = require('fs');
const path = require('path');

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[key] = value.trim();
    }
  });
  return env;
}

async function run() {
  const env = loadEnv();
  const rawKey = env.DATA_GO_KR_API_KEY || '';
  const apiKey = rawKey.replace(/^['"]|['"]$/g, '').trim();

  const targetLat = 37.5559;
  const targetLng = 126.9723;
  const addressName = '서울특별시 중구 한강대로 405 (서울역)';

  console.log("Starting API test for Seoul Station...");
  console.log("API Key Length:", apiKey.length);

  let cityProvince = '서울특별시';
  let cleanDistrict = '중구';
  let fullDistrict = '서울특별시 중구';

  const finalServiceKey = apiKey.includes('%') ? apiKey : encodeURIComponent(apiKey);
  const baseQueryUrl = `http://api.data.go.kr/openapi/tn_pubr_prkplce_info_api?serviceKey=${finalServiceKey}&type=json&numOfRows=1000`;

  const queryUrls = [];
  queryUrls.push({ name: '구단위 매칭', url: `${baseQueryUrl}&lnmadr=${encodeURIComponent(fullDistrict)}` });
  queryUrls.push({ name: '시단위 매칭', url: `${baseQueryUrl}&lnmadr=${encodeURIComponent(cityProvince)}` });
  queryUrls.push({ name: '무필터 전체', url: baseQueryUrl });

  for (const q of queryUrls) {
    console.log(`Trying: ${q.name}`);
    try {
      const res = await fetch(q.url);
      if (!res.ok) {
        console.log(`  Failed with status: ${res.status}`);
        continue;
      }
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.log(`  JSON parse failed. Response text length: ${text.length}`);
        if (text.includes("SERVICE_KEY_IS_NOT_REGISTERED_ERROR")) {
          console.log("  🚨 SERVICE_KEY_IS_NOT_REGISTERED_ERROR! Your API Key is invalid or not yet approved.");
        } else if (text.includes("LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDED_ERROR")) {
          console.log("  🚨 LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDED_ERROR! Rate limit exceeded.");
        } else {
          console.log("  Raw Text sample:", text.substring(0, 200));
        }
        continue;
      }

      const itemsNode = data?.response?.body?.items ?? data?.response?.body?.item;
      let items = [];
      if (itemsNode) {
        if (Array.isArray(itemsNode)) items = itemsNode;
        else if (itemsNode.item) items = Array.isArray(itemsNode.item) ? itemsNode.item : [itemsNode.item];
      }

      console.log(`  Success! Got ${items.length} items.`);
      if (items.length > 0) {
        // filter by distance
        const nearby = items
          .filter(item => item.latitude && item.longitude)
          .map(item => ({
            name: item.prkplceNm,
            address: item.rdnmadr || item.lnmadr,
            lat: parseFloat(item.latitude),
            lng: parseFloat(item.longitude),
            distance: getDistance(targetLat, targetLng, parseFloat(item.latitude), parseFloat(item.longitude))
          }))
          .filter(lot => lot.distance <= 500);

        console.log(`  Nearby lots within 500m: ${nearby.length}`);
        nearby.forEach((l, idx) => {
          console.log(`    ${idx+1}. ${l.name} (${l.distance}m) - Lat ${l.lat}, Lng ${l.lng}`);
        });
        break;
      }
    } catch (e) {
      console.log(`  Network error: ${e.message}`);
    }
  }
}

run();
