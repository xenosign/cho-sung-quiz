import './style.css'
import { chosungCategories } from './data/chosung-words.js'
import { familyCategories } from './data/family-words.js'
import { getChosungString } from './chosung.js'

const TEAM_COUNT = 4
const FAMILY_QUESTION_COUNT = 15
const FAMILY_TIME_LIMIT = 40

const app = document.querySelector('#app')
const scoreboard = document.querySelector('#scoreboard')

const state = {
  mode: null,
  category: null,
  questions: [],
  currentIndex: 0,
  showAnswer: false,
  selectedTeam: 0,
  timeLeft: FAMILY_TIME_LIMIT,
}

// 팀 점수는 라운드/카테고리를 넘나들며 누적된다.
const teamScores = new Array(TEAM_COUNT).fill(0)

let familyTimerId = null
let familyQuestionAssignments = null

function renderScoreboard() {
  scoreboard.innerHTML = teamScores
    .map(
      (score, i) =>
        `<div class="scoreboard-item"><span class="scoreboard-team">${i + 1}팀</span><span class="scoreboard-score">${score}점</span></div>`,
    )
    .join('')
}

function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function startQuiz(category) {
  state.category = category
  state.questions = shuffle(category.words)
  state.currentIndex = 0
  state.showAnswer = false
  renderQuizScreen()
}

function renderModeScreen() {
  clearInterval(familyTimerId)
  document.body.classList.remove('family-round-active', 'dark-mode')
  state.mode = null
  app.innerHTML = `
    <div class="mode-grid">
      <button class="mode-btn" data-mode="chosung">
        <div class="mode-title">초성 퀴즈</div>
        <div class="mode-desc">초성을 보고 정답을 맞혀보세요</div>
      </button>
      <button class="mode-btn" data-mode="family">
        <div class="mode-title">가족 오락관</div>
        <div class="mode-desc">한 사람이 제시어를 설명하고 팀원이 맞혀요</div>
      </button>
    </div>
  `
  app.querySelectorAll('.mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.mode = btn.dataset.mode
      if (state.mode === 'family') {
        renderFamilyRoundSelectScreen()
      } else {
        renderCategoryScreen()
      }
    })
  })
}

function renderCategoryScreen() {
  document.body.classList.remove('family-round-active', 'dark-mode')
  app.innerHTML = `
    <h1>초성퀴즈</h1>
    <div class="category-grid">
      ${chosungCategories
        .map((c) => `<button class="category-btn" data-id="${c.id}">${c.name}</button>`)
        .join('')}
    </div>
    <button class="back-btn">모드 선택으로</button>
  `
  app.querySelectorAll('.category-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = chosungCategories.find((c) => c.id === btn.dataset.id)
      startQuiz(category)
    })
  })
  app.querySelector('.back-btn').addEventListener('click', renderModeScreen)
}

function renderQuizScreen() {
  document.body.classList.remove('family-round-active', 'dark-mode')
  const answer = state.questions[state.currentIndex]
  const chosung = getChosungString(answer)

  app.innerHTML = `
    <div class="quiz-card">
      <div class="progress">${state.category.name} · ${state.currentIndex + 1} / ${state.questions.length}</div>
      <div class="chosung">${chosung}</div>
      ${state.showAnswer ? `<div class="answer">${answer}</div>` : ''}
      <div class="team-grid">
        ${teamScores
          .map((_, i) => `<button class="team-btn" data-team="${i}">${i + 1}팀</button>`)
          .join('')}
      </div>
      <div class="bottom-btn-row">
        <button class="answer-btn">${state.showAnswer ? '정답 숨기기' : '정답 보기'}</button>
        <button class="skip-btn">스킵</button>
        <button class="list-btn">목록</button>
      </div>
    </div>
  `

  app.querySelectorAll('.team-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const teamIndex = Number(btn.dataset.team)
      teamScores[teamIndex] += 1
      renderScoreboard()
      goToNext()
    })
  })

  app.querySelector('.answer-btn').addEventListener('click', () => {
    state.showAnswer = !state.showAnswer
    renderQuizScreen()
  })
  app.querySelector('.skip-btn').addEventListener('click', goToNext)
  app.querySelector('.list-btn').addEventListener('click', renderCategoryScreen)
}

function goToNext() {
  state.showAnswer = false
  if (state.currentIndex + 1 < state.questions.length) {
    state.currentIndex += 1
    renderQuizScreen()
  } else {
    renderCategoryScreen()
  }
}

function getFamilyQuestionPool() {
  return familyCategories.flatMap((c) => c.words.map((word) => ({ category: c.name, word })))
}

// 팀마다 서로 겹치지 않는 문제를 받도록 전체 문제 풀을 팀 수만큼 미리 나눠 둔다.
function getFamilyQuestionAssignments() {
  if (!familyQuestionAssignments) {
    const pool = shuffle(getFamilyQuestionPool())
    familyQuestionAssignments = Array.from({ length: TEAM_COUNT }, (_, i) =>
      pool.slice(i * FAMILY_QUESTION_COUNT, (i + 1) * FAMILY_QUESTION_COUNT),
    )
  }
  return familyQuestionAssignments
}

function startFamilyRound(teamNumber) {
  state.mode = 'family'
  state.selectedTeam = teamNumber - 1
  state.questions = getFamilyQuestionAssignments()[state.selectedTeam]
  state.currentIndex = 0
  renderFamilyRoundScreen()
}

function renderFamilyRoundSelectScreen() {
  clearInterval(familyTimerId)
  document.body.classList.remove('family-round-active')
  document.body.classList.add('dark-mode')
  app.innerHTML = `
    <h1>가족 오락관</h1>
    <div class="round-grid">
      ${[1, 2, 3, 4].map((n) => `<button class="round-btn" data-round="${n}">${n}</button>`).join('')}
    </div>
    <button class="reset-btn">점수 초기화</button>
    <button class="back-btn">모드 선택으로</button>
  `
  app.querySelectorAll('.round-btn').forEach((btn) => {
    btn.addEventListener('click', () => startFamilyRound(Number(btn.dataset.round)))
  })
  app.querySelector('.reset-btn').addEventListener('click', () => {
    if (confirm('팀 점수를 모두 0점으로 초기화할까요?')) {
      teamScores.fill(0)
      familyQuestionAssignments = null
      renderScoreboard()
    }
  })
  app.querySelector('.back-btn').addEventListener('click', renderModeScreen)
}

function renderFamilyRoundScreen() {
  document.body.classList.add('family-round-active', 'dark-mode')
  const question = state.questions[state.currentIndex]

  app.innerHTML = `
    <div class="family-screen">
      <div class="family-card family-prompt-card">
        <div class="family-timer">⏱ ${FAMILY_TIME_LIMIT}초</div>
        <div class="family-prompt">(${question.category}) ${question.word}</div>
        <div class="family-progress">${state.selectedTeam + 1}팀 · ${state.currentIndex + 1} / ${state.questions.length}</div>
      </div>
      <div class="family-card score-panel">
        ${teamScores
          .map(
            (score, i) => `
          <div class="score-tile${i === state.selectedTeam ? ' selected' : ''}">
            <span class="score-tile-team">${i + 1}팀</span>
            <span class="score-tile-score">${score}점</span>
          </div>`,
          )
          .join('')}
      </div>
      <div class="family-card family-actions">
        <div class="bottom-btn-row">
          <button class="skip-btn">스킵</button>
          <button class="correct-btn">정답</button>
          <button class="double-btn">정답 x2</button>
        </div>
        <button class="back-btn team-select-btn">팀 선택으로</button>
      </div>
    </div>
  `

  app.querySelector('.correct-btn').addEventListener('click', () => {
    teamScores[state.selectedTeam] += 1
    renderScoreboard()
    goToNextFamilyQuestion()
  })
  app.querySelector('.double-btn').addEventListener('click', () => {
    teamScores[state.selectedTeam] += 2
    renderScoreboard()
    goToNextFamilyQuestion()
  })
  app.querySelector('.skip-btn').addEventListener('click', goToNextFamilyQuestion)
  app.querySelector('.team-select-btn').addEventListener('click', () => {
    clearInterval(familyTimerId)
    renderFamilyRoundSelectScreen()
  })

  startFamilyTimer()
}

function startFamilyTimer() {
  clearInterval(familyTimerId)
  state.timeLeft = FAMILY_TIME_LIMIT
  familyTimerId = setInterval(() => {
    state.timeLeft -= 1
    const timerEl = app.querySelector('.family-timer')
    if (timerEl) timerEl.textContent = `⏱ ${state.timeLeft}초`
    if (state.timeLeft <= 0) {
      clearInterval(familyTimerId)
      goToNextFamilyQuestion()
    }
  }, 1000)
}

function goToNextFamilyQuestion() {
  clearInterval(familyTimerId)
  if (state.currentIndex + 1 < state.questions.length) {
    state.currentIndex += 1
    renderFamilyRoundScreen()
  } else {
    renderFamilyRoundSelectScreen()
  }
}

renderScoreboard()
renderModeScreen()
