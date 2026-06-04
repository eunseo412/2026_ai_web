const fs = require('fs');
const path = require('path');

const targetLat = 37.5559;
const targetLng = 126.9723;

const jsonPath = path.join(__dirname, 'public', 'data', 'parking_lots.json');
const candidateLots = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2) * Math.sin(dLng/2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

console.log("Seoul Station Target:", targetLat, targetLng);
const nearby = candidateLots.filter(lot => getDistance(targetLat, targetLng, lot.lat, lot.lng) <= 500);

nearby.forEach((lot, i) => {
  console.log(`${i+1}. Name: ${lot.name}`);
  console.log(`   Address: ${lot.address}`);
  console.log(`   Coords: Lat ${lot.lat}, Lng ${lot.lng}`);
  console.log(`   Computed Distance: ${getDistance(targetLat, targetLng, lot.lat, lot.lng)}m`);
});
