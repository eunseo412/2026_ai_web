const fs = require('fs');
const path = require('path');

const REAL_STATIC_PARKING_LOTS = [
  {
    id: 'real-seoul-01',
    name: '서울역 공항철도 주차장',
    type: 'public',
    parkingType: '노외',
    address: '서울특별시 중구 청파로 378',
    totalSpaces: 124,
    operatingDays: '평일+토요일+공휴일',
    weekdayStart: '00:00', weekdayEnd: '23:59',
    satStart: '00:00', satEnd: '23:59',
    holidayStart: '00:00', holidayEnd: '23:59',
    feeType: '유료',
    basicTime: 30, basicFee: 2000,
    addUnitTime: 10, addUnitFee: 500,
    dayFee: 25000,
    paymentMethod: '신용카드',
    disabledSpaces: true,
    phone: '02-362-7788',
    lat: 37.5542, lng: 126.9708,
    source: 'local_real_database'
  },
  {
    id: 'real-seoul-02',
    name: '서소문역사공원 공영주차장',
    type: 'public',
    parkingType: '노외',
    address: '서울특별시 중구 칠패로 5',
    totalSpaces: 184,
    operatingDays: '평일+토요일+공휴일',
    weekdayStart: '09:00', weekdayEnd: '22:00',
    satStart: '09:00', satEnd: '19:00',
    holidayStart: '09:00', holidayEnd: '19:00',
    feeType: '유료',
    basicTime: 5, basicFee: 400,
    addUnitTime: 5, addUnitFee: 400,
    dayFee: 20000,
    paymentMethod: '신용카드',
    disabledSpaces: true,
    phone: '02-313-0987',
    lat: 37.5585, lng: 126.9692,
    source: 'local_real_database'
  },
  {
    id: 'real-seoul-03',
    name: '서울역 서부역 공영주차장',
    type: 'public',
    parkingType: '노상',
    address: '서울특별시 중구 만리재로 205',
    totalSpaces: 35,
    operatingDays: '평일+토요일',
    weekdayStart: '09:00', weekdayEnd: '19:00',
    satStart: '09:00', satEnd: '15:00',
    holidayStart: '00:00', holidayEnd: '00:00',
    feeType: '유료',
    basicTime: 5, basicFee: 250,
    addUnitTime: 5, addUnitFee: 250,
    dayFee: null,
    paymentMethod: '신용카드',
    disabledSpaces: false,
    phone: '02-2290-6114',
    lat: 37.5528, lng: 126.9682,
    source: 'local_real_database'
  }
];

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
const searchRadius = 500;

const jsonPath = path.join(__dirname, 'public', 'data', 'parking_lots.json');
const fileContent = fs.readFileSync(jsonPath, 'utf8');
const candidateLots = JSON.parse(fileContent);

const mergedLotsMap = new Map();
candidateLots.forEach(lot => {
  mergedLotsMap.set(lot.name.trim(), lot);
});

REAL_STATIC_PARKING_LOTS.forEach(lot => {
  const dist = getDistance(targetLat, targetLng, lot.lat, lot.lng);
  if (dist <= searchRadius) {
    const isDuplicate = Array.from(mergedLotsMap.keys()).some(
      apiName => apiName.includes(lot.name) || lot.name.includes(apiName)
    );
    if (!isDuplicate) {
      mergedLotsMap.set(lot.name, lot);
    }
  }
});

const finalLots = Array.from(mergedLotsMap.values());

const results = finalLots
  .map(lot => {
    const dist = getDistance(targetLat, targetLng, lot.lat, lot.lng);
    return {
      ...lot,
      distance: dist
    };
  })
  .filter(lot => lot.distance <= searchRadius);

console.log(`Total lots in radius ${searchRadius}m: ${results.length}`);
results.forEach((l, idx) => {
  console.log(`  ${idx+1}. ${l.name} (${l.distance}m) - Source: ${l.source || 'cache'}`);
});
