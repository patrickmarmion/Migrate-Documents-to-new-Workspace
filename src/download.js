const axios = require('axios');
const fs = require('fs');
require('dotenv').config({
    path: ".env"
})
const api_key = process.env.HOME_API_KEY;


const downloadDoc = async (result) => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    const config = {
        url: `https://api.pandadoc.com/public/v1/documents/${result.id}/download-protected`,
        headers: {
            'Content-Type': 'application/pdf',
            'Authorization': `API-Key ${api_key}`
        },
        method: "GET",
        responseType: "arraybuffer",
        responseEncoding: "binary"
    }
    let response = await axios(config);
    fs.writeFileSync('panda.pdf', response.data, null);
    console.log('Document downloaded');
    return 
}

module.exports = downloadDoc;