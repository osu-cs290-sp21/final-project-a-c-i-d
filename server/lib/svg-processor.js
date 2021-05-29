const sharp = require('sharp');
const fs = require('fs');

const copyright = {
    exif: {
        IFD0: { Copyright: 'Andrea Tongsak' }
    }
};

const svg = buffer => sharp(buffer);
const render = format => ([width, height]) => buffer =>
    svg(buffer)
        .resize({ width, height })
        .toFormat(format, { quality: 100, lossless: true })
        .withMetadata(copyright)
        .toBuffer();

const readf = path => fs.promises.readFile(path, 'utf8');

const png  = render('png');
const webp = render('webp');
const renderSprite = webp([600,600]);
const sprite = path => readf(path).then(buffer => renderSprite(buffer));

module.exports = { sprite };