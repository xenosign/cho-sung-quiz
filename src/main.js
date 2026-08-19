import './style.css'
import { categories } from './data/words.js'
import { getChosungString } from './chosung.js'

const TEAM_COUNT = 4

const app = document.querySelector('#app')
const scoreboard = document.querySelector('#scoreboard')

const state = {
  category: null,
  questions: [],
  currentIndex: 0,
  showAnswer: false,
}

// 팀 점수는 라운드/카테고리를 넘나들며 누적된다.
const teamScores = new Array(TEAM_COUNT).fill(0)

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

function renderCategoryScreen() {
  app.innerHTML = `
    <h1>초성퀴즈</h1>
    <div class="category-grid">
      ${categories
        .map((c) => `<button class="category-btn" data-id="${c.id}">${c.name}</button>`)
        .join('')}
    </div>
  `
  app.querySelectorAll('.category-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = categories.find((c) => c.id === btn.dataset.id)
      startQuiz(category)
    })
  })
}

function renderQuizScreen() {
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

renderScoreboard()
renderCategoryScreen()
