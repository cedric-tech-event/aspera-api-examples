const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

// process proto file
const PROTOFILE = path.join('/',process.env.CONFIG_TRSDK_DIR_GENERIC,'connectors/transfer.proto');
// read config of examples
const yconf = yaml.load(fs.readFileSync(process.env.CONFIG_YAML, 'utf8'));
const url = new URL(yconf['trsdk_url'])
const address = url.hostname + ":" + url.port
// load definition for the aspera transfer sdk package
const packageDefinition = protoLoader.loadSync(PROTOFILE, {keepCase : true,longs : String,enums : String,defaults : true,oneofs : true});
const transfersdk = grpc.loadPackageDefinition(packageDefinition).transfersdk;
// create a connection to the transfer manager daemon
const client = new transfersdk.TransferService(address, grpc.credentials.createInsecure());

module.exports = {
	config: yconf,
	tmp_folder: 'tmp',
	// start a transfer , provide transfer_spec and optionally event callback
	start_transfer_and_wait: (transferSpec)=>{
		const startTransferRequest = {
		transferType : 'FILE_REGULAR',
		transferSpec : JSON.stringify(transferSpec)
		};
		var finished=false;
		const eventStream = client.startTransferWithMonitor(startTransferRequest, function(err, _) {
			console.log("error starting transfer " + err);
			finished=true;
		})
		eventStream.on('data', function(data) {
			console.log("Transfer %d Mbps/%d Mbps %s %s %s", data.transferInfo.averageRateKbps / 1000,
				data.transferInfo.targetRateKbps / 1000, data.transferEvent, data.status, data.transferType);
			finished=true;
		})
		//while(!finished) console.log('');
	}
}
