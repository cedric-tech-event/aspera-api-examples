// compatible to both browser and nodejs
var common = {
    // @return transfer spec with token by calling the node api on HSTS
    get_transfer_spec_direct: function (params) {
        console.log('params:', params);
        return new Promise((resolve) => {
            // requested path for authorization
            let request_paths = null;
            const source_paths = [];
            // which files to transfer
            for (const file of params.sources) {
                source_paths.push({ source: file });
            }
            if (params.operation === 'upload') {
                // for sample: server chooses destination
                request_paths = [{ destination: params.destination }];
            } else if (params.operation === 'download') {
                request_paths = source_paths;
            } else {
                console.log(`ERROR: Unexpected request: ${params.operation}`);
                return;
            }
            // call HSTS node API (with a single transfer request)
            fetch(config.node.url + `/files/${params.operation}_setup`, {
                method: 'POST',
                headers: { Authorization: 'Basic ' + btoa(config.node.user + ':' + config.node.pass) },
                body: JSON.stringify({ transfer_requests: [{ transfer_request: { paths: request_paths } }] }),
                agent: params.agent
            }).then((ts_resp) => { return ts_resp.json(); })
                .then((result) => {
                    const result0 = result.transfer_specs[0];
                    if (result0.error) {
                        console.log('ERROR:' + result0.error.user_message);
                        return;
                    }
                    // one request was made, so one answer is received (assume no error)
                    const transferSpec = result0.transfer_spec;
                    // set paths to transfer
                    transferSpec.paths = source_paths;
                    // add auth for httpgw or connect to use aspera ssh keys
                    transferSpec.authentication = 'token';
                    console.log(transferSpec);
                    return resolve(transferSpec);
                });
        });
    }
};

common;
