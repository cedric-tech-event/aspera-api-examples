# Simple examples for Aspera HTTP Gateway

[Refer to the HTTP GW SDK doc here](https://developer.ibm.com/apis/catalog?search=%22aspera%20http%22)

## Configuration

The example use these values from the config file:

```yaml
  misc:
    httpgw_url: https://mygw.example.com/aspera/http-gwy
    server_file: /aspera-test-dir-small/10MB.1
  node:
    user: node_user
    pass: pass_here
    url: https://server.example.com
```

## Setup and Run

Install nodeJS, and then install packages and run the server with:

```bash
make
```

Then open a browser to:

<http://localhost:3000>
