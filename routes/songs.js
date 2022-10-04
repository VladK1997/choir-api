import express from 'express';
const router = express.Router();
import {google} from "googleapis";
import { createDriveLink} from "../helpers/link.js";
import multiparty from "multiparty";
import { uploadBasic } from "../helpers/drive.js";
import {getSheetsSongArray} from "../helpers/sheetsTemplates.js";
router.get('/', async (req, res) => {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: process.env.KEY_FILE,
            scopes: "https://www.googleapis.com/auth/spreadsheets",
        })
        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: "v4", auth: client });

        const spreadsheetId = process.env.SHEET_ID;
        const getRows = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: "Songs!A2:M"
        })
        const arr = getRows.data.values.map(item => {
            try {
                if(item[0].length) {
                    console.log(item[0]);
                }
                const obj = {
                    title: item[0],
                    gtp: item[1] || "",
                    pdf: [],
                    words: item[12] || "",
                }
                for (let i = 1, l = 5; i < l; i++) {
                    if (item[2 * i].length) {
                        console.log(item[2 * i]);
                    }
                    if (item[2*i]) {
                        obj.pdf.push({
                            title: item[2*i] || "",
                            link: item[2*i + 1] || ""
                        })
                    }
                }
                return obj
            } catch (err) {

            }
        })
        res.json(arr)
    } catch (err) {
        res.json({message: err + "error"});
    }
});
router.post('/create', async  (req, res) => {
    const form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
        const data = {}
        await Promise.all(Object.keys(files).map( async (name) => {
            data[name] = createDriveLink(await uploadBasic(files[name][0]));
        }));
        Object.keys(fields).forEach((field) => {
            data[field] = fields[field][0];
        })
        const auth = new google.auth.GoogleAuth({
            keyFile: process.env.KEY_FILE,
            scopes: "https://www.googleapis.com/auth/spreadsheets",
        })
        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: "v4", auth: client });
        const spreadsheetId = process.env.SHEET_ID;
        await googleSheets.spreadsheets.values.append({
            auth,
            spreadsheetId,
            range: "Songs",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [
                    getSheetsSongArray(data)
                ]
            }
        })
    });
    res.status(200).json({
        "text": "everything good)"
    });
})
export default router;
