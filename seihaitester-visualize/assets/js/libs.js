let exportsData = null
const myTimezone = '+0900'
const msg = document.getElementById('message')

/**
 * Exports
 * @param data
 */
function exports (data) {
  output.innerHTML = exportsData = data
}

/**
 * Copy
 * @param data
 */
function copy (data) {
  if (!data) {
    return alert('コピーするデータが空です')
  }

  if (navigator.clipboard) {
    navigator.clipboard.writeText(data)
    writeMessage('クリップボードにコピーしました')
  }
}

/**
 * Write Message
 * @param data
 */
function writeMessage (data) {
  msg.innerHTML = data

  setTimeout(() => {
    msg.innerHTML = ''
  }, 3000)
}

/**
 * Get ISO Format
 * @param x
 * @param tz
 * @return {String}
 */
function getISOFormat (x, tz) {
  if (!x || typeof x !== 'string') return

  return x.trim()
    .replace(/\//g, '-')
    .replace(' ', 'T')
    .replace(/T(\d):/, 'T0$1:') + tz
}

/**
 * Trim Array
 * @param row
 * @return {Array}
 */
function trimArray (row) {
  return row.split('\n').map(x => x.trim()).filter(x => !!x)
}

/**
 * Create History Data By Anago
 * @param list {Array}
 * @param tz {String}
 * @return {Array}
 */
function createHistoryDataByAnago (list, tz) {
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
      let side = null
      let type = 'text'

      if (/^\d{6}/.exec(row)) {
        type = 'price'
        side = /決済/.exec(list[i-2]) ? 'close' : 'open'
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
      } else if (/^ActionType/.exec(row)) {
        type = 'action'
        if (/買い:/.exec(row)) {
          side = 'openbuy'
        } else if (/買い決済/.exec(row)) {
          side = 'closebuy'
        } else if (/売り:/.exec(row)) {
          side = 'opensell'
        } else if (/売り決済/.exec(row)) {
          side = 'closesell'
        }
      } else if (/ポジション無し/.exec(row)) {
        const found = findAction(result, index)
        result[found].side = result[found].side + '-canceled'
      }

      result.push({
        time: iso,
        type: type,
        message: row,
        side: side
      })
    }
  })

  result = result.filter(x => !/許容外/.exec(x.message))

  if (!useAction) {
    return result.filter(x => x.type !== 'action')
  }

  return result
}

/**
 * Find Action
 * @param {Array} array
 * @param {Number} start
 * @return {Number} found index
 */
function findAction (array, start) {
  let find = 0;

  for (let i = 2; i < 10; i++) {
    c = start - i
    item = array[c]
    if (!item || !item.message) continue
    if (/ActionType/.exec(item.message)) {
      if (/close/.exec(item.side)) break
      if (/open/.exec(item.side)) {
        find = c
        break
      }
    }
  }
  return find
}

/**
 * Condition Statement
 * @param array {Array}
 * @return {Array}
 */
function condStatement (array) {
  return array.map(x => `(time >= timestamp("${x.time}") and time[1] < timestamp("${x.time}"))`)
}

/**
 * Create Output Data
 * @param
 * @return {String}
 */
function createOutputData (startTime, stopTime, suspention, buyEntry, buyEntryCanceled, buyHold, buyExit, buyOutOfLimit, sellEntry, sellEntryCanceled, sellHold, sellExit, sellOutOfLimit, autoBuyPosKeep, autoSellPosKeep, autoPosNone, apiError, sfd, name) {
  return `//@version=4
study("${name}", overlay=true, max_lines_count=500, max_labels_count=500)

show_Line = input(true, "Lines")
show_Autopos = input(true, "ポジション自動調整")
show_Info = input(true, "情報")
show_Warn = input(true, "注意")

bool is_StartTime = ${startTime.join(' or ') || 'false'}
bool is_StopTime = ${stopTime.join(' or ') || 'false'}
bool is_Suspention = ${suspention.join(' or ') || 'false'}
bool is_BuyEntry = ${buyEntry.join(' or ') || 'false'}
bool is_BuyEntryCanceled = ${buyEntryCanceled.join(' or ') || 'false'}
bool is_BuyHold = ${buyHold.join(' or ') || 'false'}
bool is_BuyExit = ${buyExit.join(' or ') || 'false'}
bool is_BuyOutOfLimit = ${buyOutOfLimit.join(' or ') || 'false'}
bool is_SellEntry = ${sellEntry.join(' or ') || 'false'}
bool is_SellEntryCanceled = ${sellEntryCanceled.join(' or ') || 'false'}
bool is_SellHold = ${sellHold.join(' or ') || 'false'}
bool is_SellExit = ${sellExit.join(' or ') || 'false'}
bool is_SellOutOfLimit = ${sellOutOfLimit.join(' or ') || 'false'}
bool is_AutoBuyPosKeep = ${autoBuyPosKeep.join(' or ') || 'false'}
bool is_AutoSellPosKeep = ${autoSellPosKeep.join(' or ') || 'false'}
bool is_AutoPosNone = ${autoPosNone.join(' or ') || 'false'}
bool is_ApiError = ${apiError.join(' or ') || 'false'}
bool is_Sfd = ${sfd.join(' or ') || 'false'}

// Messages
warnMessages = array.new_string()
infoMessages = array.new_string()
color warncolor = color.orange
color infocolor = color.gray

if is_ApiError
    array.push(warnMessages, 'APIエラー')

if is_BuyOutOfLimit
    array.push(warnMessages, '買い上限')

if is_SellOutOfLimit
    array.push(warnMessages, '売り上限')

if is_BuyHold
    array.push(infoMessages, 'ホールド')

if is_SellHold
    array.push(infoMessages, 'ホールド')

if is_AutoBuyPosKeep
    array.push(infoMessages, 'ポジション保有中')

if is_AutoSellPosKeep
    array.push(infoMessages, 'ポジション保有中')

if is_AutoPosNone
    array.push(infoMessages, 'ポジション無し')

plotshape(is_Sfd, style=shape.labeldown, text="SFD", color=color.purple, textcolor=color.white, location=location.bottom, size=size.tiny)
plotshape(is_Suspention, style=shape.labeldown, text="待機", color=color.purple, textcolor=color.white, location=location.bottom, size=size.tiny)
plotshape(is_StopTime, style=shape.labeldown, text="停止", color=color.orange, textcolor=color.white, location=location.bottom, size=size.tiny)
plotshape(is_StartTime, style=shape.labeldown, text="開始", color=color.orange, textcolor=color.white, location=location.bottom, size=size.tiny)
plotshape(is_BuyEntry, style=shape.labelup, text="買", color=color.blue, textcolor=color.white, location=location.belowbar, size=size.tiny)
plotshape(is_BuyEntryCanceled, style=shape.labelup, text="買", color=color.gray, textcolor=color.white, location=location.belowbar, size=size.tiny)
plotshape(is_SellEntry, style=shape.labeldown, text="売", color=color.red, textcolor=color.white, location=location.abovebar, size=size.tiny)
plotshape(is_SellEntryCanceled, style=shape.labeldown, text="売", color=color.gray, textcolor=color.white, location=location.abovebar, size=size.tiny)
plotshape(is_BuyExit ? high : na, style=shape.xcross, color=color.blue, location=location.absolute, size=size.tiny)
plotshape(is_SellExit ? low : na, style=shape.xcross, color=color.red, location=location.absolute, size=size.tiny)

if is_StartTime or is_StopTime
    line.new(bar_index, high, bar_index, low, color=color.orange, extend=extend.both, style=line.style_dotted)

if is_Suspention or is_Sfd
    line.new(bar_index, high, bar_index, low, color=color.purple, extend=extend.both, style=line.style_dotted)

// Warning Labels
if show_Warn and array.size(warnMessages) > 0
    warnyloc = not (is_BuyEntry or is_BuyEntryCanceled) ? yloc.belowbar : yloc.abovebar
    warntext = array.join(warnMessages, '\\n')
    label.new(bar_index, na, '⚠️ ' + warntext, color=warncolor, textcolor=warncolor, yloc=warnyloc, style=label.style_arrowup, size=size.small)

// Information Labels
string infoyloc = yloc.belowbar
string infostyle = label.style_none

for i = 0 to 10
    if (is_BuyEntry[i] or is_BuyEntryCanceled[i])
        infoyloc := yloc.belowbar
        infostyle := label.style_arrowup
        break
    else if (is_SellEntry[i] or is_SellEntryCanceled[i])
        infoyloc := yloc.abovebar
        infostyle := label.style_arrowdown
        break

if show_Info and array.size(infoMessages) > 0
    infotext = array.join(infoMessages, '\\n')
    label.new(bar_index, na, "ⓘ " + infotext, color=infocolor, textcolor=infocolor, yloc=infoyloc, style=infostyle, size=size.small)

// Position Lines
max_bars_back(close, 1000)
${buyEntry.length > 0 ? 'max_bars_back(is_BuyEntry, 1000)' : ''}
${sellEntry.length > 0 ? 'max_bars_back(is_SellEntry, 1000)' : ''}

if show_Line and is_SellExit
    for i = 1 to 1000
        if is_SellEntry[i]
            line.new(bar_index, low, bar_index - i, close[i], color=color.red, width=1, style=line.style_dashed)
            break

if show_Line and is_BuyExit
    for i = 1 to 1000
        if is_BuyEntry[i]
            line.new(bar_index, high, bar_index - i, close[i], color=color.blue, width=1, style=line.style_dashed)
            break`
}