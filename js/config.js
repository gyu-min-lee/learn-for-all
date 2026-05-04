// =============================================
// config.js — 환경 설정
//
// ⚠️  보안 경고 (SECURITY WARNING)
// -----------------------------------------------
// 이 파일의 API Key는 브라우저에서 직접 노출됩니다.
// 누구든 개발자 도구 → Network 탭에서 확인 가능해요.
//
// ✅ 현재 용도: 공모전 데모 (단기 사용, 심사 후 키 폐기)
// ✅ API Key 없이 시연하려면 DEMO_MODE: true 설정
//
// 🔒 실제 서비스 배포 시 권장 구조:
//   브라우저 → 내 Proxy 서버 → Anthropic API
//   (API Key는 서버 환경변수에만 저장)
//
//   예시 (Node.js / Express):
//   app.post('/api/analyze', async (req, res) => {
//     const result = await anthropic.messages.create({
//       apiKey: process.env.CLAUDE_API_KEY,
//       ...req.body
//     });
//     res.json(result);
//   });
// =============================================

// ── API Key (향후 백엔드 이전 시 이 블록만 제거) ──
const API_KEYS = {
  CLAUDE: 'YOUR_CLAUDE_API_KEY_HERE',
  NEIS:   'sample',
};

export const CONFIG = {
  // -------------------------------------------
  // 🎛️  DEMO_MODE
  // true  → API 호출 없이 mock 데이터 반환
  // false → 실제 Claude API 호출
  // -------------------------------------------
  DEMO_MODE: true,

  CLAUDE_API_KEY:  API_KEYS.CLAUDE,
  CLAUDE_MODEL:    'claude-opus-4-5',
  CLAUDE_API_URL:  'https://api.anthropic.com/v1/messages',
  CLAUDE_VERSION:  '2023-06-01',

  NEIS_API_KEY:    API_KEYS.NEIS,
  NEIS_BASE_URL:   'https://open.neis.go.kr/hub',
  NEIS_PAGE_SIZE:  20,

  MAX_SCHEDULE_DISPLAY: 6,
  MAX_SCHOOL_RESULTS:   10,
};
