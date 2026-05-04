// =============================================
// app.js — 메인 앱 (이벤트 처리 + DOM 관리)
// =============================================

import { CONFIG } from './config.js';
import { searchSchool, getMonthlySchedule } from './neis.js';
import { analyzeImage } from './ai.js';

// ── DOM 캐싱 ──────────────────────────────────
const DOM = {
  // 학교 검색
  schoolInput:      () => document.getElementById('schoolName'),
  schoolResults:    () => document.getElementById('schoolResults'),
  schoolList:       () => document.getElementById('schoolList'),
  selectedSchool:   () => document.getElementById('selectedSchool'),
  selectedSchoolName: () => document.getElementById('selectedSchoolName'),
  scheduleList:     () => document.getElementById('scheduleList'),

  // 설정
  langGroup:        () => document.getElementById('langGroup'),
  gradeGroup:       () => document.getElementById('gradeGroup'),

  // 업로드
  fileInput:        () => document.getElementById('fileInput'),
  uploadZone:       () => document.getElementById('uploadZone'),
  preview:          () => document.getElementById('preview'),
  placeholder:      () => document.getElementById('placeholder'),

  // 분석 버튼
  analyzeBtn:       () => document.getElementById('analyzeBtn'),
  spinner:          () => document.getElementById('spinner'),
  btnTxt:           () => document.getElementById('btnTxt'),

  // 결과
  results:          () => document.getElementById('results'),
  rOcr:             () => document.getElementById('rOcr'),
  rNeis:            () => document.getElementById('rNeis'),
  rGradeTag:        () => document.getElementById('rGradeTag'),
  rStudent:         () => document.getElementById('rStudent'),
  rLangTag:         () => document.getElementById('rLangTag'),
  rParent:          () => document.getElementById('rParent'),
  rMission:         () => document.getElementById('rMission'),
};

// ── 앱 상태 ───────────────────────────────────
const state = {
  lang:  '베트남어',
  grade: '초등 3~4학년',
  imageData: null,
};

// ── 초기화 ────────────────────────────────────
function init() {
  initPills();
  initUpload();
}

// ── 언어/학년 선택 필 ─────────────────────────
function initPills() {
  const setupPillGroup = (groupId, stateKey) => {
    const group = document.getElementById(groupId);
    group.addEventListener('click', (e) => {
      const pill = e.target.closest('.pill');
      if (!pill) return;
      group.querySelectorAll('.pill').forEach(p => p.classList.remove('on'));
      pill.classList.add('on');
      state[stateKey] = pill.dataset.val;
    });
  };

  setupPillGroup('langGroup', 'lang');
  setupPillGroup('gradeGroup', 'grade');
}

// ── 이미지 업로드 ─────────────────────────────
function initUpload() {
  const zone = DOM.uploadZone();
  const input = DOM.fileInput();

  input.addEventListener('change', e => loadImage(e.target.files[0]));

  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.classList.add('drag');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag');
    loadImage(e.dataTransfer.files[0]);
  });
}

function loadImage(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ({ target }) => {
    state.imageData = target.result;
    DOM.preview().src = target.result;
    DOM.preview().style.display = 'block';
    DOM.placeholder().style.display = 'none';
  };
  reader.readAsDataURL(file);
}

// ── 학교 검색 ─────────────────────────────────
async function handleSearchSchool() {
  const name = DOM.schoolInput().value.trim();
  if (!name) { alert('학교명을 입력해주세요.'); return; }

  setSearchLoading(true);
  try {
    const schools = await searchSchool(name);
    renderSchoolList(schools);
  } catch (e) {
    showError('학교 검색 오류: ' + e.message);
  } finally {
    setSearchLoading(false);
  }
}

function setSearchLoading(isLoading) {
  const btn = document.querySelector('.btn-search');
  btn.textContent = isLoading ? '검색 중...' : '검색';
  btn.disabled = isLoading;
}

function renderSchoolList(schools) {
  const listEl = DOM.schoolList();
  listEl.innerHTML = '';

  if (schools.length === 0) {
    listEl.innerHTML = '<span class="empty-msg">검색 결과 없음</span>';
  } else {
    schools.forEach(school => {
      const btn = document.createElement('button');
      btn.className = 'school-pill';
      btn.textContent = `${school.SCHUL_NM} (${school.LCTN_SC_NM})`;
      btn.addEventListener('click', () => handleSelectSchool(school, btn));
      listEl.appendChild(btn);
    });
  }
  DOM.schoolResults().style.display = 'block';
}

async function handleSelectSchool(school, btn) {
  document.querySelectorAll('.school-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  DOM.selectedSchoolName().textContent =
    `${school.SCHUL_NM} · ${school.ORG_RDNMA || school.LCTN_SC_NM}`;
  DOM.selectedSchool().style.display = 'block';
  DOM.scheduleList().innerHTML = '<span class="loading-msg">학사일정 불러오는 중...</span>';

  try {
    const rows = await getMonthlySchedule(
      school.ATPT_OFCDC_SC_CODE,
      school.SD_SCHUL_CODE
    );
    renderSchedule(rows);
  } catch {
    DOM.scheduleList().innerHTML = '<span class="error-msg">학사일정 조회 오류</span>';
  }
}

function renderSchedule(rows) {
  const container = DOM.scheduleList();
  if (rows.length === 0) {
    container.innerHTML = '<span class="empty-msg">이번 달 등록된 학사일정이 없습니다</span>';
    return;
  }
  container.innerHTML = rows
    .slice(0, CONFIG.MAX_SCHEDULE_DISPLAY)
    .map(r => `
      <div class="neis-bar">
        <span class="icon">📅</span>
        <span class="text">
          ${r.AA_YMD.slice(4, 6)}/${r.AA_YMD.slice(6, 8)} ${r.EVENT_NM}
        </span>
      </div>
    `)
    .join('');
}

// ── AI 분석 ───────────────────────────────────
async function handleAnalyze() {
  if (!state.imageData) { alert('사진을 먼저 업로드해주세요.'); return; }

  setAnalyzeLoading(true);
  DOM.results().style.display = 'none';

  try {
    const [b64, mime] = [
      state.imageData.split(',')[1],
      state.imageData.split(';')[0].split(':')[1],
    ];
    const result = await analyzeImage({
      imageBase64: b64,
      mimeType: mime,
      lang: state.lang,
      grade: state.grade,
    });
    renderResults(result);
  } catch (e) {
    showError('분석 오류: ' + e.message);
  } finally {
    setAnalyzeLoading(false);
  }
}

function setAnalyzeLoading(isLoading) {
  DOM.analyzeBtn().disabled = isLoading;
  DOM.spinner().style.display = isLoading ? 'block' : 'none';
  DOM.btnTxt().textContent = isLoading ? 'AI 분석 중...' : '✨ AI 분석 시작하기';
}

// ── 결과 렌더링 ───────────────────────────────
function renderResults(r) {
  renderOCR(r);
  renderStudent(r);
  renderParent(r);
  renderMission(r);

  DOM.results().style.display = 'flex';
  DOM.results().scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderOCR(r) {
  DOM.rOcr().textContent = r.ocr_text || '—';
  DOM.rNeis().innerHTML = [
    r.curriculum_info
      ? neisBar('📚', `교육과정: ${r.curriculum_info}`)
      : '',
    r.neis_schedule
      ? neisBar('📅', `학사일정: ${r.neis_schedule}`)
      : '',
  ].join('');
}

function renderStudent(r) {
  DOM.rGradeTag().textContent = state.grade;
  DOM.rStudent().innerHTML = `
    <div class="section">
      <div class="label">개념 설명</div>
      <div>${r.student_ko || '—'}</div>
    </div>
    <div class="section">
      <div class="label">💡 이렇게 생각해봐요</div>
      <div>${r.student_example || '—'}</div>
    </div>`;
}

function renderParent(r) {
  const urgencyMap = {
    높음: { cls: 'high', label: '⚠️ 중요 알림' },
    보통: { cls: 'mid',  label: '📋 일반 안내' },
    낮음: { cls: 'low',  label: '✅ 참고 사항' },
  };
  const { cls, label } = urgencyMap[r.urgency] ?? { cls: 'low', label: '' };

  DOM.rLangTag().textContent = state.lang;
  DOM.rParent().innerHTML = `
    <div class="section">
      <div class="urgency">
        <div class="udot ${cls}"></div>
        <span class="utext">${label} — ${r.urgency_reason || ''}</span>
      </div>
    </div>
    <div class="section">
      <div class="label">📱 ${state.lang} 번역</div>
      <div class="foreign">${r.parent_translation || '—'}</div>
    </div>
    <div class="section">
      <div class="label">🎓 지도 팁</div>
      <div>${r.parent_guide || '—'}</div>
    </div>`;
}

function renderMission(r) {
  DOM.rMission().innerHTML = `
    <div class="section">
      <div class="label">🏠 오늘의 10분 가족 활동</div>
      <div class="script">
        <div class="who">함께 해보세요</div>
        <div>${r.family_mission || '—'}</div>
      </div>
    </div>
    <div class="section">
      <div class="label">🔄 역할 역전 — 자녀가 부모에게 설명하기</div>
      <div class="quiz">
        <div class="qlabel">${state.lang}로 부모가 질문:</div>
        <div class="qtext">"${r.role_reversal_q || '—'}"</div>
      </div>
      <div class="hint">💬 힌트: ${r.role_reversal_hint || '—'}</div>
    </div>`;
}

// ── 유틸 ─────────────────────────────────────
function neisBar(icon, text) {
  return `
    <div class="neis-bar" style="margin-top:6px">
      <span class="icon">${icon}</span>
      <span class="text">${text}</span>
    </div>`;
}

function showError(msg) {
  alert(msg);
}

// ── 전역 이벤트 바인딩 ────────────────────────
// HTML onclick 대신 JS에서 직접 바인딩
document.addEventListener('DOMContentLoaded', () => {
  init();

  document.querySelector('.btn-search')
    .addEventListener('click', handleSearchSchool);

  DOM.analyzeBtn()
    .addEventListener('click', handleAnalyze);

  // Enter 키로 학교 검색
  DOM.schoolInput()
    .addEventListener('keydown', e => {
      if (e.key === 'Enter') handleSearchSchool();
    });
});
