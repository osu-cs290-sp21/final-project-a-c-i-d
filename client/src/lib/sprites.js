const { protocol, hostname, origin, port } = window.location;

// const ignorePort = port === 8080 || port === 80 || port === 443;

export const asset = name => [root, name].join('/');

const root = origin;

export const birdNames = ['andy', 'cole', 'david', 'harry', 'iain', 'olive', 'perry', 'sahana', 'todd', 'bella'];

// export const sprite = (name, flipped = false) => asset(['img', 'sprites', 'svg', name + (flipped ? '-flip' : '') + '.svg'].join('/'));
export const sprite = (name, flipped = false) => asset(['img', 'sprites', 'svg', name + (flipped ? '-flip' : '') + '.svg'].join('/'));
export const birdAssetNames = [...birdNames.map(name => name)];
// const choose = arr => arr[Math.floor(Math.random() * arr.length)];

// Select the bird within the index array
// export const birdSkin = (x) => birdAssetNames[x];
