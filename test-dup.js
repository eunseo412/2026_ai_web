const fs = require('fs');
const path = require('path');

const REAL_STATIC_PARKING_LOTS = [
  { name: '서울역 공항철도 주차장' },
  { name: '서소문역사공원 공영주차장' },
  { name: '서울역 서부역 공영주차장' }
];

const jsonPath = path.join(__dirname, 'public', 'data', 'parking_lots.json');
const candidateLots = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const cacheNames = candidateLots.map(lot => lot.name.trim());

REAL_STATIC_PARKING_LOTS.forEach(lot => {
  console.log(`Checking duplicates for "${lot.name}":`);
  
  // Find which cached name causes isDuplicate to be true
  const matchingCachedNames = cacheNames.filter(apiName => {
    return apiName.includes(lot.name) || lot.name.includes(apiName);
  });
  
  console.log(`  Number of matches: ${matchingCachedNames.length}`);
  if (matchingCachedNames.length > 0) {
    console.log(`  Sample matches (first 10):`, matchingCachedNames.slice(0, 10));
  }
});
