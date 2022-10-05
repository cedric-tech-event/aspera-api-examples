const express = require('express');
const yaml = require('js-yaml');
const fs   = require('fs');

config=yaml.load(fs.readFileSync(process.argv[2], 'utf8'));

const app = express();
const port = 3000;

// use this source folder as doc root
app.use(express.static(__dirname));

// build transfer spec by calling node API
// TODO: better use upload_setup and download_setup
app.get('/tspec', async (req, res) => {
  const basic_auth = 'Basic '+Buffer.from(config.node.user+':'+config.node.pass).toString('base64');
  const response = await fetch(config.node.url+'/info', {headers : {"Authorization" : basic_auth}});
  const info = await response.json();
  console.log(info.current_time);

  result={
    "direction":req.query.dir,
    "remote_host":new URL(config.node.url).hostname,
    "remote_user":info.transfer_user,
    "ssh_port":33001,
    "token":basic_auth,
  };

  return res.send(result);
});

app.listen(port, () => {
  console.log(`Express server running at http://localhost:${port}`);
});
