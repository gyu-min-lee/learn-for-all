// =============================================
// mock.js — 데모용 Mock 데이터 (순환 참조 방지)
// =============================================

export const MOCK_RESPONSE = {
  ocr_text:
    '탐구하기 1. 날씨와 기후\n' +
    '날씨는 특정 시기, 장소에서의 대기의 상태, 즉 기온, 강수량, 바람, 구름 등을 의미한다. ' +
    '기온에 따라 더운 날씨, 추운 날씨가 나타나고, 강수량에 따라 습한 날씨, 건조한 날씨가 나타난다. ' +
    '기후는 어떤 지역에서 긴 기간에 걸쳐 평균적으로 나타나는 대기의 상태를 의미한다.\n' +
    '오늘의 날씨는 맑음이다. 지난 10년 동안 기온은 더 따뜻한 경향이 있었다.',
  content_type: '교과서',
  urgency: '낮음',
  urgency_reason: '단원 학습 내용으로 즉각적인 조치가 필요하지 않음',
  curriculum_info: '중학교 1학년 과학 1단원 — 기후 환경과 인간 생활 (날씨와 기후의 차이, 기후 요소)',
  neis_schedule: '이번 달 과학 단원평가 예정 — 날씨와 기후 단원 포함 가능성 있음',
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