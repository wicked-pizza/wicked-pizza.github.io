let exportsData = null
const myTimezone = '+0900'
const copyButton = document.getElementById('copy')
const msg = document.getElementById('message')

copyButton.addEventListener('click', () => {
  copy(exportsData)
})

function exports (data) {
  output.innerHTML = exportsData = data
}

function copy (data) {
  if (!data) {
    return alert('コピーするデータが空です')
  }

  if (navigator.clipboard) {
    navigator.clipboard.writeText(data)
    writeMessage('クリップボードにコピーしました')
  }
}

function writeMessage (data) {
  msg.innerHTML = data

  setTimeout(() => {
    msg.innerHTML = ''
  }, 3000)
}

function getISOFormat (x, tz) {
  if (!x || typeof x !== 'string') return

  return x.trim()
    .replace(/\//g, '-')
    .replace(' ', 'T')
    .replace(/T(\d):/, 'T0$1:') + tz
}

function trimArray (row) {
  return row.split('\n').map(x => x.trim()).filter(x => !!x)
}

function createOutputData (startTime, stopTime, suspention, buyEntry, buyExit, sellEntry, sellExit, autoBuyPosKeep, autoSellPosKeep, autoPosNone, sfd, name) {
  return `//@version=4
study("${name}", overlay=true, max_lines_count=500)

show_Line = input(true, "Lines")
show_Autopos = input(true, "ポジション自動調整")

bool is_StartTime = ${startTime.join(' or ') || 'false'}
bool is_StopTime = ${stopTime.join(' or ') || 'false'}
bool is_Suspention = ${suspention.join(' or ') || 'false'}
bool is_BuyEntry = ${buyEntry.join(' or ') || 'false'}
bool is_BuyExit = ${buyExit.join(' or ') || 'false'}
bool is_SellEntry = ${sellEntry.join(' or ') || 'false'}
bool is_SellExit = ${sellExit.join(' or ') || 'false'}
bool is_AutoBuyPosKeep = ${autoBuyPosKeep.join(' or ') || 'false'}
bool is_AutoSellPosKeep = ${autoSellPosKeep.join(' or ') || 'false'}
bool is_AutoPosNone = ${autoPosNone.join(' or ') || 'false'}
bool is_Sfd = ${sfd.join(' or ') || 'false'}

plotshape(show_Autopos and is_AutoBuyPosKeep, style=shape.arrowup, color=color.gray, text="買いポジション保有中", textcolor=color.gray, location=location.belowbar, size=size.normal)
plotshape(show_Autopos and is_AutoSellPosKeep, style=shape.arrowdown, color=color.gray, text="売りポジション保有中", textcolor=color.gray, location=location.abovebar, size=size.normal)
plotshape(show_Autopos and is_AutoPosNone, style=shape.arrowup, color=color.gray, text="ポジション無し", textcolor=color.gray, location=location.belowbar, size=size.normal)
plotshape(is_Sfd, style=shape.labeldown, text="SFD", color=color.purple, textcolor=color.white, location=location.bottom, size=size.tiny)
plotshape(is_Suspention, style=shape.labeldown, text="待機", color=color.purple, textcolor=color.white, location=location.bottom, size=size.tiny)
plotshape(is_StopTime, style=shape.labeldown, text="停止", color=color.orange, textcolor=color.white, location=location.bottom, size=size.tiny)
plotshape(is_StartTime, style=shape.labeldown, text="開始", color=color.orange, textcolor=color.white, location=location.bottom, size=size.tiny)
plotshape(is_BuyEntry, style=shape.labelup, text="買", color=color.blue, textcolor=color.white, location=location.belowbar, size=size.tiny)
plotshape(is_SellEntry, style=shape.labeldown, text="売", color=color.red, textcolor=color.white, location=location.abovebar, size=size.tiny)
plotshape(is_BuyExit ? high : na, style=shape.xcross, color=color.blue, location=location.absolute, size=size.tiny)
plotshape(is_SellExit ? low : na, style=shape.xcross, color=color.red, location=location.absolute, size=size.tiny)

if is_StartTime or is_StopTime
    line.new(bar_index, high, bar_index, low, color=color.orange, extend=extend.both, style=line.style_dotted)

if is_Suspention or is_Sfd
    line.new(bar_index, high, bar_index, low, color=color.purple, extend=extend.both, style=line.style_dotted)

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