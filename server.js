/*
todo:
    kill poll timers when connection closes
*/

// mongodb connection ////
const mongoose = require('mongoose');
mongoose
    .connect(
        'mongodb://inspire.gr.mhgi.net/cpw',
        { useNewUrlParser: true }
    )
    .then(() => {
        console.log('Database connection successful');
    })
    .catch(err => {
        console.error('Database connection error');
    });

let deviceSchema = new mongoose.Schema(
    {
        name: String,
        account: Number,
        state: String,
        conType: String,
        date: Date
    },
    { versionKey: false }
);

let Device = mongoose.model('Device', deviceSchema);

let _SERVER_CLOCK = 5000,
    _DB_CLOCK = 30000,
    _MAIN_CLOCK = 1000;

const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const request = require('request');
const utils = require('./utils.js'); // nameParser, conType, accountParser
const serverPort = 5556;
let processedDeviceArray = [];
let deviceTemplateArray = [];
const options = {
    url:
        'https://www.cradlepointecm.com/api/v2/routers/?fields=name,ipv4_address,state,state_updated_at,account&limit=500',
    method: 'GET',
    headers: {
        'X-CP-API-ID': 'e79c6722',
        'X-CP-API-KEY': '11248c51069c2e200d1e89c74830c431',
        'X-ECM-API-ID': 'a86d9b3c-6f1b-498d-907a-bd2facf56bc9',
        'X-ECM-API-KEY': '5d707dd2d354f0cc125cb43e7b365b972f7454c2',
        'Content-Type': 'application/json'
    }
};
// Fills deviceTemplateArray
for (let i = 0; i < 500; i++) {
    deviceTemplateArray.push({ name: ('00' + i).slice(-3), account: null, state: null, contype: null, date: null });
}

let mainClock = setInterval(() => {
    requestData(processData);
}, 2000);

let dbClock = setInterval(() => {
    deviceTemplateArray.map((item, itemIndex) => {
        if (item.account !== null) {
            let thisItem = new Device(item);

            thisItem.save((err, device) => {
                err ? console.log(err) : null; //console.log(device);
            });
        }
    });
}, 60000);

// webspucket route connector and main processing function
app.ws('/connect', (ws, req) => {
    console.log(Date(), ' client connected from ', req.connection.remoteAddress); 
    let serverClock = setTimeout(() => {    
            ws.send(JSON.stringify(deviceTemplateArray));
    }, 5000);

    ws.on('close', () => {
        clearInterval(serverClock);
    })
});

// function creates a new array of parced data
const processData = data => {
    data.map(datum => {
        processedDeviceArray.push({
            name: utils.nameParser(datum.name),
            account: utils.accountParser(datum.account),
            state: datum.state,
            conType: utils.conType(datum.ipv4_address),
            date: Date()
        });
    });
    processedDeviceArray.map(item => (deviceTemplateArray[parseInt(item.name, 10)] = item));
};

// callback function
const requestData = callback => {
    request(options, (err, res, body) => {
        if (err) {
            console.log(Date(), err.message);
        } else {
            return callback(JSON.parse(body).data);
        }
    });
};

app.listen(serverPort, () => console.log(`Starting server on port ${serverPort}`));
