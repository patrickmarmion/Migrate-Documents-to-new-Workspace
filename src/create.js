const rp = require('request-promise');
const fs = require('fs');
require('dotenv').config({
    path: ".env"
})
const new_api_key = process.env.NEW_API_KEY;
const folderId = process.env.NEWFOLDERID;
let data;

const requestBody = (result) => {
    if (result.version == 2) {
        return new Promise((resolve) => {
            let recipients = [];
            let recip = result.recipients;
            recip.map(({
                email,
                first_name,
                last_name,
                role
            }) => {
                recipients.push({
                    "email": email,
                    "first_name": first_name,
                    "last_name": last_name,
                    "role": role
                });
            });
            data = {
                "name": `${result.name}`,
                "recipients": recipients,
                "folder_uuid": folderId,
                "metadata": {
                    "migratedDocID": result.id
                },
                "parse_form_fields": false
            }
            return resolve(data)
        })
    } else {
        return new Promise((resolve) => {
            data = {
                "name": `${result.name}`,
                "recipients": [],
                "folder_uuid": folderId,
                "metadata": {
                    "migratedDocID": result.id
                },
                "parse_form_fields": false
            }
            return resolve(data)
        })
    }
}

const upload = (reqBody) => {
    return new Promise((resolve) => {
        let body = JSON.stringify(reqBody);
        resolve(
            rp({
                method: 'POST',
                url: 'https://api.pandadoc.com/public/v1/documents/',
                headers: {
                    'Authorization': `API-Key ${new_api_key}`
                },
                formData: {
                    file: {
                        'value': fs.createReadStream('/Users/patrickmarmion/Documents/VSCode/Migrations/Workspace/panda.pdf'),
                        'options': {
                            'filename': 'panda.pdf',
                            'contentType': null
                        }
                    },
                    data: body
                }
            })
        )
    })
}

const create = async (result) => {
    let response = await requestBody(result)
        .then(dataa => upload(dataa))
        .then(res => JSON.parse(res))
        .then((details) => details.id)
        .catch(error => {
            console.log(error);
        });
    console.log('new doc id: ', response);
    return response
}

module.exports = create;