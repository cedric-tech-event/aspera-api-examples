// sample client web application

// files selected by user for upload
var selected_upload_files = [];
// upload monitor
var httpGwMonitorId;

// @return the provided number with bytes qualifier
function readableBytes(bytes) {
    const magnitude = Math.floor(Math.log(bytes) / Math.log(1024));
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    return (bytes / Math.pow(1024, magnitude)).toFixed(2) * 1 + ' ' + sizes[magnitude];
}

// get transfer spec for specified transfer type and files
// either call directly the node api, or call the web server who will forward to node
function get_transfer_spec(params) {
    console.log(`Transfer requested: ${params.operation}`);
    if (!document.getElementById('use_server').checked) {
        return common.get_transfer_spec_direct(params);
    } else {
        // @return transfer spec with token by calling the local express server
        const server_url = window.location.href;
        if (!server_url.startsWith('http://')) {
            alert("This page must be loaded through http server");
            throw "This page must be loaded through http server";
        }
        return new Promise((resolve) => {
            // get transfer spec from server
            fetch(server_url + 'tspec', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            })
                .then((response) => { return response.json(); })
                .then((ts) => { return resolve(ts); });
        });
    }
}

// start transfer for specified transfer type and files
// using either connect SDK or HTTP HW SDK
function start_transfer(transferSpec) {
    console.log('With ts=', transferSpec);
    if (document.getElementById('use_connect').checked) {
        this.client.startTransfer(transferSpec);
    } else {
        // transfer spec specific to http gw:
        //transferSpec.download_name='project_files'
        //transferSpec.zip_required=true;
        if (transferSpec.direction === 'receive') {
            asperaHttpGateway.download(transferSpec).then(response => {
            }).catch(error => {
                console.log('Download could not start', error);
                alert(`Problem with HTTPGW: ${error.message}`);
            });
        } else {
            asperaHttpGateway.upload(transferSpec, 'httpgw-form')
                .then(response => {
                    // Indicates upload started; transfer status is shown in activity callbacks
                    console.log('Upload started', response);
                }).catch(error => {
                    // Indicates upload could not start (this is a failure from the SDK or the Gateway Server, not from the transfer server)
                    console.log('Upload could not start', error);
                    alert('Problem with HTTPGW:' + error.message);
                });
        }
    }
}

// reset
function reset_selected_files() {
    selected_upload_files = [];
    update_ui();
}

// updat e dynamic elements in UI
function update_ui() {
    document.getElementById('upload_files').innerHTML = selected_upload_files.join(', ');
    document.getElementById('node_info').style.display = document.getElementById('use_server').checked ? 'none' : 'block';
    document.getElementById('httpgw_info').style.display = document.getElementById('use_connect').checked ? 'none' : 'block';
    if (document.getElementById('use_connect').checked) {
        // connect
        if (!this.client) {
            this.client = new AW4.Connect();
            this.client.initSession();
        }
    } else {
        // http gw
        if (!httpGwMonitorId) {
            asperaHttpGateway.initHttpGateway(document.getElementById('httpgw_url').value + '/v1').then(response => {
                console.log('HTTP Gateway SDK started', response);
                // register a transfer monitor
                httpGwMonitorId = asperaHttpGateway.registerActivityCallback((result) => {
                    result.transfers.forEach(transfer => {
                        const status = `Event:
    - Id:         ${transfer.uuid},
    - Status:     ${transfer.status},
    - Percent:    ${(transfer.percentage * 100).toFixed(2)}%,
    - Data Sent:  ${readableBytes(transfer.bytes_written)},
    - Data Total: ${readableBytes(transfer.bytes_expected)}`;
                        console.log(status);
                        document.getElementById('status').innerHTML = status;
                    });
                });
            }).catch(error => {
                console.error('HTTP Gateway SDK did not start', error);
                alert('Prolem with HTTPGW:' + error.message);
            });
        }
    }
}

function app_initialize() {
    // set default values from configuration file
    document.getElementById('httpgw_url').value = config.httpgw.url;
    document.getElementById('node_url').value = config.node.url;
    document.getElementById('node_user').value = config.node.user;
    document.getElementById('node_pass').value = config.node.pass;
    document.getElementById('download_file').value = config.server.download_file;
    document.getElementById('upload_folder').value = config.server.upload_folder;
    document.getElementById('use_connect').addEventListener("click", function () { update_ui(); });
    document.getElementById('use_server').addEventListener("click", function () { update_ui(); });
    update_ui();
}

function app_download_ssh_creds() {
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
    console.log(`Transfer requested: download`);
    console.log('With ts=', transferSpec);
    start_transfer(transferSpec);
}

function app_download_with_token(use_basic) {
    get_transfer_spec({ operation: 'download', sources: [document.getElementById('download_file').value] })
        .then((transferSpec) => {
            if (use_basic) { transferSpec.token = 'Basic ' + btoa(config.node.user + ':' + config.node.pass) }
            start_transfer(transferSpec);
        });
}

// called by file select button
function app_pick_files() {
    if (document.getElementById('use_connect').checked) {
        alert("NOT IMPLEMENTED: Use HTTP gw")
    } else {
        // for the sample: a new select deletes already selected files
        reset_selected_files();
        asperaHttpGateway.getFilesForUpload((pick) => {
            for (const file of pick.dataTransfer.files) {
                selected_upload_files.push(file.name);
            }
            console.log('Files picked', selected_upload_files);
            update_ui();
        }, 'send-panel');
    }
}

// called by upload button
function app_upload(formId) {
    console.log('Upload asked');
    get_transfer_spec({ operation: 'upload', sources: selected_upload_files, destination: document.getElementById('upload_folder').value })
        .then((transferSpec) => {
            start_transfer(transferSpec);
            reset_selected_files();
        });
}
