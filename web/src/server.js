"use strict";
// sample server application
// provides one endpoint: /tspec
// called with two parameters: operation and files
// returns an transfer spec suitable to start a transfer

const bodyParser = require('body-parser');
const express = require('express');
const https = require('https');
const yaml = require('js-yaml');
const fs = require('fs');

// include common lib
const common=eval(fs.readFileSync(__dirname+'/common.js') + '');

// command line arguments
const configFile = process.argv[2];
const port = Number(process.argv[3]);
const staticFolder = process.argv[4];

// read config file (node credentials ...) 
const config = yaml.load(fs.readFileSync(configFile, 'utf8'));
// web server
const app = express();

// use this source folder to serve static content
app.use(express.static(staticFolder));

// allow parsing of JSON bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// for demo, assume self signed cert
const ignoreCertAgent = new https.Agent({ rejectUnauthorized: false });

// get transfer authorization by calling node API
app.post('/tspec', (req, res) => {
  common.get_transfer_spec_direct({ operation: req.body.operation, sources: req.body.sources, destination: req.body.destination, agent: ignoreCertAgent })
    .then((transferSpec) => { return res.send(transferSpec); })
});

app.listen(port, () => {
  console.log(`Express server running at http://localhost:${port}`);
});
