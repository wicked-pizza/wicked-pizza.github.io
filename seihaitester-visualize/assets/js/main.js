
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
  const isMarketEntry = getEntryType() === 'market'
  const list = trimArray(input.value)
  let historyData = []
  let lastRow = ''
  let index = 0

  list.forEach((row) => {
    if (row.match(/^\d{4}\//)) {
      lastRow = row
    } else {
      const iso = getISOFormat(lastRow, myTimezone)

      historyData.push({
        time: iso,
        message: row
      })
    }
  })

  historyData = historyData.filter(x => !/許容外/.exec(x.message))

  startTime = historyData.filter((x) => {
    return /開始ボタン|開始時間になりました/.exec(x.message)
  })

  stopTime = historyData.filter((x) => {
    return /停止ボタン/.exec(x.message)
  })

  suspention = historyData.filter((x) => {
    return /待機/.exec(x.message)
  })

  buyEntries = historyData.filter((x) => {
    if (isMarketEntry) {
      return /成り行き買い注文/.exec(x.message)
    } else {
      return /買い:/.exec(x.message)
    }
  })

  buyExits = historyData.filter((x) => {
    return /買い決済:/.exec(x.message)
  })

  sellEntries = historyData.filter((x) => {
    if (isMarketEntry) {
      return /成り行き売り注文/.exec(x.message)
    } else {
      return /売り:/.exec(x.message)
    }
  })

  sellExits = historyData.filter((x) => {
    return /売り決済:/.exec(x.message)
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

  startTime = startTime.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  stopTime = stopTime.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  suspention = suspention.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  buyEntries = buyEntries.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  buyExits = buyExits.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
  sellEntries = sellEntries.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
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
    buyExits,
    sellEntries,
    sellExits,
    autoBuyPosKeep,
    autoSellPosKeep,
    autoPosNone,
    sfd,
    name
  )

  exports(outputData)
}

function getEntryType () {
  return document.querySelector('input[name="entry-type"]:checked').getAttribute('id')
}

function getTitle () {
  return document.querySelector('select[name="title"]').value
}