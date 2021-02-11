
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

  const title = getTitle()
  const list = trimArray(input.value)
  let historyData = createHistoryDataByAnago(list, myTimezone)

  startTime = historyData.filter((x) => {
    return /開始ボタン|開始時間になりました/.exec(x.message)
  })

  stopTime = historyData.filter((x) => {
    return /停止ボタン/.exec(x.message)
  })

  suspention = historyData.filter((x) => {
    return /待機/.exec(x.message)
  })

  buyEntries = historyData.filter(x => {
    return x.side === 'openbuy'
  })

  buyExits = historyData.filter(x => {
    return x.side === 'closebuy'
  })

  buyHold = historyData.filter((x) => {
    return /買いホールド/.exec(x.message)
  })

  sellEntries = historyData.filter((x) => {
    return x.side === 'opensell'
  })

  sellExits = historyData.filter((x) => {
    return x.side === 'closesell'
  })

  sellHold = historyData.filter((x) => {
    return /売りホールド/.exec(x.message)
  })

  autoBuyPosKeep = historyData.filter((x) => {
    return /ポジション自動調整/.exec(x.message) && /買いポジション保有中/.exec(x.message)
  })

  autoSellPosKeep = historyData.filter((x) => {
    return /ポジション自動調整/.exec(x.message) && /売りポジション保有中/.exec(x.message)
  })

  autoPosNone = historyData.filter((x) => {
    return /ポジション自動調整/.exec(x.message) && /ポジション無し/.exec(x.message)
  })

  outofspreads = historyData.filter((x) => {
    return /スプレッド許容外/.exec(x.message)
  })

  sfd = historyData.filter((x) => {
    return /SFD/.exec(x.message)
  })

  if (title === 'Coincheck') {
    sellEntries = []
    sellExits = []
  }

  startTime = startTime.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  stopTime = stopTime.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  suspention = suspention.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  buyEntries = buyEntries.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  buyHold = buyHold.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  buyExits = buyExits.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  sellEntries = sellEntries.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  sellHold = sellHold.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  sellExits = sellExits.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  autoBuyPosKeep = autoBuyPosKeep.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  autoSellPosKeep = autoSellPosKeep.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  autoPosNone = autoPosNone.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  outofspreads = outofspreads.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  sfd = sfd.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  name = 'あなごちゃん履歴' + (title ? `: ${title}` : '')

  const outputData = createOutputData(
    startTime,
    stopTime,
    suspention,
    buyEntries,
    buyHold,
    buyExits,
    sellEntries,
    sellHold,
    sellExits,
    autoBuyPosKeep,
    autoSellPosKeep,
    autoPosNone,
    sfd,
    name
  )

  exports(outputData)
}

function getTitle () {
  return document.querySelector('select[name="title"]').value
}