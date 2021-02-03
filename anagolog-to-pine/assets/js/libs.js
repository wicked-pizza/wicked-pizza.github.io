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

function createOutputData (startTime, buyEntry, buyExit, sellEntry, sellExit, autoPosKeep, autoPosNone) {
  return `//@version=4
study("あなごちゃん履歴", "【:3ω ", overlay=true, max_lines_count=500)

show_Line = input(true, "Lines")
show_Autopos = input(true, "ポジション自動調整")

bool is_StartTime = ${startTime.join(' or ') || 'false'}
bool is_BuyEntry = ${buyEntry.join(' or ') || 'false'}
bool is_BuyExit = ${buyExit.join(' or ') || 'false'}
bool is_SellEntry = ${sellEntry.join(' or ') || 'false'}
bool is_SellExit = ${sellExit.join(' or ') || 'false'}
bool is_AutoPosKeep = ${autoPosKeep.join(' or ') || 'false'}
bool is_AutoPosNone = ${autoPosNone.join(' or ') || 'false'}

plotshape(is_StartTime, style=shape.labeldown, text="開始", color=color.orange, textcolor=color.white, location=location.abovebar, size=size.tiny)
plotshape(is_BuyEntry, style=shape.labelup, text="買", color=color.blue, textcolor=color.white, location=location.belowbar, size=size.tiny)
plotshape(is_BuyEntry, style=shape.labelup, text="買", color=color.blue, textcolor=color.white, location=location.belowbar, size=size.tiny)
plotshape(is_BuyExit ? high : na, style=shape.xcross, color=color.blue, location=location.absolute, size=size.tiny)
plotshape(is_SellEntry, style=shape.labeldown, text="売", color=color.red, textcolor=color.white, location=location.abovebar, size=size.tiny)
plotshape(is_SellExit ? low : na, style=shape.xcross, color=color.red, location=location.absolute, size=size.tiny)
plotshape(show_Autopos and is_AutoPosKeep, style=shape.triangleup, color=color.new(color.gray, 30), text="ポジション保有中", textcolor=color.gray, location=location.belowbar, size=size.tiny)
plotshape(show_Autopos and is_AutoPosNone, style=shape.square, color=color.new(color.gray, 30), text="ポジション無し", textcolor=color.gray, location=location.belowbar, size=size.tiny)

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