// compatible for use in both nodejs (backend) or browser (front end)
var common = {
    // @return transfer spec with token by calling the Node API on HSTS
    get_transfer_spec_direct: (params) => {
        console.log('params:', params)
        return new Promise((callback_resolve, callback_reject) => {
            // requested path for authorization, depends on transfer direction
            let request_paths = null
            const source_paths = []
            // build list of source files suitable for transfer spec
            for (const file of params.sources) {
                source_paths.push({ source: file })
            }
            if (params.operation === 'upload') {
                request_paths = [{ destination: params.destination }]
            } else if (params.operation === 'download') {
                request_paths = source_paths
            } else {
                return callback_reject(`Wrong operation parameter: ${params.operation}`)
            }
            // call HSTS node API (with a single transfer request)
            fetch(config.node.url + `/files/${params.operation}_setup`, {
                method: 'POST',
                headers: { Authorization: 'Basic ' + btoa(config.node.user + ':' + config.node.pass) },
                body: JSON.stringify({ transfer_requests: [{ transfer_request: { paths: request_paths } }] }),
                agent: params.agent
            }).then((response) => {
                if (!response.ok) {
                    console.log(response)
                    return callback_reject(`Node API: ${response.statusText}`)
                }
                return response.json()
            }).then((result) => {
                const result0 = result.transfer_specs[0]
                if (result0.error) {
                    return callback_reject(result0.error.user_message)
                }
                // one request was made, so one answer is received (assume no error)
                const transferSpec = result0.transfer_spec
                // set paths of files to transfer
                transferSpec.paths = source_paths
                // add auth for HTTPGW or connect to use Aspera SSH keys
                transferSpec.authentication = 'token'
                console.log(transferSpec)
                // call resolve callback with resulting transfer spec
                return callback_resolve(transferSpec)
            })
        })
    }
}

common
