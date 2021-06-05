
const show = element => element.classList.remove('hidden');
const hide = element => element.classList.add('hidden');

export function showLeaderboard() {
    const background = document.getElementById('modal-backdrop');
    const lb = document.getElementById('birds-modal');

    return fetch('http://localhost:3000/leaderboard', { method: 'GET' })
        .then(response => response.text())
        .then(html => {
            console.log(html)
            lb.innerHTML = html;
            show(background);
            show(lb);
        })
        .catch(e => console.error(e));
}