const axios = require('axios');
require('dotenv').config({
    path: ".env"
})
const api_key = process.env.HOME_API_KEY;
const headers = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `API-Key ${api_key}`
    }
};

const docDetails = async (document_id) => {
    let url = `https://api.pandadoc.com/public/v1/documents/${document_id}/details`;
    let response = await axios.get(url, headers);
    let result = await response.data;
    return result
}

module.exports = docDetails;