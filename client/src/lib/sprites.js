const { protocol, hostname, origin, port } = window.location;

// const ignorePort = port === 8080 || port === 80 || port === 443;

export const asset = name => [root, name].join('/');

const root = origin;

export const birdNames = ['bella', 'harry', 'olive', 'perry', 'sahana', 'todd'];
export const ogBirds = ['andy-bluebird', 'david-penguin', 'cole-kakapo', 'iain-shamathrush'];

// export const sprite = (name, flipped = false) => asset(['img', 'sprites', 'svg', name + (flipped ? '-flip' : '') + '.svg'].join('/'));
export const sprite = (name, flipped = false) => asset(['img', 'sprites', 'svg', name + (flipped ? '-flip' : '') + '.svg'].join('/'));
export const birdAssetNames = [...ogBirds, ...birdNames.map(name => name + '-day')];
const choose = arr => arr[Math.floor(Math.random() * arr.length)];
export const randomBird = () => choose(birdAssetNames);
