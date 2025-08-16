import dayjs from 'dayjs'

// 'YYYY-MM-DD'
export const todayKey = () => dayjs().format('YYYY-MM-DD')

// inclusive range: [from..to] day strings
export function daysBetween(from, to) {
  const a = []
  let d = dayjs(from)
  const end = dayjs(to)
  while (d.isBefore(end) || d.isSame(end, 'day')) {
    a.push(d.format('YYYY-MM-DD'))
    d = d.add(1, 'day')
  }
  return a
}

// last N days ending today
export function lastNDays(n) {
  const to = todayKey()
  const from = dayjs(to).subtract(n - 1, 'day').format('YYYY-MM-DD')
  return { from, to }
}
