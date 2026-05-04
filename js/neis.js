// =============================================
// neis.js — NEIS 공공데이터 API 모듈
// =============================================

import { CONFIG } from './config.js';

// 이번 달 from/to 날짜 계산
function getMonthRange() {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(y, today.getMonth() + 1, 0).getDate();
  return {
    from: `${y}${m}01`,
    to: `${y}${m}${String(lastDay).padStart(2, '0')}`,
  };
}

// NEIS API 공통 fetch 래퍼
async function neisGet(endpoint, params) {
  const query = new URLSearchParams({
    KEY: CONFIG.NEIS_API_KEY,
    Type: 'json',
    pIndex: 1,
    pSize: CONFIG.NEIS_PAGE_SIZE,
    ...params,
  });
  const res = await fetch(`${CONFIG.NEIS_BASE_URL}/${endpoint}?${query}`);
  if (!res.ok) throw new Error(`NEIS 요청 실패 (${res.status})`);
  return res.json();
}

// 학교 검색
export async function searchSchool(name) {
  const data = await neisGet('schoolInfo', {
    SCHUL_NM: name,
    pSize: CONFIG.MAX_SCHOOL_RESULTS,
  });
  return data.schoolInfo?.[1]?.row ?? [];
}

// 이번 달 학사일정 조회
export async function getMonthlySchedule(officeCode, schoolCode) {
  const { from, to } = getMonthRange();
  const data = await neisGet('SchoolSchedule', {
    ATPT_OFCDC_SC_CODE: officeCode,
    SD_SCHUL_CODE: schoolCode,
    AA_FROM_YMD: from,
    AA_TO_YMD: to,
  });
  return data.SchoolSchedule?.[1]?.row ?? [];
}
