// sample client web application

// files selected by user for upload
var selected_upload_files = []
// HTTPGW upload monitor, initialized when HTTPGW is accessible
var httpGwMonitorId
// Connect Version, set when connect is accessible
var connectVersion = 'Unknown'
// identifier used by HTTPGW SDK
const HTTPGW_FORM_ID = 'send-panel'
// location of Connect SDK in CDN
const CONNECT_SDK_LOCATION = '//d3gcli72yxqn2z.cloudfront.net/downloads/connect/latest'

// initializes Aspera Connect: check if extension and client are installed, else ask to install
// See reference: https://ibm.github.io/aspera-connect-sdk-js/
function app_initialize_connect() {
    var connect_object = new AW4.Connect({
        minVersion: '4.2.0',
        connectMethod: 'extension'
    })
    // get Connect from CDN
    connect_installer = new AW4.ConnectInstaller({
        sdkLocation: CONNECT_SDK_LOCATION,
        style: 'carbon',
        correlationId: 'testapp'
    })
    // register callback when connect changes status, and trigger installer if necessary
    connect_object.addEventListener(AW4.Connect.EVENT.STATUS, (eventType, eventInfo) => {
        console.log(`Connect Event: ${eventInfo}`)
        if (eventInfo == AW4.Connect.STATUS.INITIALIZING) {
            connect_installer.showLaunching()
        } else if (eventInfo == AW4.Connect.STATUS.FAILED) {
            connect_installer.showDownload()
        } else if (eventInfo == AW4.Connect.STATUS.OUTDATED) {
            connect_installer.showUpdate()
        } else if (eventInfo == AW4.Connect.STATUS.RUNNING) {
            connect_installer.connected()
            // (optional) Update UI with Connect version, that also validates that communication works
            connect_object.version({
                success: (info) => { app_updateClientVersion('Connect Version ' + info.version) },
                error: () => { app_updateClientVersion('Cannot get connect version') }
            })
        } else if (eventInfo == AW4.Connect.STATUS.EXTENSION_INSTALL) {
            connect_installer.showExtensionInstall()
        }
    })
    // try to start connect, else trigger installer
    connect_object.initSession()
    return connect_object
}

function app_updateClientVersion(version) {
    connectVersion = version
    app_updateUi()
}

// @return the provided number with magnitude qualifier
function app_readableBytes(bytes) {
    const magnitude = Math.floor(Math.log(bytes) / Math.log(1024))
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    return (bytes / Math.pow(1024, magnitude)).toFixed(2) * 1 + ' ' + sizes[magnitude]
}

// Generate transfer spec for specified transfer operation (upload/download) and files
// either call directly the node api, or call the web server who will forward to node
function app_getTransferSpec(params) {
    console.log(`Transfer requested: ${params.operation}`)
    if (!document.getElementById('use_server').checked) {
        return common.get_transfer_spec_direct(params)
    } else {
        // @return transfer spec with token by calling the local express server
        const server_url = window.location.href
        if (!server_url.startsWith('http://')) {
            alert('Cannot detect server URL if page is loaded from file')
            throw 'Cannot detect server URL if page is loaded from file'
        }
        return new Promise((resolve) => {
            // get transfer spec from server
            fetch(server_url + 'tspec', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            })
                .then((response) => { return response.json() })
                .then((ts) => { return resolve(ts) })
        })
    }
}

// start transfer for specified transfer type and files
// using either connect SDK or HTTP HW SDK
function app_startTransfer(transferSpec) {
    console.log('With ts=', transferSpec)
    if (document.getElementById('use_connect').checked) {
        this.client.startTransfer(transferSpec)
    } else {
        // transfer spec specific to http gw:
        //transferSpec.download_name='project_files'
        //transferSpec.zip_required=true
        if (transferSpec.direction === 'receive') {
            asperaHttpGateway.download(transferSpec).then(response => {
            }).catch(error => {
                console.log('Download could not start', error)
                alert(`Problem with HTTPGW: ${error.message}`)
            })
        } else {
            asperaHttpGateway.upload(transferSpec, HTTPGW_FORM_ID)
                .then(response => {
                    // Indicates upload started: transfer status is shown in activity callbacks
                    console.log('Upload started', response)
                }).catch(error => {
                    // Indicates upload could not start (this is a failure from the SDK or the Gateway Server, not from the transfer server)
                    console.log('Upload could not start', error)
                    alert('Problem with HTTPGW:' + error.message)
                })
        }
    }
}

// reset file selection for upload to empty file list
function app_resetSelection() {
    selected_upload_files = []
    app_updateUi()
}

// callback for feedback on transfer (Connect or HTTPGW)
function handleTransferEvents(transfers) {
    transfers.forEach(transfer => {
        const status = `Event:
    - Id:         ${transfer.uuid},
    - Status:     ${transfer.status},
    - Percent:    ${(transfer.percentage * 100).toFixed(2)}%,
    - Data Sent:  ${app_readableBytes(transfer.bytes_written)},
    - Data Total: ${app_readableBytes(transfer.bytes_expected)}`
        console.log(status)
        document.getElementById('status').innerHTML = status
    })
    app_updateUi()
}

// update dynamic elements in UI
function app_updateUi() {
    document.getElementById('upload_files').innerHTML = selected_upload_files.join(', ')
    document.getElementById('node_info').style.display = document.getElementById('use_server').checked ? 'none' : 'block'
    document.getElementById('connect_info').innerHTML = connectVersion
    if (document.getElementById('use_connect').checked) {
        // connect
        document.getElementById('connect_info').style.display = 'block'
        document.getElementById('httpgw_info').style.display = 'none'
        document.getElementById('server_download').style.display = 'block'
        document.getElementById('server_info').style.display = 'block'
        if (!this.client) {
            this.client = app_initialize_connect()
            // optionally for the sample: follow transfer progress in page
            this.client.addEventListener(AW4.Connect.EVENT.TRANSFER, (eventType, eventInfo) => { handleTransferEvents(eventInfo.transfers) })
        }
    } else {
        // http gw
        document.getElementById('httpgw_info').style.display = 'block'
        document.getElementById('connect_info').style.display = 'none'
        document.getElementById('server_download').style.display = 'none'
        document.getElementById('server_info').style.display = 'none'
        if (!httpGwMonitorId) {
            asperaHttpGateway.initHttpGateway(document.getElementById('httpgw_url').value + '/v1').then(response => {
                console.log('HTTP Gateway SDK started', response)
                // register a transfer monitor
                httpGwMonitorId = asperaHttpGateway.registerActivityCallback((result) => { handleTransferEvents(result.transfers) })
            }).catch(error => {
                console.error('HTTP Gateway SDK did not start', error)
                alert('Problem with HTTPGW:' + error.message)
            })
        }
    }
}

// Called after page full download
function app_initialize() {
    // set default values from configuration file
    document.getElementById('httpgw_url').value = config.httpgw.url
    document.getElementById('node_url').value = config.node.url
    document.getElementById('node_user').value = config.node.user
    document.getElementById('node_pass').value = config.node.pass
    document.getElementById('server_url').value = config.server.url
    document.getElementById('server_user').value = config.server.user
    document.getElementById('server_pass').value = config.server.pass
    document.getElementById('download_file').value = config.server.download_file
    document.getElementById('upload_folder').value = config.server.upload_folder

    document.getElementById('use_connect').addEventListener('click', () => { app_updateUi() })
    document.getElementById('use_server').addEventListener('click', () => { app_updateUi() })
    app_updateUi()
}

// Button: Download from server with SSH credentials
function app_download_ssh_creds() {
    // replace ssh, as browser will not parse ssh as scheme
    const serverUrl = new URL(document.getElementById('server_url').value.replace(/^ssh:/g, 'http://'))
    // build 
    const transferSpec = {
        remote_host: serverUrl.hostname,
        ssh_port: serverUrl.port,
        remote_user: document.getElementById('server_user').value,
        remote_password: document.getElementById('server_pass').value,
        direction: 'receive',
        paths: [{ source: document.getElementById('download_file').value }]
    }
    console.log(`Transfer requested: download`)
    app_startTransfer(transferSpec)
}

// Button: Download from server with Node API credentials (using Aspera or Basic token)
function app_download_with_token(use_basic) {
    app_getTransferSpec({ operation: 'download', sources: [document.getElementById('download_file').value] })
        .then((transferSpec) => {
            if (use_basic) { transferSpec.token = 'Basic ' + btoa(document.getElementById('node_user').value + ':' + document.getElementById('node_pass').value) }
            app_startTransfer(transferSpec)
        })
}

// callback after files are selected
function app_storeFileNames(selection) {
    for (const file of selection.dataTransfer.files) {
        selected_upload_files.push(file.name)
    }
    console.log('Files picked', selected_upload_files)
    app_updateUi()
}

// Button: Select files for upload
function app_pick_files() {
    // for the sample: a new select deletes already selected files
    app_resetSelection()
    if (document.getElementById('use_connect').checked) {
        this.client.showSelectFileDialogPromise({ allowMultipleSelection: false })
            .then((selection) => { app_storeFileNames(selection) })
            .catch(() => { console.error('Unable to select files') })
    } else {
        asperaHttpGateway.getFilesForUpload((selection) => { app_storeFileNames(selection) }, HTTPGW_FORM_ID)
    }
}

// Button: Upload selected files
function app_upload() {
    app_getTransferSpec({ operation: 'upload', sources: selected_upload_files, destination: document.getElementById('upload_folder').value })
        .then((transferSpec) => {
            app_startTransfer(transferSpec)
            app_resetSelection()
        })
}
