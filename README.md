# Laurent's aspera-python

This small library provides examples to use some IBM Aspera APIs and transfer files for various products:

* HTSTS
* Node
* Faspex
* COS

Note that the examples use the older "FASPManager" API to start transfer, but they use the `transfer_spec` structure. The module `faspmanager_help` translates the transfer_spec into the FaspManager structure.

Because they use `transfer_spec`, the examples can be modified easily to use the newer [Transfer SDK](https://api.ibm.com/explorer/catalog/aspera/product/ibm-aspera/api/transfer-sdk/doc/guides-toc).

All IBM Aspera APIs: [https://api.ibm.com/explorer/catalog/aspera/product/ibm-aspera/doc/overview](https://api.ibm.com/explorer/catalog/aspera/product/ibm-aspera/doc/overview)

The shell lines below are using `bash`, if you use another shell, you will know what to do.

# Pepare python

Install packages used by examples:

```
$ pip3 install request
```

# Retrieve IBM Aspera FaspManager for python

Get the FaspManager package for python:
[IBM Aspera FASPManager for python](https://api.ibm.com/explorer/catalog/aspera/product/ibm-aspera/api/fasp-manager-sdk/doc/guide)

```
$ mkdir $HOME/aspera_sdk_python
$ cd $HOME/aspera_sdk_python
$ wget http://download.asperasoft.com/download/sw/sdk/faspmanager/python/faspmanager-sdk-python-3.7.2-d787953b521f059412ad1713afaa38ccbb760a47.zip
$ unzip *.zip
$ find . -type d
.
./tests
./examples
./faspmanager
```

# COS service credentials

To test transfers to COS, get your service credentials:

Create the file `private/service_creds.json` , follow:
[get service credentials](https://www.rubydoc.info/gems/asperalm#ibm-cloud-object-storage)

# Create the configuration file for examples

Create the folder `private`and then the file `private/config.yaml` :

```
---
  faspmanager: '/home/laurent'
  faspex:
    url: https://faspex.fqdn.or.ip/aspera/faspex
    user: faspex_username
    pass: the_password
  node:
    url: https://hsts.fqdn.or.ip:9092
    user: node_user
    pass: the_password
  cos:
    service_credential_file: private/service_creds.json
    bucket_region: eu-de
    bucket_name: lolo-de
```

The parameter `faspmanager` is set to the folder that contains the `faspmanager` folder.

# execute samples

```
$ make
```

or simply execute the sample code you want and provide one argument: path to a file to send:

```
$ truncate --size=1G bigfile.bin
$ ./examples/node.py bigfile.bin
```

