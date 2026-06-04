const fs = require('fs');
const path = require('path');

// Manually parse .env file to set process.env.GEMINI_API_KEY so we simulate Next.js environment
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*GEMINI_API_KEY\s*=\s*["']?(.*?)["']?\s*$/);
      if (match) {
        process.env.GEMINI_API_KEY = match[1];
        break;
      }
    }
  }
} catch (err) {}

const requestBody = {
  destinationName: "부산역",
  parkingLots: [
    {
      id: "real-busan-01",
      name: "부산역 광장 공영주차장",
      type: "public",
      parkingType: "노외",
      address: "부산광역시 동구 중앙대로 206",
      totalSpaces: 90,
      operatingDays: "평일+토요일+공휴일",
      weekdayStart: "00:00",
      weekdayEnd: "23:59",
      satStart: "00:00",
      satEnd: "23:59",
      holidayStart: "00:00",
      holidayEnd: "23:59",
      feeType: "유료",
      basicTime: 30,
      basicFee: 1500,
      addUnitTime: 10,
      addUnitFee: 500,
      dayFee: 15000,
      paymentMethod: "신용카드,현금",
      disabledSpaces: true,
      phone: "051-463-5011",
      lat: 35.1155,
      lng: 129.0415,
      distance: 196,
      isOpen: true,
      operatingHoursToday: "평일 00:00 ~ 23:59 (24시간)",
      estimatedFee: 9000,
      feeDisplay: "9,000원",
      source: "local_real_database"
    }
  ],
  searchParams: {
    date: "2026-06-04",
    time: "23:00",
    duration: 180,
    radius: 500
  }
};

// We will use standard node-fetch (Next.js server is expected to be running on port 3000)
async function testRecommendEndpoint() {
  console.log('📡 Calling http://localhost:3000/api/recommend ...');
  try {
    const response = await fetch('http://localhost:3000/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 Response Status:', response.status);
    const data = await response.json();
    console.log('📥 Response Body:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error calling endpoint:', error.message);
  }
}

testRecommendEndpoint();
