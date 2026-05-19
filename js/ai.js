// =============================================
// ai.js — Claude API 모듈
// =============================================

import { CONFIG } from './config.js';

// ── Mock 데이터 (날씨와 기후 — 중학교 지구과학) ──
const MOCK_RESPONSE = {
  ocr_text:
    '탐구하기 1. 날씨와 기후\n' +
    '날씨는 특정 시기, 장소에서의 대기의 상태, 즉 기온, 강수량, 바람, 구름 등을 의미한다. ' +
    '기온에 따라 더운 날씨, 추운 날씨가 나타나고, 강수량에 따라 습한 날씨, 건조한 날씨가 나타난다. ' +
    '기후는 어떤 지역에서 긴 기간에 걸쳐 평균적으로 나타나는 대기의 상태를 의미한다.\n' +
    '오늘의 날씨는 맑음이다. 지난 10년 동안 기온은 더 따뜻한 경향이 있었다.',

  content_type: '교과서',

  urgency:        '낮음',
  urgency_reason: '단원 학습 내용으로 즉각적인 조치가 필요하지 않음',

  curriculum_info:
    '중학교 1학년 과학 1단원 — 기후 환경과 인간 생활 (날씨와 기후의 차이, 기후 요소)',
  neis_schedule:
    '이번 달 과학 단원평가 예정 — 날씨와 기후 단원 포함 가능성 있음',

  student_ko:
    '날씨는 오늘처럼 하루하루 바뀌는 대기 상태예요. 예를 들어 "오늘 비가 온다"가 날씨예요. ' +
    '기후는 훨씬 긴 시간(보통 30년) 동안의 평균적인 대기 상태를 말해요. ' +
    '"우리나라는 여름에 덥고 비가 많이 온다"는 기후 얘기예요.',
  student_example:
    '베트남은 일 년 내내 더운 나라인데, 이건 기후예요. ' +
    '하지만 오늘 갑자기 소나기가 내리면 그건 날씨예요. 기후는 긴 흐름, 날씨는 오늘 하루!',

  parent_translation:
    'Bài học này phân biệt "thời tiết" và "khí hậu":\n' +
    '- Thời tiết (날씨): là trạng thái khí quyển trong ngày, thay đổi hàng ngày (nóng, lạnh, mưa, nắng).\n' +
    '- Khí hậu (기후): là đặc điểm thời tiết trung bình của một vùng trong thời gian dài (30 năm).\n' +
    'Ví dụ: Việt Nam có khí hậu nhiệt đới nóng ẩm, nhưng hôm nay thời tiết có thể mưa hoặc nắng.',
  parent_guide:
    '아이와 함께 오늘 날씨 앱을 켜서 "오늘 날씨"와 "이번 달 평균 기온"을 비교해 보세요. ' +
    '베트남의 계절과 한국의 계절 차이를 이야기하면 기후 개념을 자연스럽게 이해할 수 있어요.',

  family_mission:
    '오늘 저녁 창문을 열고 밖의 날씨를 함께 관찰하세요. ' +
    '"오늘 날씨 어때?"라고 묻고 아이가 설명하게 해보세요. ' +
    '그다음 "베트남 날씨는 어때?"를 물어서 두 나라의 기후 차이를 이야기해 보세요.',

  role_reversal_q:
    '"Con ơi, con có thể giải thích cho mẹ/bố sự khác nhau giữa \'thời tiết\' và \'khí hậu\' không? ' +
    'Tại sao Việt Nam nóng quanh năm còn Hàn Quốc lại có 4 mùa?"',
  role_reversal_hint:
    '날씨는 매일 바뀌고, 기후는 오래 변하지 않는다고 설명하면 정답이에요. ' +
    '베트남은 열대기후라 일 년 내내 덥고, 한국은 온대기후라 4계절이 있다고 말하도록 유도해 주세요.',
};

// ── NEIS Mock 데이터 ──────────────────────────
export const NEIS_MOCK = {
  schools: [
    {
      SCHUL_NM: '서울중학교',
      LCTN_SC_NM: '서울특별시',
      ORG_RDNMA: '서울특별시 중구 퇴계로 20길 42',
      ATPT_OFCDC_SC_CODE: 'B10',
      SD_SCHUL_CODE: '7130560',
    },
    {
      SCHUL_NM: '서울중앙중학교',
      LCTN_SC_NM: '서울특별시',
      ORG_RDNMA: '서울특별시 종로구 삼청로 108',
      ATPT_OFCDC_SC_CODE: 'B10',
      SD_SCHUL_CODE: '7130561',
    },
  ],
  schedule: [
    { AA_YMD: '20260504', EVENT_NM: '어린이날 대체공휴일' },
    { AA_YMD: '20260508', EVENT_NM: '어버이날 행사' },
    { AA_YMD: '20260515', EVENT_NM: '스승의 날' },
    { AA_YMD: '20260518', EVENT_NM: '1학기 중간고사 (과학 포함)' },
    { AA_YMD: '20260519', EVENT_NM: '1학기 중간고사 (사회 포함)' },
    { AA_YMD: '20260525', EVENT_NM: '체육대회' },
  ],
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