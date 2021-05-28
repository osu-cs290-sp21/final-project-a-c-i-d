

export const awakenRickAstley = () => {
    const source = (src,type) => {
        const sourceElement = document.createElement('source');
        sourceElement.setAttribute('src', src);
        sourceElement.setAttribute('type', type);
        return sourceElement;
    }
    // const video = document.createElement('video').appendChild(source('img/finale.webm', 'video/webm'));
    // const audio = document.createElement('audio').appendChild(source('sounds/finale.webm', 'audio/webm'));
    const video = document.getElementById('finale-video');
    video.classList.remove('gone');
    video.classList.add('fill-display');
    const audio = document.getElementById('finale-audio');
    [video, audio].map(e => e.play());
}