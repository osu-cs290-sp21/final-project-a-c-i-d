
export function initializeUI() {
    //===== Leaderboard and Rules =====
    //Modals
    const modalFade = document.getElementById('modal-backdrop')
    const leaderboardModal = document.getElementById('leaderboard-modal')
    const rulesModal = document.getElementById('rules-modal')
    const birdModal = document.getElementById('birds-modal')
    //Buttons
    const leaderboardButton = document.getElementById('leaderboard-button')
    const rulesButton = document.getElementById('rules-button')
    const birdButton = document.getElementById('birds-button')
    

    //===== Opening Modals =====
    const showLeaderboard = () => { //Leaderboard modal
        // console.log("== showing leaderboard")
        modalFade.classList.remove('hidden')
        leaderboardModal.classList.remove('hidden')
    } 
    leaderboardButton.addEventListener('click', showLeaderboard)

    const showRules = () => {       //Rules modal
        // console.log("== showing rules")
        modalFade.classList.remove('hidden')
        rulesModal.classList.remove('hidden')
    } 
    rulesButton.addEventListener('click', showRules)

    const showBirds = () => {       //Birds modal
        modalFade.classList.remove('hidden')
        birdModal.classList.remove('hidden')
    }
    birdButton.addEventListener('click', showBirds)

    //===== Closing Modals =====
    const closeLeaderboard = document.getElementsByClassName('lb-close-button')[0]
    const leaderboardClose = () => {        //Close leaderboard
        modalFade.classList.add('hidden')
        leaderboardModal.classList.add('hidden')
    } 
    closeLeaderboard.addEventListener('click', leaderboardClose)

    const closeRules = document.getElementsByClassName('rules-close-button')[0]
    const rulesClose = () => {              //Close rules
        modalFade.classList.add('hidden')
        rulesModal.classList.add('hidden')
    } 
    closeRules.addEventListener('click', rulesClose)

    const closeBirds = document.getElementsByClassName('birds-close-button')[0]
    const birdsClose = () => {              //Close birds
        modalFade.classList.add('hidden')
        birdModal.classList.add('hidden')
    }
    closeBirds.addEventListener('click', birdsClose)
}

