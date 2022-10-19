// sample client web application

// files selected by user for upload
var selected_upload_files;
// upload monitor
var monitorId;

// called when page is ready
function httpgw_initialize() {
    // display configuration
    document.getElementById('server_address').innerHTML = config.node.url + ' / ' + config.node.user;
    document.getElementById('download_file').innerHTML = config.server.download_file;
    document.getElementById('upload_folder').innerHTML = config.server.upload_folder;
    asperaHttpGateway.initHttpGateway(config.httpgw.url + '/v1').then(response => {
        console.log('HTTP Gateway SDK started', response);
        // register a transfer monitor
        monitorId = asperaHttpGateway.registerActivityCallback((result) => {
            result.transfers.forEach(transfer => {
                const status = `Event:
    - Id:         ${transfer.uuid},
    - Status:     ${transfer.status},
    - Percent:    ${(transfer.percentage * 100).toFixed(2)}%,
    - Data Sent:  ${common.readableBytes(transfer.bytes_written)},
    - Data Total: ${common.readableBytes(transfer.bytes_expected)}`;
                console.log(status);
                document.getElementById('status').innerHTML = status;
            });
        });
    }).catch(error => {
        console.error('HTTP Gateway SDK did not start', error);
        alert('Prolem with HTTPGW:' + error.message);
    });
}

// transfer spec specific to http gw
//ts.download_name='project_files'
//ts.zip_required=true;

// called by download button
function httpgw_download() {
    console.log('Download asked');
    common_browser.get_transfer_spec({ operation: 'download', sources: [config.server.download_file] })
        .then((transferSpec) => {
            console.log('With ts=', transferSpec);
            asperaHttpGateway.download(transferSpec).then(response => {
            }).catch(error => {
                console.log('Download could not start', error);
                alert(`Prolem with HTTPGW: ${error.message}`);
            });
        });
}

// called by file select button
function httpgw_pick_files(formId) {
    asperaHttpGateway.getFilesForUpload((pick) => {
        // for the sample: a new select deletes already selected files
        selected_upload_files = [];
        for (const file of pick.dataTransfer.files) {
            selected_upload_files.push(file.name);
        }
        console.log('Files picked', selected_upload_files);
        document.getElementById('upload_files').innerHTML = selected_upload_files.join(', ');
    }, formId);
}

// called by upload button
function httpgw_upload(formId) {
    console.log('Upload asked');
    common_browser.get_transfer_spec({ operation: 'upload', sources: selected_upload_files, destination: config.server.upload_folder })
        .then((transferSpec) => {
            console.log('With ts=', transferSpec);
            asperaHttpGateway.upload(transferSpec, formId)
                .then(response => {
                    // Indicates upload started; transfer status is shown in activity callbacks
                    console.log('Upload started', response);
                }).catch(error => {
                    // Indicates upload could not start (this is a failure from the SDK or the Gateway Server, not from the transfer server)
                    console.log('Upload could not start', error);
                    alert('Prolem with HTTPGW:' + error.message);
                });
            // reset
            selected_upload_files = undefined;
            document.getElementById('upload_files').innerHTML = '';
        });
}
