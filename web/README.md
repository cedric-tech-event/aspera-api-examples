# Simple examples for Aspera HTTP Gateway

[Refer to the HTTP GW SDK doc here](https://developer.ibm.com/apis/catalog?search=%22aspera%20http%22)

## Configuration

The example use these values from the config file (`../config.yaml`):

```yaml
  httpgw:
    url: https://mygw.example.com/aspera/http-gwy
  node:
    user: _node_user_here_
    pass: _node_pass_here_
    url: https://server.example.com
    download_file: /aspera-test-dir-small/10MB.1
    upload_folder: /Upload
```

## Setup and Run

Install nodeJS, and then install packages and run the server with:

```bash
make
```

Then open a browser to:

<http://localhost:3000>
