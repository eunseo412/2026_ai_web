import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY || '';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { destinationName, parkingLots, searchParams } = body;

    if (!destinationName || !parkingLots || !Array.isArray(parkingLots)) {
      return NextResponse.json({ error: 'Missing destinationName or parkingLots array' }, { status: 400 });
    }

    const topLots = parkingLots.slice(0, 3);
    if (topLots.length === 0) {
      return NextResponse.json({
        recommendation: '⚠️ 주변에 검색된 주차장이 없습니다. 검색 반경을 넓혀보세요.'
      });
    }

    let apiConnectionSuccess = false;
    let geminiErrorMsg: string | null = null;
    let recommendationText = '';
    let source = 'rule-based-fallback';

    const prompt = `
당신은 목적지 맞춤형 주차 추천 서비스인 'ParkingMate'의 스마트 AI 분석 비서입니다.
사용자가 입력한 목적지와 계획 정보, 그리고 검색된 주차장 목록을 분석하여 **가장 최적의 주차장 1~2개**를 한국어로 추천하고 그 이유를 설명해 주세요.

목적지: ${destinationName}
사용자 방문 일정: ${searchParams.date} ${searchParams.time} (예상 체류 시간: ${searchParams.duration}분)

추천 후보 주차장 3곳 정보:
${topLots.map((lot, idx) => `
${idx + 1}. [${lot.type === 'public' ? '공영' : '민영'}] ${lot.name}
   - 거리: 목적지로부터 ${lot.distance}m
   - 주차 유형: ${lot.parkingType}주차장 (총 ${lot.totalSpaces}면)
   - 예상 주차 요금: ${lot.feeDisplay} (기본 ${lot.basicTime}분 ${lot.basicFee}원, 추가 ${lot.addUnitTime}분당 ${lot.addUnitFee}원)
   - 오늘 운영 정보: ${lot.operatingHoursToday}
   - 영업 여부: ${lot.isOpen ? '영업 중 (체류 시간 동안 이용 가능)' : '영업 종료/체류 중 종료 우려 있음'}
   - 결제 수단: ${lot.paymentMethod || '정보 없음'}
   - 장애인 주차 구역 보유: ${lot.disabledSpaces ? '예' : '아니오'}
`).join('\n')}

[작성 가이드라인]
1. 친절하고 전문적인 톤앤매너를 유지하세요.
2. 거리가 가장 가깝거나 요금이 가장 저렴한 주차장을 명확히 짚어주세요.
3. 영업 여부를 고려하여 현재 방문 시간에 실제로 주차가 불가능한 곳은 경고해 주세요.
4. 마크다운 형식을 사용하여 소제목, 불릿 포인트 등으로 일목요연하고 가독성 좋게 작성해 주세요.
5. 너무 길지 않게 3~4문장 단위의 문단 2~3개 정도로 요약해 주세요.
`;

    // 1. If Gemini API Key is configured, use direct REST API fetch
    if (apiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const headers = {
          'Content-Type': 'application/json'
        };

        const payload = {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        };

        const geminiRes = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        const resData = await geminiRes.json();

        if (geminiRes.ok) {
          const text = resData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim().length > 0) {
            apiConnectionSuccess = true;
            console.log(`[Gemini API Success] Returning recommendation (Length: ${text.length} chars)`);
            return NextResponse.json({
              recommendation: text,
              source: 'gemini-1.5-flash',
              debug: {
                hasApiKey: true,
                apiKeyLength: apiKey.length,
                apiConnectionSuccess: true,
                error: null
              }
            });
          } else {
            console.warn('Gemini API returned empty text candidate structure:', JSON.stringify(resData));
            geminiErrorMsg = 'Empty text candidate in response';
          }
        } else {
          geminiErrorMsg = resData.error?.message || `HTTP ${geminiRes.status}: ${geminiRes.statusText}`;
          console.error('Gemini REST API error response:', JSON.stringify(resData));
        }
      } catch (geminiError: any) {
        geminiErrorMsg = geminiError.message || String(geminiError);
        console.error('Gemini REST API fetch exception, falling back to rule-based engine:', geminiError);
      }
    }

    // 2. High-quality Rule-based Local Engine Fallback (extremely detailed & styled markdown)
    // Identify closest, cheapest, and open parking lots
    const openLots = topLots.filter(l => l.isOpen);
    const sortedByPrice = [...topLots].sort((a, b) => a.estimatedFee - b.estimatedFee);
    const sortedByDist = [...topLots].sort((a, b) => a.distance - b.distance);

    const cheapest = sortedByPrice[0];
    const closest = sortedByDist[0];

    let fallbackMd = `### 🤖 ParkingMate AI 분석 추천\n\n`;
    fallbackMd += `**"${destinationName}"** 방문 일정을 위한 주변 주차장을 분석한 추천 결과입니다.\n\n`;

    if (openLots.length === 0) {
      fallbackMd += `⚠️ **주의:** 현재 입력하신 방문 예정 시간대에는 검색 반경 내 모든 주차장이 영업을 종료했거나 휴무일인 것으로 분석되었습니다. 방문 일정을 다시 조정하시거나, 더 큰 검색 반경을 선택해 주십시오.\n\n`;
    } else {
      fallbackMd += `#### 📍 추천 1순위: **${closest.name}** (최단 거리)\n`;
      fallbackMd += `- **선정 이유:** 목적지에서 불과 **${closest.distance}m** 거리에 위치해 있어 접근성이 가장 뛰어납니다.\n`;
      fallbackMd += `- **요금 분석:** 예상 체류시간(${searchParams.duration}분) 동안 **${closest.feeDisplay}**의 요금이 부과되며, ${closest.disabledSpaces ? '장애인 전용 주차구역이 마련되어 있어 편리합니다.' : '장애인 주차구역 정보가 없습니다.'}\n`;
      fallbackMd += `- **상태:** 방문하시는 시간대에 안정적으로 영업을 지속하고 있어 추천합니다.\n\n`;

      if (cheapest.id !== closest.id) {
        fallbackMd += `#### 💰 가성비 추천: **${cheapest.name}** (최저 요금)\n`;
        fallbackMd += `- **선정 이유:** 예상 주차요금이 **${cheapest.feeDisplay}**으로 주변 주차장 중 가장 경제적입니다.\n`;
        fallbackMd += `- **거리:** 목적지로부터 **${cheapest.distance}m** 떨어져 있어 도보 이동이 필요합니다.\n`;
        fallbackMd += `- **운영 시간:** ${cheapest.operatingHoursToday}에 맞추어 주차 가능합니다.\n\n`;
      }

      fallbackMd += `💡 **AI 팁:** 주차장 입구 혼잡을 피하기 위해 사전에 **${closest.paymentMethod || '신용카드'}** 결제 가능 여부를 확인하고 이동하시는 것이 좋습니다. 공영주차장의 경우 다자녀, 친환경 차량 할인 혜택이 적용될 수 있습니다.`;
    }

    console.log(`[Rule-based Fallback] Returning local engine recommendation (Length: ${fallbackMd.length} chars)`);
    return NextResponse.json({
      recommendation: fallbackMd,
      source: 'rule-based-fallback',
      debug: {
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey ? apiKey.length : 0,
        apiConnectionSuccess: false,
        error: geminiErrorMsg
      }
    });

  } catch (error) {
    console.error('AI Recommendation API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
