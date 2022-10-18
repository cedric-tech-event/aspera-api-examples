function connect_initialize() {
  this.client = new AW4.Connect();
  this.client.initSession();
}
function connect_download_ssh_creds() {
  // replace ssh, as browser will not take ssh:
  const server_url=new URL(config.server.url.replace(/^ssh:/g, 'http://'));
  const transferSpec = {
    paths: [
      {
        source: config.server.download_file
      }
    ],
    remote_host: server_url.hostname,
    ssh_port: server_url.port,
    remote_user: config.server.user,
    remote_password: config.server.pass,
    direction: 'receive'
  };
  console.log('ts',transferSpec);
  this.client.startTransfer(transferSpec);
}
function connect_download_basic_token() {
  const node_url=new URL(config.nodeak.url);
  const transferSpec = {
    paths: [
      {
        source: config.server.download_file
      }
    ],
    remote_host: node_url.hostname,
    ssh_port: 33001, // we assume this
    remote_user: 'xfer',
    token: 'Basic ' + btoa(config.nodeak.access_key+':'+config.nodeak.secret),
    authentication: 'token',
    direction: 'receive'
  };
  console.log('ts',transferSpec);
  this.client.startTransfer(transferSpec);
}
function connect_download_aspera_token() {
  const node_url=new URL(config.node.url);
  fetch(node_url + '/files/download_setup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + btoa(config.node.user + ':' + config.node.pass)},
    body: JSON.stringify({'transfer_requests':[{'transfer_request':{'paths':[{'source':config.server.download_file}]}}]})})
    .then((response) => { return response.json(); })
    .then((result) => {
      console.log('result',result);
      const transferSpec = result.transfer_specs[0].transfer_spec;
      transferSpec.authentication = 'token';
      console.log('ts',transferSpec);
      this.client.startTransfer(transferSpec);
    });
}
