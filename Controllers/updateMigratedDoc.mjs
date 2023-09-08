const moveDocToMigratedFolder = async (reqBody, axiosInstance, originalWorkspaceMigratedDocsFolderId, organizationId, originalWorkspaceId, headers) => {
    const body = {
        "target_folder": originalWorkspaceMigratedDocsFolderId,
        "items": [
            reqBody.metadata.migratedDocID
        ]
    };
    await axiosInstance.post(`https://api.pandadoc.com//org/${organizationId}/ws/${originalWorkspaceId}/move/documents`, body, headers)
};

const pollingDocStatus = async (newDocId, axiosInstance, newWorkspaceHeaders) => {
    let response = await axiosInstance.get(`https://api.pandadoc.com/public/v1/documents/${newDocId}`, newWorkspaceHeaders);
    if (response.data.status !== 'document.draft') {
      console.log('Polling...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      await pollingDocStatus(newDocId, axiosInstance, newWorkspaceHeaders);
    }
};

const updateNewDocValue = async (newDocId, reqBody, axiosInstance, organizationId, newWorkspaceId, newWorkspaceHeaders) => {
    const body = {
        "type":"1",
        "amount": reqBody.metadata.migratedDocGrandTotal,
        "currency": reqBody.metadata.migratedDocCurrency
    }
    await axiosInstance.patch(`https://api.pandadoc.com/org/${organizationId}/ws/${newWorkspaceId}/documents/${newDocId}/grand_total`, body, newWorkspaceHeaders);
};

const updateNewDocStatus = async (newDocId, reqBody, axiosInstance, newWorkspaceHeaders) => {
    if (reqBody.metadata.migratedDocStatus === "document.draft") return;
    else if (reqBody.metadata.migratedDocStatus === "document.completed") {
        const body = {
            "status": 2,
            "notify_recipients": false
        };
        await axiosInstance.patch(`https://api.pandadoc.com/public/v1/documents/${newDocId}/status`, body, newWorkspaceHeaders);
    }
    else if (reqBody.metadata.migratedDocStatus === "document.declined") {
        const body = {
            "status": 12,
            "notify_recipients": false
        }; 
        await axiosInstance.patch(`https://api.pandadoc.com/public/v1/documents/${newDocId}/status`, body, newWorkspaceHeaders);
    }
    console.log(`Document Status changed to ${reqBody.metadata.migratedDocStatus}`)
};


export default {
    moveDocToMigratedFolder,
    pollingDocStatus,
    updateNewDocValue,
    updateNewDocStatus
};