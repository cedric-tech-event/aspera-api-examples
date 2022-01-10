#!/usr/bin/env node
// laurent.martin.aspera@fr.ibm.com
const test_environment = require('./test_environment.js');

// command line args
const args = process.argv.slice(2);

// test file, here dummy, but could be real file
let filePath = 'faux:///100m?100m'

const server_url = new URL(test_environment.config['server']['url'])
if (!(server_url.protocol === 'ssh:')) {
	throw "Expecting SSH protocol"
}

// create transfer spec
const transferSpecV2 = {
	direction : 'send',
remote_host : server_url.hostname,
session_initiation : {
	ssh : {
	ssh_port : parseInt(server_url.port),
	remote_user : test_environment.config['server']['user'],
	remote_password : test_environment.config['server']['pass']
	}
},
security : {
	cipher : 'aes-256'
},
assets : {
destination_root : '/Upload',
paths : [
	{
		source : filePath
	}
]
}
};

test_environment.start_transfer_and_wait(transferSpecV2);
