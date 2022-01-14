const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const assert = require('assert');

assert(process.env.CONFIG_TRSDK_DIR_GENERIC, 'CONFIG_TRSDK_DIR_GENERIC env var is missing');
assert(process.env.CONFIG_YAML, 'CONFIG_YAML env var is missing');

// process proto file
const PROTOFILE = path.join('/',process.env.CONFIG_TRSDK_DIR_GENERIC,'connectors/transfer.proto');
// read config of examples
const yconf = yaml.load(fs.readFileSync(process.env.CONFIG_YAML, 'utf8'));
// load definition for the aspera transfer sdk package
const packageDefinition = protoLoader.loadSync(PROTOFILE, {keepCase : true, longs : String, enums : String, defaults : true, oneofs : true});
const transfersdk = grpc.loadPackageDefinition(packageDefinition).transfersdk;
// create a connection to the transfer manager daemon
const grpc_url = new URL(yconf['trsdk_url'])
if (!(grpc_url.protocol === 'grpc:')) {
	throw "Expecting gRPC protocol"
}
const client = new transfersdk.TransferService(grpc_url.hostname + ":" + grpc_url.port, grpc.credentials.createInsecure());

module.exports = {
	config: yconf,
	tmp_folder: 'tmp',
	// start a transfer , provide transfer_spec and optionally event callback
	start_transfer_and_wait: (transferSpec)=>{
		const startTransferRequest = {
			transferType : 'FILE_REGULAR',
			transferSpec : JSON.stringify(transferSpec)
		};
		const eventStream = client.startTransferWithMonitor(startTransferRequest, function(err, _) {
			console.log("error starting transfer " + err);
		})
		eventStream.on('data', function(data) {
			console.log("Transfer %d Mbps/%d Mbps %s %s %s", data.transferInfo.averageRateKbps / 1000,
				data.transferInfo.targetRateKbps / 1000, data.transferEvent, data.status, data.transferType);
		})
	}
}
