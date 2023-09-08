
const createDocFromPDF = async (reqBody, index, FormData, fs, pathToFile, axiosInstance, newWorkspaceAccessToken) => {
    const body = JSON.stringify(reqBody);

    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(pathToFile + `/panda${index}.pdf`), {
            filename: `panda${index}.pdf`,
            contentType: null
        });
        form.append('data', body);

        const response = await axiosInstance.post('https://api.pandadoc.com/public/v1/documents/', form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${newWorkspaceAccessToken}`
            }
        });
        return response.data.id;
    } catch (error) {
        throw error;
    }
};

export default createDocFromPDF;