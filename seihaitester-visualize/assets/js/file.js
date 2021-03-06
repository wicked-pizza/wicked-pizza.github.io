
const dropzone = document.getElementById('dropzone')
const fileinput = document.getElementById('file')

fileinput.addEventListener('change', function (e) {
  getFile(e.target.files)
})

dropzone.addEventListener('dragover', function (e) {
  e.preventDefault()
  dropzone.style.background = '#eee'
})

dropzone.addEventListener('dragleave', function (e) {
  e.preventDefault()
  dropzone.style.background = '#fff'
})

dropzone.addEventListener('drop', function (e) {
  e.preventDefault()
  dropzone.style.background = '#fff'

  fileinput.files = e.dataTransfer.files
  getFile(fileinput.files)
}, false)

function getFile (files) {
  if (files.length < 1) return
  if (files.length > 1) return window.alert('アップロードできるファイルは1つだけです')

  const fileData = files[0]
  const reader = new FileReader()

  reader.onerror = function () {
    alert('ファイルの読み込みに失敗しました')
  }

  reader.onload = function() {
    const name = '聖杯テスター履歴: ' + fileData.name.replace(/.csv$/, '')
    const rows = trimArray(reader.result)
    rows.shift()

    historyData = rows.map((row) => {
      const cells = row.split(',')
      const iso = getISOFormat(cells[0], myTimezone)

      return {
        time: iso,
        message: cells[1],
        price: cells[2],
        buyVolume: cells[3],
        sellVolume: cells[4]
      }
    })

    buyEntries = historyData.filter((x) => {
      return /openbuy/.exec(x.message)
    })

    buyExits = historyData.filter((x) => {
      return /closebuy/.exec(x.message)
    })

    sellEntries = historyData.filter((x) => {
      return /opensell/.exec(x.message)
    })

    sellExits = historyData.filter((x) => {
      return /closesell/.exec(x.message)
    })

    startTime = []
    stopTime = []
    suspention = []
    buyEntries = condStatement(buyEntries)
    buyEntriesCanceled = []
    buyExits = condStatement(buyExits)
    buyOutOfLimit = []
    sellEntries = condStatement(sellEntries)
    sellEntriesCanceled = []
    sellExits = condStatement(sellExits)
    sellOutOfLimit = []
    sfd = []
    apiError = []

    const outputData = createOutputData(
      startTime,
      stopTime,
      suspention,
      buyEntries,
      buyEntriesCanceled,
      [],
      buyExits,
      buyOutOfLimit,
      sellEntries,
      sellEntriesCanceled,
      [],
      sellExits,
      sellOutOfLimit,
      [],
      [],
      [],
      apiError,
      sfd,
      name
    )

    exports(outputData)
  }

  reader.readAsText(fileData)
}