const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'public', 'data', 'parking_lots.json');
const candidateLots = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const targetNames = ['공항철도', '서소문역사공원', '서부역'];

targetNames.forEach(tName => {
  console.log(`Searching for "${tName}" in cache...`);
  const matches = candidateLots.filter(lot => lot.name.includes(tName));
  if (matches.length === 0) {
    console.log("  No matches found in cache.");
  } else {
    matches.forEach(m => {
      console.log(`  Match: ${m.name}`);
      console.log(`    Coords: Lat ${m.lat}, Lng ${m.lng}`);
      console.log(`    Address: ${m.address}`);
    });
  }
});
