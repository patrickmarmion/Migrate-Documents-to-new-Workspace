
const createDownloadReqArray = async (createDocReqArray, originalWorkspaceAccessToken) => {
    const downloadReqArray = createDocReqArray.map((doc) => {
        return {
            url: `https://api.pandadoc.com/public/v1/documents/${doc.metadata.migratedDocID}/download${doc.metadata.migratedDocStatus === 'document.completed' ? '-protected' : ''}`,
            headers: {
                'Content-Type': 'application/pdf',
                'Authorization': `Bearer ${originalWorkspaceAccessToken}`
            },
            method: "GET",
            responseType: "arraybuffer",
            responseEncoding: "binary"
        }
    });
    return downloadReqArray
};

const downloadDoc = async (downloadReq, index, axiosInstance, fspromises) => {
    const response = await axiosInstance(downloadReq);
    await fspromises.writeFile(`panda${index}.pdf`, response.data, null);
    console.log(`doc ${index} downloaded`);
};

const deleteLocalPDF = async (filename, fspromises) => {
    await fspromises.unlink(filename);
};

export default {
    createDownloadReqArray,
    downloadDoc,
    deleteLocalPDF
};