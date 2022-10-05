import express from 'express';
const router = express.Router();
import {google} from "googleapis";
import { createDriveLink} from "../helpers/link.js";
import multiparty from "multiparty";
import { uploadBasic } from "../helpers/drive.js";
import {getSheetsSongArray} from "../helpers/sheetsTemplates.js";
const getAuth = async () => {
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.KEY_FILE,
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    })
    const client = await auth.getClient();
    const googleSheets = await google.sheets({ version: "v4", auth: client });
    return {
        auth,
        googleSheets
    }
};
const spreadsheetId = process.env.SHEET_ID;
router.get('/', async (req, res) => {
    try {
        const {auth, googleSheets} = await getAuth();
        let arr = [];
        const getRows = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: "Songs!A2:M"
        });

        if (getRows.data.values) {
            arr = getRows.data.values.map((item, index) => {
                try {
                    const obj = {
                        title: item[0],
                        gtp: item[1] || "",
                        pdf: [],
                        words: item[12] || "",
                        id: index + 2,
                    }
                    for (let i = 1, l = 5; i < l; i++) {
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
        }
        res.json(arr)
    } catch (error) {
        res.json({message: error + "error"});
    }
});
router.delete('/', async (req, res) =>{
    try {
        const rowIndex = req.query.id;
        const {auth, googleSheets} = await getAuth();
        const request_body = {
            auth,
            spreadsheetId,
            resource: {
                requests: [
                    {
                        "deleteDimension": {
                            "range": {
                                "sheetId": 0,
                                "dimension": "ROWS",
                                "startIndex": Number(rowIndex) - 1,
                                "endIndex": Number(rowIndex)
                            }
                        },
                    },
                ]
            }
        };
        await googleSheets.spreadsheets.batchUpdate(request_body).data;
        res.status(204).json({
            "text": "Song deleted)"
        });
    } catch (error) {
        res.status(400).json({
            "text": `Something going wrong( \n ${error}`
        });
    }
});
router.put('/', async (req, res) =>{
    try {
        const form = new multiparty.Form();
        form.parse(req, async (err, fields, files) => {
            const data = {};
            await Promise.all(Object.keys(files).map(async (name) => {
                data[name] = createDriveLink(await uploadBasic(files[name][0]));
            }));
            Object.keys(fields).forEach((field) => {
                data[field] = fields[field][0];
            })
            const {auth, googleSheets} = await getAuth();

            await googleSheets.spreadsheets.values.update({
                auth,
                spreadsheetId,
                range: `Songs!A${data.id}:M`,
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
    } catch (error) {
        res.status(400).json({
            "text": `Something going wrong( \n ${error}`
        });
    }

});

router.post('/', async  (req, res) => {
    try {
        const form = new multiparty.Form();
        form.parse(req, async (err, fields, files) => {
            const data = {}
            await Promise.all(Object.keys(files).map(async (name) => {
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
            const googleSheets = google.sheets({version: "v4", auth: client});
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
        res.status(201).json({
            "text": "everything good)"
        });
    } catch (error) {
        res.status(400).json({
            "text": `Something going wrong( \n ${error}`
        });
    }
})
export default router;
