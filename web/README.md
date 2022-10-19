# Simple example for Aspera based transfers in web app

[All Aspera APIs here](https://developer.ibm.com/apis/catalog?search=aspera)

[Refer to the Aspera HTTP GW SDK doc here](https://developer.ibm.com/apis/catalog?search=%22aspera%20http%22)

[Refer to the Aspera Connect SDK doc here](https://developer.ibm.com/apis/catalog?search=%22aspera%20connect%22)

This application gives the choice to contact the node api either directly from the browser or through the express web server.

It is also possible to select transfer via httpgw or through connect,

## Configuration

The example use these values from the config file (`../config.yaml`):

```yaml
httpgw:
  url: https://mygw.example.com/aspera/http-gwy
server:
    url: ssh://eudemo.asperademo.com:33001
    user: _server_user_here_
    pass: _server_pass_here_
    download_file: /aspera-test-dir-small/10MB.1
    upload_folder: /Upload
node:
    url: https://server.example.com
    user: _node_user_here_
    pass: _node_pass_here_
```

This YAML will generate the equivalent file <conf.js> which is used by the server and to populate the client default values.

## Setup and Run

Install nodeJS (v>=17, with `fetch`), and then install packages and run the server with:

```bash
make
```

Then open a browser to:

<http://localhost:3000>

The application can also be used as opened as file in browser, in that case 