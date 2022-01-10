#!/usr/bin/env node
// laurent.martin.aspera@fr.ibm.com
const test_environment = require('./test_environment.js');
const path = require('path')
var t_spec1_generic = {
    "remote_host":"demo.asperasoft.com",
    "remote_user":"asperaweb",
    "remote_password":"demoaspera",
    "ssh_port":33001,
}

// Example 1: download
// Instead of using the soon deprecated FaspManager1 Python lib, let's use the transfer spec
// direction is relative to us, client, i.e. receive = download
setTimeout(() => {
    console.log("======Test download");
    t_spec1_generic["direction"]="receive";
    t_spec1_generic["destination_root"]=test_environment.tmp_folder;
    t_spec1_generic["paths"]=[{"source":"/aspera-test-dir-tiny/200KB.1"}];
    test_environment.start_transfer_and_wait(t_spec1_generic);
},0);

local_file = path.join('/',test_environment.tmp_folder, "200KB.1");

// Example 2: upload: single file upload to existing folder.
setTimeout(() => {
    console.log("======Test upload 1")
    t_spec1_generic["direction"]="send";
    t_spec1_generic["destination_root"]="/Upload";
    t_spec1_generic["paths"]=[{"source":local_file}];
    t_spec1_generic["tags"]={"mysample_tag":"hello"};
    test_environment.start_transfer_and_wait(t_spec1_generic)
},5000);
// check file is uploaded by connecting to: http://demo.asperasoft.com/aspera/user/ with same creds

// Example 3: upload: single file upload to non-existing folder
// if there is only one source file and destination does not exist, then "FASP" assumes it is destination filename
// but if destination is a folder, it will send same source filename into folder
// so enforce folder creation, to be sure of what happens
setTimeout(() => {
	console.log("======Test upload 2");
	t_spec1_generic['destination_root'] = '/Upload/new_folder';
	t_spec1_generic['create_dir'] = true;
	test_environment.start_transfer_and_wait(t_spec1_generic);
},10000);

// Example 4: upload: send to sub folder, but using file pairs
setTimeout(() => {
	console.log("======Test upload 3");
	t_spec1_generic['destination_root'] = '/Upload';
	delete t_spec1_generic['create_dir'];
	t_spec1_generic['paths'] = [{"source":local_file, "destination":"xxx/newfilename.ext"}];
	test_environment.start_transfer_and_wait(t_spec1_generic);
},15000);

