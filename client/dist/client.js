const fadeClass = document.getElementsByClassName('fade')
const playButton = document.getElementById('play-button')
const playForm = document.getElementById('play-form')
const playNickname = document.getElementById('play-nickname')

fades = Array.from(fadeClass)

playButton.addEventListener('click', (event) => {
  console.log('Submit')
  fades.map(f => f.classList.add('end'))
  event.preventDefault()
})
