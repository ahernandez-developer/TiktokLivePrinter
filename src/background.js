"use strict";

import { app, BrowserWindow, ipcMain } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import { api } from "./api";
import { WebcastPushConnection } from 'tiktok-live-connector';
import { PosPrinter } from "electron-pos-printer";
console.log(".......................");
console.log("BACKGROUND");
ipcMain.setMaxListeners(0);
const fs = require('fs');
const client = require('https');
let win = null;
//USERNAME
const tiktokUsername = "estrellazu1";
const PRINT_MESSAGES = true;
const PRINT_DONATIONS = true;
const PRINT_SOCIAL = true;
const COMMENTS_QUANTITY_TO_PRINT = 2;
const DONATIONS_QUANTITY_TO_PRINT = 2;
const options = {
    preview: false, // Preview in window or print
    margin: "0 0 0 0", // margin of content body
    copies: 1, // Number of copies to print
    printerName: "CD", // printerName: string, check with webContent.getPrinters()
    //printerName: "POS", // printerName: string, check with webContent.getPrinters()
    timeOutPerLine: 50000,
    silent: true,
};
//add users to a queue for printing commets only after reach 5 comments and then remove them from the queue
let queue = [];

let queuePrinting = false;
function addToQueue(user, lastComment) {
    //add user to queue with comment quantity if not already in queue
    let userInQueue = queue.find(x => x.user === user);
    if (!userInQueue) {
        queue.push({ user: user, quantity: 1, lastComment: lastComment });

    } else {
        //increase quantity of user in queue
        queue.find(x => x.user === user).quantity++;
        queue.find(x => x.user === user).lastComment = lastComment;
    }
}

//check if users in queue are ready to print and if so print them
function checkQueue() {
    // console.log(".......................");
    // console.log("CHECKING QUEUE");
    // console.log(".......................");
    //print the queue users
    // for (let i = 0; i < queue.length; i++) {

    //         console.log("Printing user: " + queue[i].user + " with quantity: " + queue[i].quantity + " and last comment: " + queue[i].lastComment);

    // }

    // console.log(".......................");
    if (queuePrinting) {
        return;
    }
    queuePrinting = true;
    //check for users in queue with quantity greater than or equal to 5
    let usersToPrint = queue.filter(x => x.quantity >= COMMENTS_QUANTITY_TO_PRINT);
    //remove users from queue
    queue = queue.filter(x => x.quantity < COMMENTS_QUANTITY_TO_PRINT);
    //print users
    usersToPrint.forEach(user => {
        // console.log("PRINTING COMMENT: " + user.user);
        const message = [
            {
                type: "text",
                value: user.user + ": " + user.lastComment,
            }, {
                type: "text",
                value: "---------------------------",
                style: `text-align:center;`,

            },
        ];
        PosPrinter.print(message, options)
            .then((response) => {
                console.log(response);
            }).catch((error) => {
                console.log(error);
            });
    });
    queuePrinting = false;


}

//add users to a queue for printing after reach 5 donations and then remove them from the queue
let queueDonations = [];

function addToDonationQueue(user, lastDonation, image) {
    //add user to queue with donation quantity and last donation if not already in queue
    let userInQueue = queueDonations.find(x => x.user === user);
    if (!userInQueue) {
        queueDonations.push({ user: user, quantity: 1, lastDonation: lastDonation, image: image });
    }
    else {
        //increase quantity of user in queue
        queueDonations.find(x => x.user === user).quantity++;
        queueDonations.find(x => x.user === user).lastDonation = lastDonation;
    }
}



//check if users in queue are ready to print and if so print them
function checkDonationQueue() {
    // console.log(".......................");
    // console.log("CHECKING DONATION QUEUE");
    // console.log(".......................");
    //print the queue users
    // for (let i = 0; i < queueDonations.length; i++) {
    //     console.log("Printing user: " + queueDonations[i].user + " with quantity: " + queueDonations[i].quantity + " and last donation: " + queueDonations[i].lastDonation);
    // }
    // console.log(".......................");
    if (queuePrinting) {
        return;
    }
    queuePrinting = true;
  
    //check for users in queue with quantity greater than or equal to 5
    let usersToPrint = queueDonations.filter(x => x.quantity >= DONATIONS_QUANTITY_TO_PRINT);
    //remove users from queue
    queueDonations = queueDonations.filter(x => x.quantity < DONATIONS_QUANTITY_TO_PRINT);
    //print users
    usersToPrint.forEach(user => {
        NotifyRenderProcess('gift',user);
        console.log("PRINTING DONATION: " + user.user);
        const message = [
            {
                type: "text",
                value: "❤️❤️❤️❤️❤️❤️❤️❤️",
                style: `text-align:center;`,

            },
            {
                type: "image",
                path: user.image, // file path
                position: "center", // position of image: 'left' | 'center' | 'right'
                width: "120px", // width of image in px; default: auto
                height: "100px", // width of image in px; default: 50 or '50px'
            },
            {
                type: "text",
                value: user.user + ": " + user.lastDonation,
            }, {
                type: "text",
                value: "---------------------------",
                style: `text-align:center;`,
            },
            {
                type: "text",
                value: "❤️❤️❤️❤️❤️❤️❤️❤️",
                style: `text-align:center;`,

            },
        ];

        PosPrinter.print(message, options)
            .then((response) => {
                console.log(response);
            }).catch((error) => {
                console.log(error);
            });
    });
    queuePrinting = false;
}


app.on("ready", async () => {
    // console.log(".......................");
    // console.log("READY");
    //SETUP PRINTER
    createWindow();
    console.log("READY");
    // Create a new wrapper object and pass the username
    // let tiktokChatConnection = new WebcastPushConnection(tiktokUsername);

    // // Connect to the chat (await can be used as well)
    // tiktokChatConnection.connect().then(state => {
    //     console.info(`Connected to roomId ${state.roomId}`);
    // }).catch(err => {
    //     console.error('Failed to connect', err);
    // })

    // // Define the events that you want to handle
    // // In this case we listen to chat messages (comments)
    // tiktokChatConnection.on('chat', async data => {
    //     // console.log("MESSAGE ENABLED: " + PRINT_MESSAGES);
    //     // console.log(data.nickname + ": " + data.comment);
    //     // console.log("---------------------------");
        
    //     // const message = [
    //     //     {
    //     //         type: "text",
    //     //         value: data.nickname + ": " + data.comment,
    //     //     }, {
    //     //         type: "text",
    //     //         value: "---------------------------",
    //     //         style: `text-align:center;`,

    //     //     },
    //     // ];

    //     if (PRINT_MESSAGES) {
    //         //add user to queue
    //         addToQueue(data.nickname, data.comment);
    //         //check queue
    //         checkQueue();
    //         // PosPrinter.print(message, options)
    //         //     .then((response) => {
    //         //         console.log(response);
    //         //     })
    //         //     .catch((error) => {
    //         //         console.log(error);
    //         //     });
    //     }
    // })

    // // And here we receive gifts sent to the streamer
    // tiktokChatConnection.on('gift', async data => {
       
    //     // console.log("GIFT ENABLED: " + PRINT_DONATIONS);
    //     // console.log(data.nickname + ": " + data.describe);
    //     // console.log("---------------------------");
    //     var extension = data.profilePictureUrl.split('.').pop().split('?')[0];

    //     await downloadImage(data.profilePictureUrl, './src/images/' + data.uniqueId + '.' + extension);

    //     let logo =
    //         './src/images/' + data.uniqueId + '.' + extension;

    //     if (PRINT_DONATIONS) {
    //          addToDonationQueue(data.nickname, data.describe, data.profilePictureUrl);
    //         //check queue
    //         checkDonationQueue();
    //         // PosPrinter.print(message, options)
    //         //     .then((response) => {
    //         //         console.log(response);
    //         //     })
    //         //     .catch((error) => {
    //         //         console.log(error);
    //         //     });
    //     }
    // })

    // tiktokChatConnection.on('social', data => {
    //     // console.log("SOCIAL ENABLED: " + PRINT_SOCIAL);
    //     // console.log(data.nickname + ": " + data.label);
    //     // console.log("---------------------------");
    //     var extension = data.profilePictureUrl.split('.').pop().split('?')[0];

    //     downloadImage(data.profilePictureUrl, './src/images/' + data.uniqueId + '.' + extension);

    //     const message = [

    //         {
    //             type: "text",
    //             value: data.nickname + ": " + "Te ha seguido",
    //         }, {
    //             type: "text",
    //             value: "---------------------------",
    //             style: `text-align:center;`,

    //         },
    //     ];
    //     if (PRINT_SOCIAL && data.label.includes("followed")) {

    //         PosPrinter.print(message, options)
    //             .then((response) => {
    //                 console.log(response);
    //             })
    //             .catch((error) => {
    //                 console.log(error);
    //             });
    //     }
    // })
   
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
    try{
    // Create the browser window.
 win= new BrowserWindow({
        width: 800,
        height: 600,
        fullscreen: false,
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
}catch(err){
    console.log(err);
}
}



let sending = false;
function NotifyRenderProcess(message,payload) {
    try{

    //wait 3 seconds before sending the message
    if (sending) {    
        return;
    }
    
    console.log("Notifying Render Process");
    sending = true;
  //  win.webContents.send('event', {message: message, payload: payload});
    //wait 3 seconds before sending the message
    setTimeout(function () {
    sending = false;
    }, 3000);
    //wait 3 seconds before sending the message



}
catch(e){
    console.log(e);
}
}

app.on('before-quit', () => {   
    console.log("Quitting");
    win = null;
        ipcMain.removeAllListeners("event");          
  });