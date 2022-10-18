function connect_initialize() {
  this.client = new AW4.Connect();
  this.client.initSession();
}
function connect_download_simple() {
  // replace ssh, as browser will not take ssh:
  const server_url=new URL(config.server.url.replace(/^ssh:/g, "http://"));
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
  console.log("ts",transferSpec);
  this.client.startTransfer(transferSpec);
}
function connect_download_basic() {
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
  console.log("ts",transferSpec);
  this.client.startTransfer(transferSpec);
}
