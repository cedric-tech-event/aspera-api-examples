// runs in browser
function connect_initialize() {
  this.client = new AW4.Connect();
  this.client.initSession();
}
function connect_download_ssh_creds() {
  console.log('Download asked');
  // replace ssh, as browser will not take ssh:
  const serverUrl = new URL(config.server.url.replace(/^ssh:/g, 'http://'));
  const transferSpec = {
    remote_host: serverUrl.hostname,
    ssh_port: serverUrl.port,
    remote_user: config.server.user,
    remote_password: config.server.pass,
    direction: 'receive',
    paths: [{ source: config.server.download_file }]
  };
  console.log('With ts=', transferSpec);
  this.client.startTransfer(transferSpec);
}
function connect_download_with_token(use_basic) {
  console.log('Download asked');
  common_browser.get_transfer_spec({ operation: 'download', sources: [config.server.download_file] })
    .then((transferSpec) => {
      if (use_basic) { transferSpec.token = 'Basic ' + btoa(config.node.user + ':' + config.node.pass) }
      console.log('With ts=', transferSpec);
      this.client.startTransfer(transferSpec);
    }).catch(error => {
      console.log('Download could not start', error);
      alert(`Prolem with HTTPGW: ${error.message}`);
    });
}
