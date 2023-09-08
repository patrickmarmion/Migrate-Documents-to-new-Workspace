//Import NPM modules
import axiosInstance from "./Config/axiosInstance.mjs";
import dotenv from 'dotenv';
import fs from 'fs';
import { promises as fspromises } from 'fs';
import pLimit from 'p-limit';
import FormData from 'form-data';

//Import controller functions
import prepForMigration from "./Controllers/prepareDocsForMigration.mjs";
import downloadDocProcess from "./Controllers/downloadDocuments.mjs";
import createDocFromPDF from "./Controllers/createDocInNewWS.mjs";
import updateMigratedDoc from "./Controllers/updateMigratedDoc.mjs";

dotenv.config({ path: ".env" });

const {
    DOCS_TO_BE_MIGRATED_FOLDER_ID: homeFolder,
    ORIGINAL_WORKSPACE_MIGRATED_DOCS_FOLDER_ID: originalWorkspaceMigratedDocsFolderId,
    NEW_WORKSPACE_FOLDER_ID: newWorkspaceFolderId,
    PANDADOC_ACCESS_TOKEN_ORIGINAL_WORKSPACE: originalWorkspaceAccessToken,
    PANDADOC_ACCESS_TOKEN_NEW_WORKSPACE: newWorkspaceAccessToken,
    PATH_TO_DIRECTORY: pathToFile,
    ORGANIZATION_ID: organizationId,
    ORIGINAL_WORKSPACE_ID: originalWorkspaceId,
    NEW_WORKSPACE_ID: newWorkspaceId,
  } = process.env;
  
const headers = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${originalWorkspaceAccessToken}`
    }
};
const newWorkspaceHeaders = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newWorkspaceAccessToken}`
    }
};

const indexScript = async () => {
    try {
        const docs = await prepForMigration.listDocumentsInMigrationFolder(headers, axiosInstance, homeFolder);
        const docDetailsArray = await prepForMigration.retrieveDocumentDetails(docs, headers, axiosInstance);
        const createDocReqArray = await prepForMigration.mapDocDetailsToCreateDocRequest(docDetailsArray, newWorkspaceHeaders, axiosInstance, newWorkspaceFolderId);
        console.log('Number of Docs in this folder to migrate: ' + createDocReqArray.length);

        await downloadDocIndex(createDocReqArray);
    } catch (error) {
        console.error(`Error processing doc: ${error.message}`);
    }
};

const downloadDocIndex = async (createDocReqArray) => {
    const limit = pLimit(2); // Concurrency limit

    const downloadDocRequestsArray = await downloadDocProcess.createDownloadReqArray(createDocReqArray, originalWorkspaceAccessToken);

    const downloadPromises = downloadDocRequestsArray.map(async (downloadReq, index) => {
        await limit(async (index) => {
            try {
                await downloadDocProcess.downloadDoc(downloadReq, index, axiosInstance, fspromises);
                const newDocId = await createDocFromPDF(createDocReqArray[index], index, FormData, fs, pathToFile, axiosInstance, newWorkspaceAccessToken);
                await updateMigratedDoc.moveDocToMigratedFolder(createDocReqArray[index], axiosInstance, originalWorkspaceMigratedDocsFolderId, organizationId, originalWorkspaceId, headers);
                await downloadDocProcess.deleteLocalPDF(`panda${index}.pdf`, fspromises);
                await updateMigratedDoc.pollingDocStatus(newDocId, axiosInstance, newWorkspaceHeaders);
                await updateMigratedDoc.updateNewDocValue(newDocId, createDocReqArray[index], axiosInstance, organizationId, newWorkspaceId, newWorkspaceHeaders);
                await updateMigratedDoc.updateNewDocStatus(newDocId, createDocReqArray[index], axiosInstance, newWorkspaceHeaders);
            } catch (error) {
                console.error(`Error processing doc ${index}: ${error.message}`);
            }
        }, index);
    });

    await Promise.all(downloadPromises);
};

indexScript();

//----NOTES---
//Statuses: This works for draft, completed & declined docs only. However, warning to customers that copied draft docs are not as editable as they are created from a pdf, they also do not carry over fields. 