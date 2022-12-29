const axios = require('axios');
require('dotenv').config({ path: ".env" })
const new_api_key = process.env.NEW_API_KEY;
const headers = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `API-Key ${new_api_key}`
    }
};

const changeStatus = async (newDoc) => {
    const  body = {
        "status": 2,
        "notify_recipients": false
    };
    await axios.patch(`https://api.pandadoc.com/public/v1/documents/${newDoc}/status`, body, headers);
    return
}

module.exports = changeStatus;