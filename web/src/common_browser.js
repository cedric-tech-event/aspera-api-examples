// browser specific
var common_browser = {
    // @return transfer spec with token by calling the local express server
    get_transfer_spec_broker: function (params) {
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
    },
    // generic method to get transfer spec
    get_transfer_spec: function (params) {
        return common.get_transfer_spec_direct(params);
    }
};
common_browser;
