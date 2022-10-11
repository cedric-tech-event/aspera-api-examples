// sample client-side web application

// files selected by user for upload
var selected_upload_files=[];
// transfer monitor
var monitorId = null;

// helper function
function readableBytes(bytes) {
    var i = Math.floor(Math.log(bytes) / Math.log(1024)),
    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + sizes[i];
}
// to be called when page is ready
function httpgw_initialize() {
    // display configuration
    document.getElementById("server_address").innerHTML = config.node.url + " / " + config.node.user;
    asperaHttpGateway.initHttpGateway(config.misc.httpgw_url+'/v1').then(response => {
        console.log('HTTP Gateway SDK started', response);
        // register a transfer monitor
        monitorId = asperaHttpGateway.registerActivityCallback((result) => {
            result.transfers.forEach(transfer => {
              console.log(`Event:
    - Id:         ${transfer.uuid},
    - Status:     ${transfer.status},
    - Percent:    ${(transfer.percentage * 100).toFixed(2)}%,
    - Data Sent:  ${readableBytes(transfer.bytes_written)},
    - Data Total: ${readableBytes(transfer.bytes_expected)}`);
            });
        });
    }).catch(error => {
        console.error('HTTP Gateway SDK did not start', error);
        alert("Prolem with HTTPGW:"+error.message);
    });
}

// call the server to get a transfer authorization (with token)
function httpgw_get_ts(direction,files) {
    return new Promise((resolve) => {
        // get transfer spec from server
        fetch(window.location.href+'tspec',{
            method: 'POST',
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({"operation":direction,"files":files})
        })
        .then((response)=>{return response.json();})
        .then((ts)=>{
            ts.authentication="token";
            //ts.download_name="project_files"
            //ts.zip_required=true;
            resolve(ts);
        });
    });
}

// called by download button
function httpgw_download() {
    console.log('Download asked');
    httpgw_get_ts("download",[config.misc.server_file])
    .then((transferSpec)=>{
        console.log('>>transfer spec',transferSpec);
        asperaHttpGateway.download(transferSpec).then(response => {
            console.log('Download started', response);
        }).catch(error => {
            console.log('Download could not start', error); 
            alert("Prolem with HTTPGW:"+error.message);
        });
    });
}

// called by file select button
function httpgw_pick_files(formId) {
    asperaHttpGateway.getFilesForUpload((pick) => {
        for (let file of pick.dataTransfer.files) {
            selected_upload_files.push(file.name);
        }
        console.log('Files picked', selected_upload_files);
    }, formId);
}

// called by upload button
function httpgw_upload(formId) {
    httpgw_get_ts("upload",selected_upload_files)
    .then((transferSpec)=>{
        asperaHttpGateway.upload(transferSpec, formId)
        .then(response => {
            // Indicates upload started; transfer status is shown in activity callbacks
            console.log('Upload started', response);
        }).catch(error => {
            // Indicates upload could not start (this is a failure from the SDK or the Gateway Server, not from the transfer server)
            console.log('Upload could not start', error);
            alert("Prolem with HTTPGW:"+error.message);
        });
        // reset
        selected_upload_files=[];
    });
}
