const menuButtons = document.querySelectorAll('input[name="type"]')
const copyButton = document.getElementById('copy')
const clearButton = document.getElementById('clear')

menuButtons.forEach((button) => {
  button.addEventListener('change', setType)
})

clearButton.addEventListener('click', () => {
  document.getElementById('input').value = ''
})

copyButton.addEventListener('click', () => {
  copy(exportsData)
})

setType()

/**
 * あなごちゃんか聖杯テスターかを選択する
 */
function setType () {
  const checked = document.querySelector('input[name="type"]:checked')
  const checkedId = checked.getAttribute('id')
  document.body.setAttribute('data-selected', checkedId)
}