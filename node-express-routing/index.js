const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const app = express();
const server = require('http').Server(app);
const PORT = 3000;
let cors = require('cors');
let bodyParser = require('body-parser');
let test = {test: 'POST'};
let data;

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

    fs.appendFile('data.txt', '\n' + JSON.stringify(data), function (err) {
        if (err) {
            return console.error(err);
        }
        console.log('Success');
    });
});

const fakePOSTConnect = () => {
    return fetch('http://localhost:3000', {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(test),
    });
}

