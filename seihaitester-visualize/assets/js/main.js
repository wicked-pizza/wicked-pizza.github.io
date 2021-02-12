
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

  buyEntriesCanceled = historyData.filter(x => {
    return  x.side === 'openbuy-canceled'
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

  sellEntriesCanceled = historyData.filter(x => {
    return x.side === 'opensell-canceled'
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

  buyOutOfLimit = historyData.filter((x) => {
    return /買い方向の数量が設定上限/.exec(x.message)
  })

  sellOutOfLimit = historyData.filter((x) => {
    return /売り方向の数量が設定上限/.exec(x.message)
  })

  apiError = historyData.filter((x) => {
    return /APIエラー/.exec(x.message)
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

  startTime = condStatement(startTime)
  stopTime = condStatement(stopTime)
  suspention = condStatement(suspention)
  buyEntries = condStatement(buyEntries)
  buyEntriesCanceled = condStatement(buyEntriesCanceled)
  buyHold = condStatement(buyHold)
  buyExits = condStatement(buyExits)
  buyOutOfLimit = condStatement(buyOutOfLimit)
  sellEntries = condStatement(sellEntries)
  sellEntriesCanceled = condStatement(sellEntriesCanceled)
  sellHold = condStatement(sellHold)
  sellExits = condStatement(sellExits)
  sellOutOfLimit = condStatement(sellOutOfLimit)
  autoBuyPosKeep = condStatement(autoBuyPosKeep)
  autoSellPosKeep = condStatement(autoSellPosKeep)
  autoPosNone = condStatement(autoPosNone)
  apiError = condStatement(apiError)
  sfd = condStatement(sfd)
  name = 'あなごちゃん履歴' + (title ? `: ${title}` : '')

  const outputData = createOutputData(
    startTime,
    stopTime,
    suspention,
    buyEntries,
    buyEntriesCanceled,
    buyHold,
    buyExits,
    buyOutOfLimit,
    sellEntries,
    sellEntriesCanceled,
    sellHold,
    sellExits,
    sellOutOfLimit,
    autoBuyPosKeep,
    autoSellPosKeep,
    autoPosNone,
    apiError,
    sfd,
    name
  )

  exports(outputData)
}

function getTitle () {
  return document.querySelector('select[name="title"]').value
}