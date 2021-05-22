import { Svg } from 'matter-js'

// Iain's Divine SVG Library

export const loadSvg = url => fetch(url)
    .then(response => response.text())
    .then(raw => new window.DOMParser().parseFromString(raw, 'image/svg+xml'));


export const select = (root, selector) => Array.prototype.slice.call(root.querySelectorAll(selector));

export const vertexSets = paths => paths.map(path => Svg.pathToVertices(path));

export const loadVertexFromSVG = url => loadSvg(url)
    .then(root => select(root, 'path'))
    .then(paths => vertexSets(paths));