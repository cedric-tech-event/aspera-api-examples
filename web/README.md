# Simple examples for Aspera HTTP Gateway

[All Aspera APIs here](https://developer.ibm.com/apis/catalog?search=aspera)

[Refer to the Aspera HTTP GW SDK doc here](https://developer.ibm.com/apis/catalog?search=%22aspera%20http%22)

[Refer to the Aspera Connect SDK doc here](https://developer.ibm.com/apis/catalog?search=%22aspera%20connect%22)

## Configuration

The example use these values from the config file (`../config.yaml`):

```yaml
httpgw:
  url: https://mygw.example.com/aspera/http-gwy
server:
    download_file: /aspera-test-dir-small/10MB.1
    upload_folder: /Upload
node:
    url: https://server.example.com
    user: _node_user_here_
    pass: _node_pass_here_
nodeak:
  url: https://server.example.com
  access_key: _node_access_key_here_
  secret: _node_secret_here_
```

This YAML will generate the equivalent file <conf.js> .

## Setup and Run

Install nodeJS, and then install packages and run the server with:

```bash
make
```

Then open a browser to:

<http://localhost:3000>
