// sample server application
// provides one endpoint: /tspec
// called with two parameters: operation and files
// returns an transfer spec suitable to start a transfer

const bodyParser = require("body-parser");
const express = require('express');
const https = require('https');
const yaml = require('js-yaml');
const fs = require('fs');

// command line arguments
const configFile = process.argv[2];
const port = Number(process.argv[3]);

// read config file (node credentials ...) 
const config = yaml.load(fs.readFileSync(configFile, 'utf8'));
// for demo, assume self signed cert
const ignoreCertAgent = new https.Agent({ rejectUnauthorized: false });
// web server
const app = express();

// use this source folder to serve static content
app.use(express.static(__dirname));

// allow parsing of JSON bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// get transfer authorization by calling node API
app.post('/tspec', async (req, res) => {
  // requested path for authorization
  let request_paths = null;
  const source_paths = [];
  // which files to transfer
  for (const file of req.body.files) {
    source_paths.push({ source: file });
  }
  if (req.body.operation === "upload") {
    // for sample: server chooses destination
    request_paths = [{ destination: config.misc.server_folder }];
  } else if (req.body.operation === "download") {
    request_paths = source_paths;
  } else {
    console.log(`ERROR: Unexpected request: ${req.body.operation}`);
    return;
  }
  console.log("paths:", request_paths);
  // call HSTS node API (with a single transfer request)
  const ts_resp = await fetch(config.node.url + `/files/${req.body.operation}_setup`, {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(config.node.user + ':' + config.node.pass).toString('base64') },
    body: JSON.stringify({ transfer_requests: [{ transfer_request: { paths: request_paths } }] }),
    agent: ignoreCertAgent
  });
  // wait for full answer
  const result = await ts_resp.json();
  // one request was made, so one answer is received (assume no error)
  const transfer_spec = result.transfer_specs[0].transfer_spec;
  // set paths to transfer
  transfer_spec.paths = source_paths;
  console.log(transfer_spec);
  return res.send(transfer_spec);
});

app.listen(port, () => {
  console.log(`Express server running at http://localhost:${port}`);
});
