// =============================================
// neis.js — NEIS 공공데이터 API 모듈
// =============================================

import { CONFIG } from './config.js';
import { NEIS_MOCK } from './ai.js';

// 이번 달 from/to 날짜 계산
function getMonthRange() {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(y, today.getMonth() + 1, 0).getDate();
  return {
    from: `${y}${m}01`,
    to:   `${y}${m}${String(lastDay).padStart(2, '0')}`,
  };
}

// NEIS API 공통 fetch 래퍼
async function neisGet(endpoint, params) {
  const query = new URLSearchParams({
    KEY:    CONFIG.NEIS_API_KEY,
    Type:   'json',
    pIndex: 1,
    pSize:  CONFIG.NEIS_PAGE_SIZE,
    ...params,
  });
  const res = await fetch(`${CONFIG.NEIS_BASE_URL}/${endpoint}?${query}`);
  if (!res.ok) throw new Error(`NEIS 요청 실패 (${res.status})`);
  return res.json();
}

// 학교 검색
export async function searchSchool(name) {
  if (CONFIG.DEMO_MODE) {
    await new Promise(r => setTimeout(r, 400));
    const filtered = NEIS_MOCK.schools.filter(s =>
      s.SCHUL_NM.includes(name) || name.length <= 2
    );
    return filtered.length > 0 ? filtered : NEIS_MOCK.schools;
  }

  try {
    const data = await neisGet('schoolInfo', {
      SCHUL_NM: name,
      pSize:    CONFIG.MAX_SCHOOL_RESULTS,
    });
    return data.schoolInfo?.[1]?.row ?? [];
  } catch (err) {
    console.warn('[NEIS] 학교 검색 실패, mock fallback:', err.message);
    return NEIS_MOCK.schools;
  }
}

// 이번 달 학사일정 조회
export async function getMonthlySchedule(officeCode, schoolCode) {
  if (CONFIG.DEMO_MODE) {
    await new Promise(r => setTimeout(r, 600));
    return NEIS_MOCK.schedule;
  }

  const { from, to } = getMonthRange();
  try {
    const data = await neisGet('SchoolSchedule', {
      ATPT_OFCDC_SC_CODE: officeCode,
      SD_SCHUL_CODE:      schoolCode,
      AA_FROM_YMD:        from,
      AA_TO_YMD:          to,
    });
    return data.SchoolSchedule?.[1]?.row ?? [];
  } catch (err) {
    console.warn('[NEIS] 학사일정 조회 실패, mock fallback:', err.message);
    return NEIS_MOCK.schedule;
  }
}