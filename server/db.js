const { GoogleSpreadsheet } = require('google-spreadsheet');

const rowReferenceCache = new Map() // [name, { row_ref, value }]

const sheets = {
    doc: null,
    main: null,
    rows: [],
};

async function init() {
    const docId = process.env.GOOGLE_API_SHEETS_DOCUMENT_ID || '1Ba5RSg3QBAaN1sRQ0NNQTnU1Fd84zd9bXWbQCKMTMaQ';
    const creds = process.env.GOOGLE_API_AUTH_JSON || require('./credentials/creds.json');
    sheets.doc = new GoogleSpreadsheet(docId)
    sheets.doc.useServiceAccountAuth(creds);
    await sheets.doc.loadInfo();
    sheets.main = sheets.doc.sheetsByTitle['leaderboard'];
    await sync();
}

async function sync() {
    if (sheets.rows.length > 0) {
        await sheets.main.saveUpdatedCells();
    }
    for (const [k,v] of rowReferenceCache.entries()) {
        rowReferenceCache.delete(k);
    }
    const rows = await sheets.main.getRows();
    sheets.rows = [];
    let idx = 0;
    for (const row of rows) {
        const name = row['nickname'];
        const score = row['score'];
        if (!(name || score)) { continue; }
        rowReferenceCache.set(name, {...{row_ref: idx}, score});
        sheets.rows[idx] = row;
        idx++;
    }
    // sheets.rows = rows;
}

async function set(key, value) {
    if (rowReferenceCache.has(key)) {
        const { row_ref } = rowReferenceCache.get(key);
        sheets.rows[row_ref]['score'] = value;
    } else {
        const row = await sheets.main.addRow({
            'nickname': key,
            'score': value
        });
        sheets.rows.push(row);
    }
    await sync();
}

function get(key) {
    if (rowReferenceCache.has(key)) {
        const { row_ref } = rowReferenceCache.get(key);
        return sheets.rows[row_ref]['score'];
    }
    return null;
}

function entries() {
    const acum = []
    for (const row of sheets.rows) {
        console.log(row);
        const [name,score] = [row['nickname'], row['score']];
        acum.push([name,score]);
    }
    return acum;
}

function has(key) {
    return !!get(key);
}

module.exports = { init, set, get, entries, has };