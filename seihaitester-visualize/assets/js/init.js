const menuButtons = document.querySelectorAll('input[name="type"]')

menuButtons.forEach((button) => {
  button.addEventListener('change', setType)
})

setType()

function setType () {
  const checked = document.querySelector('input[name="type"]:checked')
  const checkedId = checked.getAttribute('id')
  document.body.setAttribute('data-selected', checkedId)
}