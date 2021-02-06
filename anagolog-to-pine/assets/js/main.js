
const input = document.getElementById('input')
const output = document.getElementById('output')
const button = document.getElementById('button')

button.addEventListener('click', () => {
  start()
})

function start () {
  if (!input.value) {
    return window.alert('入力が空です')
  }

  const list = trimArray(input.value)
  let historyData = []
  let lastRow = ''
  let index = 0

  list.forEach((row) => {
    if (row.match(/^[\d]/)) {
      lastRow = row
    } else {
      const iso = getISOFormat(lastRow, myTimezone)

      historyData.push({
        time: iso,
        message: row
      })
    }
  })

  startTime = historyData.filter((x) => {
    return /開始ボタン/.exec(x.message)
  })

  buyEntries = historyData.filter((x) => {
    return /買い:/.exec(x.message)
  })

  buyExits = historyData.filter((x) => {
    return /買い決済:/.exec(x.message)
  })

  sellEntries = historyData.filter((x) => {
    return /売り:/.exec(x.message)
  })

  sellExits = historyData.filter((x) => {
    return /売り決済:/.exec(x.message)
  })

  autoPosKeep = historyData.filter((x) => {
    return /ポジション自動調整/.exec(x.message) && /保有中/.exec(x.message)
  })

  autoPosNone = historyData.filter((x) => {
    return /ポジション自動調整/.exec(x.message) && /ポジション無し/.exec(x.message)
  })

  outofspreads = historyData.filter((x) => {
    return /スプレッド許容外/.exec(x.message)
  })

  startTime = startTime.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  buyEntries = buyEntries.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  buyExits = buyExits.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  sellEntries = sellEntries.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  sellExits = sellExits.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  autoPosKeep = autoPosKeep.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  autoPosNone = autoPosNone.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  outofspreads = outofspreads.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)

  const outputData = createOutputData(startTime, buyEntries, buyExits, sellEntries, sellExits, autoPosKeep, autoPosNone, 'あなごちゃん履歴')

  exports(outputData)
}

