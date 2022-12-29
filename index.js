let list = require('./src/list.js');
let docDetails = require('./src/details.js');
let downloadDoc = require('./src/download.js');
let subscribe = require('./src/polling.js');
let changeStatus = require('./src/status.js');
let {
    database,
    createDB,
    sizeFile
} = require('./database/entry.js');
const create = require('./src/create.js');

const index = async () => {
    //Loops though Folder of document's to be migrated and returns ids of Completed Documents
    let ids = await list();
    console.log('Number of Docs in this folder to migrate: ' + ids.length);


    for (const id of ids) {
        document_id = id;

        //Retrieve details of each document and download them
        let result = await docDetails(document_id);
        await downloadDoc(result);

        //Store certain details of document into a json log file 
        //then create a new doc in other workspace from the downloaded PDF
        let newDocId = await db(result);

        //Change status of newly created doc to Completed
        await changeStatus(newDocId);
    }
}

const db = async (result) => {
    let dbase = await database(result)
        .then(data => createDB(data))
        .catch(err => console.log(err));

    let check = await sizeFile(dbase)
        .then(res => create(res.result))
        .then(id => subscribe(id))
        .catch(err => console.log(err));

    return check
}

index();