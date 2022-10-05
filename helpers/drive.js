import { GoogleAuth } from "google-auth-library";
import {google} from "googleapis";
export const uploadBasic = async (uploadedFile) => {
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.KEY_FILE,
        scopes: "https://www.googleapis.com/auth/drive",
    })

    const service = google.drive({version: 'v3', auth});
    const fileMetadata = {
        name: uploadedFile.originalFilename,
        parents: ["1p07JLv6LXj3cixHefA09IQ1RwBVr6SJT"],
    };
    try {
        const file = await service.files.create({
            resource: fileMetadata,
            media: uploadedFile,
            fields: 'id',
        });
        return file.data.id;
    } catch (err) {
        throw err;
    }
}
