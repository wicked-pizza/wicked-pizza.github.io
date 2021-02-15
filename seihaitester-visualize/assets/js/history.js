function historyLog (items) {
  const parent = document.getElementById('history-data')
  parent.innerHTML = ''

  backtrace(items).reverse().forEach((row) => {
    const el = document.createElement('div')
    el.classList.add('item')

    switch (row._type) {
      case 'tester':
      case 'action':
      case 'price':
        if (/close/.exec(row.side)) {
          el.innerHTML = htmlCloseOrder(row)
          parent.appendChild(el)
        }
        break
      case 'text':
        el.innerHTML = htmlMessage(row)
        parent.appendChild(el)
        break
    }
  })
}

function backtrace (items) {
  return items.map((item, i) => {
    if (/close/.exec(item.side)) {
      const openOrder = findOpenOrder(items, i)
      item.openOrder = openOrder
    }
    return item
  })
}

function htmlCloseOrder (data) {
  const value = data.price - data.openOrder.price
  const valueClass = value >= 0 ? 'win' : 'lose'
  const volume = Math.round(data.volume * 100) / 100
  const openVolume = Math.round(data.openOrder.volume * 100) / 100

  return `
    <div>決済</div>
    <div class="open">${data.openOrder.side} @ ${openVolume}</div>
    <div class="name">→ ${data.side} @ ${volume}</div>
    <div class="value ${valueClass}">${value}</div>
    <div class="date">${format(new Date(data.time), 'YYYY年MM月DD日 HH:mm')}</div>
 `
}

function htmlOpenOrder (data) {
  const volume = Math.round(data.volume * 100) / 100
  return `${data.side} @ ${volume}`
}

function htmlMessage (data) {
  return data.message
}

function findOpenOrder (items, start) {
  let i = start - 1
  for (; i > 0; i--) {
    let item = items[i]
    if (/open/.exec(item.side)) {
      break
    }
  }
  return items[i]
}