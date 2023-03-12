import express from 'express';
import cors from 'cors';
import http from "http";
import 'dotenv/config';
import songs from "./routes/songs.js";
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
async function start() {
    try {
        app.use(cors({
            origin: "https://vladk1997.github.io",
            methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
        }));
        app.use('/songs',songs);
        app.use(express.json());
        // app.use(express.static('public'));
        server.listen(PORT, () => console.log(
            "Server started on http://" + HOST + ":" + PORT
        ))
    } catch (e) {
        console.log(e);
    }
}
start();
