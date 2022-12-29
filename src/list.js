const axios = require('axios');
require('dotenv').config({ path: ".env" })
const api_key = process.env.HOME_API_KEY;
const homeFolder = process.env.HOMEFOLDERID;
const headers = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `API-Key ${api_key}`
    }
};
let page = 1;
let ids = [];

const list = async () => {
    let results = await result();
    await loops(results);
    return ids
}

const result = async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    let url = `https://api.pandadoc.com/public/v1/documents?status=2&count=100&page=${page}&folder_uuid=${homeFolder}&order_by=-date_created`;
    let response = await axios.get(url, headers);
    let results = await response.data.results;
    let idsArr = results.map(s => s.id);
    page ++
    return idsArr
}

const loops = async (results) => {
    if (results.length == 100) {
            await map(results);
            await list();

    } else {
        await map(results);
    }
    return
}

const map = async (results) => {
    ids.push(...results);
}

module.exports = list;