"use strict";

import { app, BrowserWindow, ipcMain } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import { api } from "./api";
import { WebcastPushConnection } from 'tiktok-live-connector';
import { PosPrinter } from "electron-pos-printer";
const fs = require('fs');
const client = require('https');
//USERNAME
const tiktokUsername = "evemasmr";
const PRINT_MESSAGES = false;
const PRINT_DONATIONS = false;

app.on("ready", async () => {
    //SETUP PRINTER
    const options = {
        preview: false, // Preview in window or print
        margin: "0 0 0 0", // margin of content body
        copies: 1, // Number of copies to print
        printerName: "CD", // printerName: string, check with webContent.getPrinters()
        //printerName: "POS", // printerName: string, check with webContent.getPrinters()
        timeOutPerLine: 50000,
        silent: true,
    };

    // Create a new wrapper object and pass the username
    let tiktokChatConnection = new WebcastPushConnection(tiktokUsername);

    // Connect to the chat (await can be used as well)
    tiktokChatConnection.connect().then(state => {
        console.info(`Connected to roomId ${state.roomId}`);
    }).catch(err => {
        console.error('Failed to connect', err);
    })

    // Define the events that you want to handle
    // In this case we listen to chat messages (comments)
    tiktokChatConnection.on('chat', async data => {
        console.log("MESSAGE ENABLED: " + PRINT_MESSAGES);
        console.log(data.nickname + ": " + data.comment);
        console.log("---------------------------");
        const message = [
            {
                type: "text",
                value: data.nickname + ": " + data.comment,
            }, {
                type: "text",
                value: "---------------------------",
                style: `text-align:center;`,

            },
        ];

        if (PRINT_MESSAGES) {
            PosPrinter.print(message, options)
                .then((response) => {
                    console.log(response);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    })

    // And here we receive gifts sent to the streamer
    tiktokChatConnection.on('gift', async data => {
        console.log("GIFT ENABLED: " + PRINT_DONATIONS);
        console.log(data.nickname + ": " + data.describe);
        console.log("---------------------------");
        var extension = data.profilePictureUrl.split('.').pop().split('?')[0];

        await downloadImage(data.profilePictureUrl, './src/images/' + data.uniqueId + '.' + extension);

        let logo =
            './src/images/' + data.uniqueId + '.' + extension;

        const message = [

            {
                type: "image",
                path: logo, // file path
                position: "center", // position of image: 'left' | 'center' | 'right'
                width: "120px", // width of image in px; default: auto
                height: "100px", // width of image in px; default: 50 or '50px'
            },

            {
                type: "text",
                value: data.nickname + ": " + data.describe,
            }, {
                type: "text",
                value: "---------------------------",
                style: `text-align:center;`,

            },
        ];
        if (PRINT_DONATIONS) {
            
            PosPrinter.print(message, options)
                .then((response) => {
                    console.log(response);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    })

    createWindow();
});



//Handle the ipcMain & ipcRendering comunication
ipcMain.on("api", async (event, request) => {

    let response = await api(request);

    event.reply("api/" + request.controller + "/" + request.action, response);
});




async function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        client.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else {
                // Consume response data to free up memory
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));

            }
        });
    });
}

async function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        },
    });

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
        if (!process.env.IS_TEST) win.webContents.openDevTools();
    } else {
        createProtocol("app");
        // Load the index.html when not in development
        win.loadURL("./index.html");
    }
}