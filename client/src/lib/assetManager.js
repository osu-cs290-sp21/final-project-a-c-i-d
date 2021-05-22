import * as iainsDivineSVGLibrary from './svg'

export const webSource = 'http://localhost:9000';

export const asset = name => [webSource, name].join('/');

// God help us. I'm creating singletons like there is no tomorrow.
export const AssetManager = {
    store: new Map(),
    queue: [],
    register([name, url]) {
        this.queue.push([name, window.location.href + url]);
    },
    asset(name) {
        if (!this.initialized) throw 'Asset manager has not been initialized yet!';
        return this.store.get(name);
    },
    async init() {
        const queue = this.queue;
        const threads = [];
        for (const [name, url] of queue) {
            const thread = iainsDivineSVGLibrary.loadVertexFromSVG(url)
                .then(vertices => this.store.set(name, vertices))
                .then(() => queue.splice(queue.indexOf([name, url]), 1))
                .catch(error => console.error('Error loading', name, 'form', url, error));
            threads.push(thread);
        }
        const successfullyLoaded = await Promise.all(threads);
        const unsuccessfullyLoaded = this.queue;

        if (unsuccessfullyLoaded.length) throw unsuccessfullyLoaded;
        this.initialized = true;
        return successfullyLoaded;
    }
};