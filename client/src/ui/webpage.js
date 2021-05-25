
export function initializeUI() {
    //===== Leaderboard and Rules =====
    //Modals
    const modalFade = document.getElementById('modal-backdrop')
    const lbModal = document.getElementById('leaderboard-modal')
    const rModal = document.getElementById('rules-modal')
    //Buttons
    const lbButton = document.getElementById('leaderboard-button')
    const rButton = document.getElementById('rules-button')
    console.log(modalFade, lbModal, rModal, lbButton, rButton)

    //===== Opening Modals =====
    const showLeaderboard = () => { //Leaderboard modal
        console.log("== showing leaderboard")
        modalFade.classList.remove('hidden')
        lbModal.classList.remove('hidden')
    } 
    lbButton.addEventListener('click', showLeaderboard)

    const showRules = () => { //Rules modal
        console.log("== showing rules")
        modalFade.classList.remove('hidden')
        rModal.classList.remove('hidden')
    } 
    rButton.addEventListener('click', showRules)

    //===== Closing Modals =====
    const closeLeaderboard = document.getElementsByClassName('lb-close-button')[0]
    const leaderboardClose = () => {
        modalFade.classList.add('hidden')
        lbModal.classList.add('hidden')
    } 
    closeLeaderboard.addEventListener('click', leaderboardClose)

    const closeRules = document.getElementsByClassName('rules-close-button')[0]
    const rulesClose = () => {
        modalFade.classList.add('hidden')
        rModal.classList.add('hidden')
    } 
    closeRules.addEventListener('click', rulesClose)
    
}

