

let hostname = undefined;
let webRoot = undefined;

const asset = name => [webSource, name].join('/');
const initModule = (config) => {
    [
        hostname,
        webRoot
     ]
     = /* lol */
     [
        config.hostname,
        config.public
     ];
};

module.export = initModule;

console.log(hostname, webRoot);