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
        'https://www.cradlepointecm.com/api/v2/routers/?fields=name,ipv4_address,state,state_updated_at,account&limit=2',
    method: 'GET',
    headers: {
        'X-CP-API-ID': 'e79c6722',
        'X-CP-API-KEY': '11248c51069c2e200d1e89c74830c431',
        'X-ECM-API-ID': 'a86d9b3c-6f1b-498d-907a-bd2facf56bc9',
        'X-ECM-API-KEY': '5d707dd2d354f0cc125cb43e7b365b972f7454c2',
        'Content-Type': 'application/json'
    }
};

// webspucket route connector and main processing function
app.ws('/connect', (ws, req) => {
    console.log(Date(), ' client connected from ', req.connection.remoteAddress);

    requestData(processData);

    //.map(item => (deviceTemplateArray[parseInt(item.name, 10)] = item));

    ws.send(processedDeviceArray.map(item => (deviceTemplateArray[parseInt(item.name, 10)] = item)));
});

// Fills deviceTemplateArray
for (let i = 0; i < 400; i++) {
    deviceTemplateArray.push({ name: ('00' + i).slice(-3) });
}

// function creates a new array of parced data
const processData = data => {
    data.map(datum => {
        processedDeviceArray.push({
            account: utils.accountParser(datum.account),
            name: utils.nameParser(datum.name),
            state: datum.state,
            conType: utils.conType(datum.ipv4_address)
        });
    });
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
