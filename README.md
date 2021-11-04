# Laurent's aspera-python

Tested with Python3.

This project provides a small library and examples to use some IBM Aspera APIs and transfer files for various IBM Aspera products using python.

The library files in `src`:

* allows starting a transfer with the legacy Aspera pythin "FaspManager" using `transfer_spec` instead of the basic API.
* get Node api credentials for COS (2 methods)

The sample code in `src` show how to transfer files using:

* IBM Aspera HSTS using SSH credentials
* IBM Aspera HSTS using Node credentials
* IBM Cloud Object Storage (COS) using IBM Cloud service credentials
* IBM Aspera Faspex

# TransferSDK versus FaspManager

The examples use the older "FASPManager" API to start transfer.
Nevertheless, they use the `transfer_spec` structure.
The module `faspmanager_help` translates the transfer_spec into the Legacy FaspManager structure.
Thanks to this, the examples can be modified easily to use the newer [Transfer SDK](https://developer.ibm.com/apis/catalog?search=%22aspera%20transfer%20sdk%22).

All IBM Aspera APIs: [https://developer.ibm.com/apis/catalog/?search=aspera](https://developer.ibm.com/apis/catalog/?search=aspera)

# Structure of examples

Each of the example code is strutured like this:

* `import test_environment` : `test_environment.py` is located in the same folder as the example :
	* it reads the configuration file
	* setup debug logging
	* `import helper_aspera_faspmanager` located in `src` this translates transfer_spec into FaspManager structure.
* get configuration, urls, username, credentials, secrets, from test_environment.CONFIG

# Get `ascp` for your platform

You can get the necessary `ascp` and `aspera-license` executable from the [Transfer SDK](https://developer.ibm.com/apis/catalog?search=%22aspera%20transfer%20sdk%22) or the free [IBM Aspera Desktop Client](https://www.ibm.com/support/fixcentral/swg/selectFixes?product=ibm/Other%20software/IBM%20Aspera%20Desktop%20Client) ( [Release Notes](https://www.ibm.com/support/knowledgecenter/SSXN9J_3.9.6/relnote/desktop_client_relnotes.html) ).

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

# Pepare python 3

Install packages used by examples:

```
$ pip3 install requests PyYAML pyjwt
```

# Retrieve Legacy IBM Aspera FaspManager for python

Execute the makefile: `make` : it will retrieve the SDK.

Or get the FaspManager package for python:
[IBM Aspera FASPManager for python](https://developer.ibm.com/apis/catalog/aspera--fasp-manager-sdk/Introduction)

```
$ mkdir lib
$ cd lib
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

For this swap the commented lines in `cos.py`.

# Create the configuration file with your credentials

Copy the file `config.tmpl` into `config.yaml` and fill.

# Execute examples

```
$ make
```

Or simply the sample code you want and provide one argument: path to a file to send:

```
$ truncate --size=1G bigfile.bin
$ ./src/node.py bigfile.bin
```

# Start your own app

Copy and modify one of the examples.
