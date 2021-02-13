const input = document.getElementById('input')
const output = document.getElementById('output')
const button = document.getElementById('button')
const custom = document.getElementById('custom')
const example = document.getElementById('example')
const { format } = dateFns
const now = new Date()

console.log(format)

button.addEventListener('click', () => {
  start()
})

custom.addEventListener('keyup', (e) => {
  localStorage.setItem('customEvents', e.target.value)
})

custom.value = localStorage.getItem('customEvents')
example.value = `${format(new Date(), 'YYYY-MM-DDTHH:mm:00')}, IN/OUT, bitflyer`

function start () {
  if (!input.value) {
    return window.alert('入力が空です')
  }

  const title = getTitleByAnago()
  const name = 'あなごちゃん履歴' + (title ? `: ${title}` : '')
  const list = trimArray(input.value)
  const customEvents = createCustomEvents(custom.value)
  const { simpleData, historyData } = parseHistoryDataByAnago(list, customEvents, myTimezone)

  dist(simpleData, customEvents, name)
  historyLog(historyData)
}