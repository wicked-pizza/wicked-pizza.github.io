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
    let historyData = parseHistoryDataByTester(rows, myTimezone)
    dist(historyData, [], name)
    historyLog(historyData)
  }

  reader.readAsText(fileData)
}