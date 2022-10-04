import express from 'express';
const router = express.Router();
import {google} from "googleapis";
import {getDriveDownloadLink, createDriveLink} from "../helpers/link.js";
import multiparty from "multiparty";
import { uploadBasic } from "../helpers/drive.js";
import {getSheetsSongArray} from "../helpers/sheetsTemplates.js";
const filesFieldsNames = ["gtp", "pdf1_file", "pdf2_file", "pdf3_file", "pdf4_file", "pdf5_file"];
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
            range: "Songs!A2:M100"
        })
        const arr = getRows.data.values.map(item => {
            const obj = {
                title: item[0],
                gtp: item[1],
                pdf: [],
                words: item[12],
            }
            for (let i = 1, l = 5; i < l; i++) {
                if (item[2*i]) {
                    obj.pdf.push({
                        title: item[2*i],
                        link: getDriveDownloadLink(item[2*i + 1])
                    })
                }
            }
            return obj
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
    res.json({
        "text": "everything good)"
    })
})
export default router;
