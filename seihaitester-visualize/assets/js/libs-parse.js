/**
 * Parse History Data By Anago
 * @param {Array} list
 * @param {String} tz
 * @return {Object} [Array, Array]
 */
function parseHistoryDataByAnago (list, tz) {
  let result = []
  let lastRow = ''
  let index = 0
  let useAction = true

  list.forEach((row, i) => {
    // 日時
    if (/^\d{4}\//.exec(row)) {
      lastRow = row
    } else {
      index++
      const iso = getISOFormat(lastRow, myTimezone)
      let [actionType, side, volume, price] = [null, null, null, null]
      let _type = 'text'

      if (re_price.exec(row)) {
        _type = 'price'
        _myActionIndex = findActionByPrice(result, index)
        _myAction = result[_myActionIndex]
        actionType = _myAction.actionType
        volume = _myAction.volume
        side = /open/.exec(_myAction.side) ? 'open' : 'close'
        price = Number(/^(\d+)円/.exec(row)[1])

        if (side === 'open' && /買い/.exec(row)) {
          side = 'openbuy'
        } else if (side === 'close' && /売り/.exec(row)) {
          side = 'closebuy'
        } else if (side === 'open' && /売り/.exec(row)) {
          side = 'opensell'
        } else if (side === 'close' && /買い/.exec(row)) {
          side = 'closesell'
        }

        if (useAction) useAction = false
      } else if (re_action.exec(row)) {
        _type = 'action'
        actionType = /ActionType=(.)/.exec(row)[1]
        volume = Number(/出来高差?[:=]([\-\d\.]+)$/.exec(row)[1])


        if (/買い:/.exec(row)) {
          side = 'openbuy'
        } else if (/買い決済|買い全決済/.exec(row)) {
          side = 'closebuy'
        } else if (/売り:/.exec(row)) {
          side = 'opensell'
        } else if (/売り決済|売り全決済/.exec(row)) {
          side = 'closesell'
        }
      } else if (/買い全決済/.exec(row)) {
        side = 'closebuy'
      } else if (/売り全決済/.exec(row)) {
        side = 'closesell'
      } else if (/ポジション無し/.exec(row)) {
        _canceledIndex = findActionNonpos(result, index)
        result[_canceledIndex].side = `${result[_canceledIndex].side}-canceled`
      } else if (/:利益幅/.exec(row)) {
        price = Number(/(\d+)/.exec(row)[1])
        actionType = '固定利確幅'

        if (/買い/.exec(row)) {
          side = 'closebuy'
        } else if (/売り/.exec(row)) {
          side = 'closesell'
        }

      } else {

      }

      result.push({
        time: iso,
        side,
        volume,
        price,
        actionType,
        message: row,
        _type,
      })
    }
  })

  simpleData = result.filter(x => !/許容外/.exec(x.message))

  if (!useAction) {
    return {
      simpleData: simpleData.filter(x => x._type !== 'action'),
      historyData: result.filter(x => x._type !== 'action')
    }
  }

  return {
    simpleData,
    historyData: result
  }
}

/**
 * Parse History Data By Tester
 */
function parseHistoryDataByTester (list, tz) {
  list.shift()

  return list.map((row) => {
    const cells = row.split(',')
    const iso = getISOFormat(cells[0], myTimezone)
    const buyVolume = Number(cells[3])
    const sellVolume = Number(cells[4])

    return {
      time: iso,
      side: cells[1].trim(),
      actionType: null,
      message: cells[1].trim(),
      price: Number(cells[2]),
      buyVolume,
      sellVolume,
      volume: buyVolume - sellVolume,
      _type: 'tester'
    }
  })
}

/**
 * Distribution
 * @param {Array} historyData
 * @param {Array} customEvents
 * @para, {String} name
 */
function dist (historyData, customEvents, name) {
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

  buyExitLimit = historyData.filter(x => {
    return /買い決済:利益幅/.exec(x.message)
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

  sellExitLimit = historyData.filter(x => {
    return /売り決済:利益幅/.exec(x.message)
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

  lackOfMoney = historyData.filter((x) => {
    return /取引余力が不足/.exec(x.message)
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

  customEvents = customEvents.filter(x => {
    const title = getTitleByAnago().toLowerCase()
    return x.platform[0] == '*' || x.platform.includes(title)
  }).map((x, i) => {
    return (`bool is_CustomEvent${i} = ${condStatementSingle(x.time)}
if show_customEvents and is_CustomEvent${i}
    label.new(bar_index, na, "${x.message}", color=#292A2B, textcolor=#F3F3F3, yloc=yloc.abovebar, size=size.small)
    line.new(bar_index, high, bar_index, low, color=#292A2B, extend=extend.both, style=line.style_dotted)`)
  })

  startTime = condStatement(startTime)
  stopTime = condStatement(stopTime)
  suspention = condStatement(suspention)
  buyEntries = condStatement(buyEntries)
  buyEntriesCanceled = condStatement(buyEntriesCanceled)
  buyHold = condStatement(buyHold)
  buyExits = condStatement(buyExits)
  buyExitLimit = condStatement(buyExitLimit)
  buyOutOfLimit = condStatement(buyOutOfLimit)
  sellEntries = condStatement(sellEntries)
  sellEntriesCanceled = condStatement(sellEntriesCanceled)
  sellHold = condStatement(sellHold)
  sellExits = condStatement(sellExits)
  sellExitLimit = condStatement(sellExitLimit)
  sellOutOfLimit = condStatement(sellOutOfLimit)
  autoBuyPosKeep = condStatement(autoBuyPosKeep)
  autoSellPosKeep = condStatement(autoSellPosKeep)
  autoPosNone = condStatement(autoPosNone)
  apiError = condStatement(apiError)
  lackOfMoney = condStatement(lackOfMoney)
  sfd = condStatement(sfd)

  const outputData = createOutputData(
    startTime,
    stopTime,
    suspention,
    buyEntries,
    buyEntriesCanceled,
    buyHold,
    buyExits,
    buyExitLimit,
    buyOutOfLimit,
    sellEntries,
    sellEntriesCanceled,
    sellHold,
    sellExits,
    sellExitLimit,
    sellOutOfLimit,
    autoBuyPosKeep,
    autoSellPosKeep,
    autoPosNone,
    apiError,
    lackOfMoney,
    sfd,
    customEvents,
    name
  )

  exports(outputData)
}