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

const targetLat = 37.5559;
const targetLng = 126.9723;

const jsonPath = path.join(__dirname, 'public', 'data', 'parking_lots.json');
if (!fs.existsSync(jsonPath)) {
  console.log("No cache file found!");
  process.exit(1);
}

const fileContent = fs.readFileSync(jsonPath, 'utf8');
const candidateLots = JSON.parse(fileContent);
console.log(`Loaded ${candidateLots.length} parking lots.`);

[500, 1000, 2000].forEach(radius => {
  const nearby = candidateLots.filter(lot => {
    const d = getDistance(targetLat, targetLng, lot.lat, lot.lng);
    return d <= radius;
  });
  console.log(`Radius ${radius}m: found ${nearby.length} parking lots.`);
  if (radius === 500) {
    nearby.forEach((lot, i) => {
      console.log(`  ${i+1}. ${lot.name} (${getDistance(targetLat, targetLng, lot.lat, lot.lng)}m) - Source: ${lot.source || 'cache'}`);
    });
  }
});
