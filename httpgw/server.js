const bodyParser = require("body-parser");
const express = require('express');
const https = require('https');
const yaml = require('js-yaml');
const fs = require('fs');

// get node credentials from config file
const config=yaml.load(fs.readFileSync(process.argv[2], 'utf8'));
// prepare basic auth
const basic_auth = 'Basic '+Buffer.from(config.node.user+':'+config.node.pass).toString('base64');
// for demo, assume self signed cert
const ignoreCertAgent = new https.Agent({rejectUnauthorized: false});

const app = express();
const port = 3000;

// use this source folder as doc root
app.use(express.static(__dirname));

// parse JSON bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// get transfer authorization by calling node API
app.post('/tspec', async (req, res) => {
  // requested path for authorization
  var request_paths=null;
  // which files to transfer (for sample: 1 fie only)
  var source_paths=[{"source":req.body.files[0]}];
  if (req.body.operation === "upload") {
    // for sample: server chooses destination
    request_paths=[{"destination":config.misc.server_folder}];
  } else if (req.body.operation === "download") {
    request_paths=source_paths;
  } else {
    console.log(`ERROR: Unexpected request: ${req.body.operation}`);
    return;
  }
  console.log("request:",req.body.operation);
  const ts_resp = await fetch(config.node.url+`/files/${req.body.operation}_setup`, {
    method: 'POST',
    headers: {"Authorization" : basic_auth},
    body: JSON.stringify({"transfer_requests":[{"transfer_request":{"paths":request_paths}}]}),
    agent: ignoreCertAgent
  });
  // wait for full answer
  var result = await ts_resp.json();
  // one request was made, so one answer is received
  var transfer_spec = result["transfer_specs"][0]["transfer_spec"];
  // set paths to transfer
  transfer_spec.paths = source_paths;
  console.log(transfer_spec);
  return res.send(transfer_spec);
});

app.listen(port, () => {
  console.log(`Express server running at http://localhost:${port}`);
});
