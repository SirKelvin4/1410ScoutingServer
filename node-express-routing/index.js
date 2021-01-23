const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const app = express();
const server = require('http').Server(app);
let cors = require('cors');
let bodyParser = require('body-parser');
let test = {test: 'POST'};
const bigData = {"Scout_Number":"Rowan","Team_Number":"1410","Auto_Low_Goal_Scored":"0","Auto_Low_Goal_Missed":"0","Auto_Mid_Goal_Scored":"0","Auto_Mid_Goal_Missed":"0","Auto_High_Goal_Scored":"0","Auto_High_Goal_Missed":"0","Auto_Power_Shot_Target":"0","Auto_Wobble_Correct_Zone":"false","Teleop_Low_Goal_Scored":"0","Teleop_Low_Goal_Missed":"0","Teleop_Mid_Goal_Scored":"0","Teleop_Mid_Goal_Missed":"0","Teleop_High_Goal_Scored":"0","Teleop_High_Goal_Missed":"0","Endgame_Low_Goal_Scored":"2","Endgame_Low_Goal_Missed":"0","Endgame_Mid_Goal_Scored":"0","Endgame_Mid_Goal_Missed":"1","Endgame_High_Goal_Scored":"0","Endgame_High_Goal_Missed":"0","Endgame_Power_Shot_Target":"0","Endgame_Wobble_Start_Line":"false","Endgame_Wobble_Drop_Zone":"false","Endgame_Wobble_Rings":"1"};
const PORT = 80;
let data = bigData;
let fillSpace;
let ask = 0;
let emptyCell = false;

let values = [
    []
    // Additional rows ...
];
let body = {
    values: values
};


app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

server.listen(PORT, (err) => {
    if (err) {
        throw err;
    }
});

app.get('/', (request, response) => {
    response.send();
    fakePOSTConnect().then(response => response.JSON).catch(console.error);
});

app.post('/', (request, response) => {
    console.log(request.body);
    response.status(204);
    response.end(JSON.stringify(request.body));
    data = request.body;

    values = [
        [
            data.Scout_Number, data.Team_Number, data.Auto_High_Goal_Scored, data.Auto_High_Goal_Missed, data.Auto_Mid_Goal_Scored, data.Auto_Mid_Goal_Missed, data.Auto_Low_Goal_Scored, data.Auto_Low_Goal_Missed, data.Auto_Power_Shot_Target, data.Auto_Wobble_Correct_Zone,
            data.Teleop_High_Goal_Scored, data.Teleop_High_Goal_Missed, data.Teleop_Mid_Goal_Scored, data.Teleop_Mid_Goal_Missed, data.Teleop_Low_Goal_Scored, data.Teleop_Low_Goal_Missed,
            data.Endgame_High_Goal_Scored, data.Endgame_High_Goal_Missed, data.Endgame_Mid_Goal_Scored, data.Endgame_Mid_Goal_Missed, data.Endgame_Low_Goal_Scored, data.Endgame_Low_Goal_Missed, data.Endgame_Power_Shot_Target, data.Endgame_Wobble_Rings, data.Endgame_Wobble_Start_Line, data.Endgame_Wobble_Drop_Zone
        ]
        // Additional rows ...
    ];
    body = {
        values: values
    };

    const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']; //If changing, delete token.json
    const TOKEN_PATH = 'token.json';

    function authorize(credentials, callback) {
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return getNewToken(oAuth2Client, callback);
            oAuth2Client.setCredentials(JSON.parse(token));
            callback(oAuth2Client);
        });
    }

    function getCells() {//For moving down row stuff
        // Load client secrets from a local file.
        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Sheets API.
            authorize(JSON.parse(content), readSheet);
        });
    }

    function readSheet(auth) { //Reads from sheet
        const sheets = google.sheets({version: 'v4', auth});
        sheets.spreadsheets.values.get({
            spreadsheetId: '1HfYjHhirqyapYwD0imXfGjIwiJ3whPs1M35t--MXrQA', //Found in url
            range: 'Data!A:AC',
            majorDimension: 'COLUMNS'
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const rows = res.data.values;
            if (rows.length) {
                // Print columns A and E, which correspond to indices 0 and 4.
                rows.map((row) => { //Repeats twice for some reason
                    // console.log(`${row[1]}, ${row[2]}`);
                    //Starts at A2 = 0 in the array
                    while (emptyCell === false) {
                        fillSpace = row[ask];
                        console.log(row[ask]);
                        if (fillSpace === undefined || fillSpace === "Don't Remove" || fillSpace === null || fillSpace === "\n") {
                            emptyCell = true;
                            console.log("Row " + ask + " empty");
                        } else {
                            console.log("Row " + ask + " not empty");
                            emptyCell = false;
                            ask++;
                        }
                    }
                });
            } else {
                console.log('No data found.');
            }
            if (emptyCell === true) {
                emptyCell = false;
                if (data !== bigData) {

                    fs.readFile('credentials.json', (err, content) => {
                        if (err) return console.log('Error loading client secret file:', err);
                        // Authorize a client with credentials, then call the Google Sheets API.
                        authorize(JSON.parse(content), writeSheet);
                    });
                }
            }
        });
    }

    function writeSheet(auth) {
        const sheetsRead = google.sheets({version: 'v4', auth});
        sheetsRead.spreadsheets.values.update({
            spreadsheetId: '1HfYjHhirqyapYwD0imXfGjIwiJ3whPs1M35t--MXrQA',
            range: `Data!A${ask+1}:AB`,
            valueInputOption: 'RAW',
            requestBody: body
        });
    }

    function getNewToken(oAuth2Client, callback) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return console.error('Error while trying to retrieve access token', err);
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) return console.error(err);
                    console.log('Token stored to', TOKEN_PATH);
                });
                callback(oAuth2Client);
            });
        });
    }

    getCells();
// fs.readFile('credentials.json', (err, content) => {
//     if (err) return console.log('Error loading client secret file:', err);
//     // Authorize a client with credentials, then call the Google Sheets API.
//     authorize(JSON.parse(content), writeSheet);
// });

    fs.appendFile('data.txt', JSON.stringify(data) + '\n', function (err) {
        if (err) {
            return console.error(err);
        }
        console.log('Success');
    });
});

const fakePOSTConnect = () => {
    return fetch('https://a2063f08585b.ngrok.io', {
        headers: {'Content-Type': 'application/json'},
        method: 'POST',
        body: JSON.stringify(test),
    });
}
//Google Sheets
// const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']; //If changing, delete token.json
// const TOKEN_PATH = 'token.json';
//
// function authorize(credentials, callback) {
//     const {client_secret, client_id, redirect_uris} = credentials.installed;
//     const oAuth2Client = new google.auth.OAuth2(
//         client_id, client_secret, redirect_uris[0]);
//
//     // Check if we have previously stored a token.
//     fs.readFile(TOKEN_PATH, (err, token) => {
//         if (err) return getNewToken(oAuth2Client, callback);
//         oAuth2Client.setCredentials(JSON.parse(token));
//         callback(oAuth2Client);
//     });
// }
//
// function readSheet(auth) { //Reads from sheet
//     const sheets = google.sheets({version: 'v4', auth});
//     sheets.spreadsheets.values.get({
//         spreadsheetId: '1HfYjHhirqyapYwD0imXfGjIwiJ3whPs1M35t--MXrQA', //Found in url
//         range: 'Data!A:Z',
//         majorDimension: 'COLUMNS'
//     }, (err, res) => {
//         if (err) return console.log('The API returned an error: ' + err);
//         const rows = res.data.values;
//         if (rows.length) {
//             // Print columns A and E, which correspond to indices 0 and 4.
//             rows.map((row) => { //Repeats twice for some reason
//                 // console.log(`${row[1]}, ${row[2]}`);
//                 //Starts at A2 = 0 in the array
//                 while (emptyCell === false) {
//                     fillSpace = row[ask];
//                     console.log(row[ask]);
//                     if (fillSpace === undefined || fillSpace === "Don't Remove" || fillSpace === null || fillSpace === "\n") {
//                         emptyCell = true;
//                         console.log("Row " + ask + " empty");
//                     } else {
//                         console.log("Row " + ask + " not empty");
//                         emptyCell = false;
//                         ask++;
//                     }
//                 }
//             });
//         } else {
//             console.log('No data found.');
//         }
//         if (emptyCell === true) {
//             if (data === bigData) {
//                 console.log("Test")
//                 fs.readFile('credentials.json', (err, content) => {
//                     if (err) return console.log('Error loading client secret file:', err);
//                     // Authorize a client with credentials, then call the Google Sheets API.
//                     authorize(JSON.parse(content), writeSheet);
//                 });
//             }
//         }
//     });
// }
//
// function getCells() {//For moving down row stuff
//     // Load client secrets from a local file.
//     fs.readFile('credentials.json', (err, content) => {
//         if (err) return console.log('Error loading client secret file:', err);
//         // Authorize a client with credentials, then call the Google Sheets API.
//         authorize(JSON.parse(content), readSheet);
//     });
// }
//
// function writeSheet(auth) {
//     const sheetsRead = google.sheets({version: 'v4', auth});
//     sheetsRead.spreadsheets.values.update({
//         spreadsheetId: '1HfYjHhirqyapYwD0imXfGjIwiJ3whPs1M35t--MXrQA',
//         range: `Data!A${ask+1}:Y`,
//         valueInputOption: 'RAW',
//         requestBody: body
//     });
// }
//
// function getNewToken(oAuth2Client, callback) {
//     const authUrl = oAuth2Client.generateAuthUrl({
//         access_type: 'offline',
//         scope: SCOPES,
//     });
//     console.log('Authorize this app by visiting this url:', authUrl);
//     const rl = readline.createInterface({
//         input: process.stdin,
//         output: process.stdout,
//     });
//     rl.question('Enter the code from that page here: ', (code) => {
//         rl.close();
//         oAuth2Client.getToken(code, (err, token) => {
//             if (err) return console.error('Error while trying to retrieve access token', err);
//             oAuth2Client.setCredentials(token);
//             // Store the token to disk for later program executions
//             fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
//                 if (err) return console.error(err);
//                 console.log('Token stored to', TOKEN_PATH);
//             });
//             callback(oAuth2Client);
//         });
//     });
// }
//
// getCells();
// // fs.readFile('credentials.json', (err, content) => {
// //     if (err) return console.log('Error loading client secret file:', err);
// //     // Authorize a client with credentials, then call the Google Sheets API.
// //     authorize(JSON.parse(content), writeSheet);
// // });

