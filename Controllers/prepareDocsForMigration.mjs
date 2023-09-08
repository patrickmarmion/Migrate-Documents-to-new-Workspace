
const listDocumentsInMigrationFolder = async (headers, axiosInstance, homeFolder) => {
    let page = 1;
    let docs = [];
    while (true) {
        const response = await axiosInstance.get(`https://api.pandadoc.com/public/v1/documents?status=0&status=2&status=12&count=100&page=${page}&folder_uuid=${homeFolder}&order_by=-date_created`, headers);
        if (response.data.results.length == 0) break;
        page++
        docs.push(...response.data.results)
    }
    return docs
};

const retrieveDocumentDetails = async (documents, headers, axiosInstance) => {

    const version2Docs = documents.filter(doc => doc.version !== 2);
    const docDetailURLs = version2Docs.map(doc => `https://api.pandadoc.com/public/v1/documents/${doc.id}/details`);
    const docDetailsReq = docDetailURLs.map(async (url) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const response = await axiosInstance.get(url, headers);
            return response.data
        } catch (error) {
            console.error(`Error in API request to ${url}:`, error);
            throw error;
        }
    });
    const docDetailsArray = await Promise.all(docDetailsReq);
    return docDetailsArray
};

const mapDocDetailsToCreateDocRequest = async (documents, newWorkspaceHeaders, axiosInstance, newWorkspaceFolderId) => {
    let docIds = [];

    const membersResult = await axiosInstance.get("https://api.pandadoc.com/public/v1/members/", newWorkspaceHeaders);
    const members = membersResult.data.results;

    const detailMap = documents.map((doc) => {
        const recipients = doc.recipients.map((recipient, index) => {
            const role = recipient.role ? recipient.role : `Recipient${index}`
            return {
                "email": recipient.email,
                "first_name": recipient.first_name,
                "last_name": recipient.last_name,
                "role": role
            }
        });
        const owner = doc.created_by && members.some((member) => member.email === doc.created_by.email) ? doc.created_by.email : members.filter(member => member.role === "Admin")[0].email;

        return {
            "name": doc.name,
            "recipients": recipients,
            "folder_uuid": newWorkspaceFolderId,
            "owner": {
                "email": owner
            },
            "metadata": {
                "migratedDocID": doc.id,
                "migratedDocStatus": doc.status,
                "migratedDocGrandTotal": doc.grand_total.amount,
                "migratedDocCurrency": doc.grand_total.currency
            },
            "parse_form_fields": true
        }
    });
    docIds.push(...detailMap);
    return docIds
};

export default {
    listDocumentsInMigrationFolder,
    retrieveDocumentDetails,
    mapDocDetailsToCreateDocRequest,
};