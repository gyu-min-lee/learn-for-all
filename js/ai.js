// =============================================
// ai.js — Claude API 모듈
// =============================================

import { CONFIG } from './config.js';
import { MOCK_RESPONSE } from './mock.js';

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