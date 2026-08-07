const CHOSUNG_LIST = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
]

const HANGUL_BASE = 0xac00
const HANGUL_LAST = 0xd7a3
const CHOSUNG_UNIT = 588 // 21 medials * 28 finals

export function getChosungOfChar(char) {
  const code = char.charCodeAt(0)
  if (code < HANGUL_BASE || code > HANGUL_LAST) return char
  const initialIndex = Math.floor((code - HANGUL_BASE) / CHOSUNG_UNIT)
  return CHOSUNG_LIST[initialIndex]
}

export function getChosungString(word) {
  return [...word].map(getChosungOfChar).join('')
}
