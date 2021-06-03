const startClass = document.getElementsByClassName('start')
const playButton = document.getElementById('play-button')
const playNickname = document.getElementById('play-nickname')

const starts = Array.from(startClass)

playButton.addEventListener('click', () => {
  console.log('Play')
  playButton.disabled = 'true'
  starts.map(f => f.classList.add('fade'))
  setTimeout(() => {
    starts.map(f => f.classList.add('gone'))
  }, 1000)
})
