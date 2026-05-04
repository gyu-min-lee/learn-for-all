// =============================================
// ai.js — Claude API 모듈
// =============================================

import { CONFIG } from './config.js';

// ── Mock 데이터 ───────────────────────────────
// DEMO_MODE: true 이거나 API 호출 실패 시 반환
const MOCK_RESPONSE = {
  ocr_text:
    '3. 더 가까워지는 우리\n' +
    '교통수단이 발달하면서 사람들은 다른 지역으로 쉽게 이동할 수 있게 되었습니다. ' +
    '버스, 기차, 비행기를 이용하면 먼 곳도 빠르게 갈 수 있어요.',

  content_type: '교과서',

  urgency:        '낮음',
  urgency_reason: '단원 학습 내용으로 즉각적인 조치가 필요하지 않음',

  curriculum_info:
    '초등 3학년 사회 2학기 3단원 — 교통수단과 생활 변화',
  neis_schedule:
    '이번 달 말 사회 단원평가 예정 (담임 선생님 확인 필요)',

  student_ko:
    '교통수단(버스, 기차, 비행기)이 발달하면 다른 지역으로 더 빠르고 쉽게 이동할 수 있어요. ' +
    '교통이 좋아지면 다른 지역의 물건도 쉽게 받을 수 있고, ' +
    '멀리 사는 사람들과도 만나고 교류할 수 있어요.',
  student_example:
    '제주도에서 키운 귤이 우리 동네 마트까지 올 수 있는 것은 배와 트럭 같은 교통수단 덕분이에요. ' +
    '비행기가 있어서 할머니 댁에 빨리 갈 수 있는 것처럼요!',

  parent_translation:
    'Bài học này giải thích rằng khi giao thông phát triển (xe buýt, tàu hỏa, máy bay, tàu thuyền), ' +
    'chúng ta có thể di chuyển đến các vùng khác nhanh hơn và dễ dàng hơn. ' +
    'Nhờ giao thông, hàng hóa từ các vùng khác có thể đến tay chúng ta, ' +
    'và mọi người từ các vùng khác nhau có thể giao lưu và giúp đỡ lẫn nhau.',
  parent_guide:
    '아이와 함께 우리 집에 있는 물건들이 어디서 왔는지 이야기해 보세요. ' +
    '베트남에서 한국까지 어떤 교통수단으로 왔는지 경험을 나누면 아이가 더 쉽게 이해할 수 있습니다.',

  family_mission:
    '집에 있는 과일이나 물건 3개를 골라서 "이건 어디에서 왔을까? 어떻게 우리 집까지 왔을까?" 를 ' +
    '함께 추측해보고, 지도에서 그 지역 찾아보기.',

  role_reversal_q:
    '"Con ơi, con có thể giải thích cho mẹ/bố tại sao chúng ta có thể ăn trái cây từ Jeju ở đây không? ' +
    'Chúng đã đến đây bằng cách nào?"',
  role_reversal_hint:
    '제주도 귤이 우리 집까지 오려면 배와 트럭 같은 교통수단이 필요하다는 것을 설명하도록 유도해 주세요.',
};

// ── 프롬프트 생성 ─────────────────────────────
function buildPrompt(lang, grade) {
  return `당신은 다문화 가정 학부모와 학생을 위한 AI 교육 도우미입니다.
학년: ${grade}, 부모 언어: ${lang}

이미지를 분석하고 아래 JSON만 반환하세요. 마크다운이나 다른 텍스트 없이 순수 JSON만 반환합니다.

{
  "ocr_text": "이미지에서 인식된 텍스트 전체",
  "content_type": "교과서 또는 알림장",
  "urgency": "높음 또는 보통 또는 낮음",
  "urgency_reason": "긴급도 판단 이유 한 줄",
  "curriculum_info": "${grade} 교육과정에서 이 내용의 단원 위치 한 줄",
  "neis_schedule": "관련 단원평가·학사일정 예정 정보 (없으면 null)",
  "student_ko": "${grade} 수준 한국어 개념 설명 2~3문장",
  "student_example": "일상 예시로 쉽게 설명 1~2문장",
  "parent_translation": "${lang}로 번역한 핵심 내용",
  "parent_guide": "부모 지도 팁 한국어 2문장",
  "family_mission": "오늘 저녁 10분 가족 활동 구체적으로",
  "role_reversal_q": "자녀가 부모에게 설명하도록 유도하는 질문 (${lang}로)",
  "role_reversal_hint": "역할 역전 힌트 한국어"
}`;
}

// ── JSON 파싱 (마크다운 펜스 제거 후 2단계 시도) ──
function parseJSON(raw) {
  const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('AI 응답 파싱 실패 — 다시 시도해주세요.');
  }
}

// ── 실제 API 호출 ─────────────────────────────
async function callClaudeAPI({ imageBase64, mimeType, lang, grade }) {
  const res = await fetch(CONFIG.CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CONFIG.CLAUDE_API_KEY,
      'anthropic-version': CONFIG.CLAUDE_VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: CONFIG.CLAUDE_MODEL,
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data: imageBase64 },
          },
          {
            type: 'text',
            text: buildPrompt(lang, grade),
          },
        ],
      }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message ?? `API 오류 (${res.status})`);
  }

  const data = await res.json();
  const raw  = data.content?.[0]?.text ?? '';
  return parseJSON(raw);
}

// ── 공개 인터페이스 ───────────────────────────
// DEMO_MODE / API 실패 시 mock 반환으로 앱이 죽지 않음
export async function analyzeImage({ imageBase64, mimeType, lang, grade }) {

  // 1. 데모 모드 → mock 즉시 반환
  if (CONFIG.DEMO_MODE) {
    await new Promise(r => setTimeout(r, 1200)); // 로딩 느낌
    console.info('[AI] DEMO_MODE: mock 데이터 반환');
    return MOCK_RESPONSE;
  }

  // 2. 실제 API 호출 → 실패 시 mock fallback
  try {
    return await callClaudeAPI({ imageBase64, mimeType, lang, grade });
  } catch (err) {
    console.warn('[AI] API 호출 실패, mock fallback 반환:', err.message);
    return MOCK_RESPONSE;
  }
}
