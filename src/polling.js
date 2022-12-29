const axios = require('axios');
require('dotenv').config({ path: ".env" })
const new_api_key = process.env.NEW_API_KEY;
const headers = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `API-Key ${new_api_key}`
    }
};

const subscribe = async (id) => {
    let response = await axios.get(`https://api.pandadoc.com/public/v1/documents/${id}`, headers);
  
    if (response.data.status !== 'document.draft') {
      console.log('Polling...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      await subscribe(id);

    } 
    return id
  }

module.exports = subscribe;