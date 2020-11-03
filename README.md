# Laurent's aspera-python

Tested with Python3.

This project provides a small library and examples to use some IBM Aspera APIs and transfer files for various products in python.

The library files in `src`:

* allow starting a stransfer with the legacy "FaspManager" using `transfer_spec` instead of the basic API.
* get Node api credentials for COS (2 methods)

The sample code in `examples` show how to transfer files using:

* IBM Aspera HSTS using SSH credentials
* IBM Aspera HSTS using Node credentials
* IBM Cloud Object Storage (COS) using IBM Cloud service credentials
* IBM Aspera Faspex

# TransferSDK versus FaspManager

Note that the examples use the older "FASPManager" API to start transfer, but they use the `transfer_spec` structure. The module `faspmanager_help` translates the transfer_spec into the FaspManager structure.

Because they use `transfer_spec`, the examples can be modified easily to use the newer [Transfer SDK](https://api.ibm.com/explorer/catalog/aspera/product/ibm-aspera/api/transfer-sdk/doc/guides-toc). Note that currently the TransferSDK only supports: Windows, Linux and MacOS. If you use one of those supported platform, prefer to use `TransferSDK`, else use the older `FaspManager` API (it is pure python).

All IBM Aspera APIs: [https://api.ibm.com/explorer/catalog/aspera/product/ibm-aspera/doc/overview](https://api.ibm.com/explorer/catalog/aspera/product/ibm-aspera/doc/overview)

# Structure of examples

Each of the example code is strutured like this:

* `import setup` setup.py is located in the same folder as the example , it reads the configuration file and setup debug logging
* `import faspmanager` the `faspmanager` folder contains IBM Aspera's FaspManager for python
* `import faspmanager_helper` located in `src` this translates transfer_spec into FaspManager structure.
* get secrets from setup.CONFIG

# Get `ascp` for your platform

You can get the necessary `ascp` and `aspera-license` executable from the TransferSDK or the free [IBM Aspera Desktop Client](https://www.ibm.com/support/fixcentral/swg/selectFixes?product=ibm/Other%20software/IBM%20Aspera%20Desktop%20Client) ( [Release Notes](https://www.ibm.com/support/knowledgecenter/SSXN9J_3.9.6/relnote/desktop_client_relnotes.html) ).

As of version 3.9.6.1, the following platforms are supported:

* Windows 64 bit
* MacOS
* Linux x86_64
* PowerLinux ppc64-le
* zLinux s390, 64-bit
* AIX
* Solaris x86
* Solaris sparc
* Isilon 8

From the installed software extract `ascp` and `aspera-license`.

If you dont find your platform, check the
[IBM Aspera High Speed Transfer Server](https://www.ibm.com/support/fixcentral/swg/selectFixes?product=ibm/Other%20software/IBM%20Aspera%20High-Speed%20Transfer%20Server)
( [Release Notes](https://www.ibm.com/support/knowledgecenter/SSL85S_3.9.6/relnote/hsts_relnotes.html) ).

A proper HSTS installation with license file works as well.

# Pepare python 3

Install packages used by examples:

```
$ pip3 install requests
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

To test transfers to COS, you will need:

* bucket name
* storage endpoint
* api key
* crn
* auth endpoint

This is the default in the example.

Or, it is also possible to use:

* bucket name
* region
* service credentials: create the file `private/service_creds.json`, follow: [get service credentials](https://www.rubydoc.info/gems/asperalm#ibm-cloud-object-storage)

For this swap the commented line in `cos.py`.

# Create the configuration file for examples

Create the folder `private` and then the file `private/config.yaml` :

```
---
  faspmanager: /home/laurent
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
    storage_endpoint: https://s3.eu-de.cloud-object-storage.appdomain.cloud
    api_key: Abc1233ffjklqshfkjdlsq
    crn: 'crn:v1:bluemix:public:cloud-object-storage:global:a/jhfklsddhfsqkldd:iofpqs::'
    auth_endpoint: https://iam.cloud.ibm.com/identity/token
```

The parameter `faspmanager` is set to the folder that contains the `faspmanager` folder from the original IBM Aspera Faspmanager for python.

For COS use either the first 3, or last 5 parameters (and comment/uncomment the appropriate line in `cos.py`)

# Execute examples

```
$ make
```

or simply execute the sample code you want and provide one argument: path to a file to send:

```
$ truncate --size=1G bigfile.bin
$ ./examples/node.py bigfile.bin
```

# Modify examples

Start by copying one of the example.

Remove the line `import setup`

add lines at the beginning to tell where libs are:

```
import sys
sys.path.insert(1, 'path to src folder')
sys.path.insert(1, 'path to folder containing faspmanager')
```

remove `sys.argv` and replace with your list of files:

```
files_to_upload=['myfile.bin']
```

delete the line containing `setup.CONFIG`

replaces parameters `config['param_name']` with actual values

That's it you have a standlone script.

Happy transfers with IBM Aspera !

