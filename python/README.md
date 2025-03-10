# Laurent's API examples for Aspera using Python

Tested with Python3 on OSX.

This project provides code examples to use some IBM Aspera APIs and transfer files for various IBM Aspera products using python.

The sample code in `src` shows how to transfer files using:

* IBM Aspera HSTS using SSH credentials
* IBM Aspera HSTS or Shares using Node credentials
* IBM Cloud Object Storage (COS) using IBM Cloud service credentials
* IBM Aspera Faspex
* IBM Aspera on Cloud using JWT and a private key

## Quick start

Once the main folder has been initialized:

```
cd python

make
```

This will:

* Check and Download FaspManager
* Check and Install required python modules
* Run sample programs with sample files using servers as configured in the config file.

If you prefer to test a single application, you may configure only the appropriate section in the config file , have a look to the [`Makefile`](Makefile) to check how example is invoked and execute just the example relevant to you.

# Required external components

When `make` is invoked (Quick Start), it will check and install:

* Required python modules
* Aspera FaspManager (Legacy SDK)

Check the [`Makefile`](Makefile) for details.

# <a id="sdk"></a>SDK Selection

TransferSDK (Legacy) versus FaspManager (Current)

To start transfers, sample code uses either:

* The current [Transfer SDK](https://developer.ibm.com/apis/catalog?search=%22aspera%20transfer%20sdk%22) which is **recommended** for new developments.
* Or the legacy [FASPManager API](https://developer.ibm.com/apis/catalog?search=%22fasp%20manager%20sdk%22) together with a helper method that translates the **transfer_spec** into the Legacy FaspManager structure.

In both cases, sample code uses the transfer spec structure, refer to API reference in Transfer SDK.

Use of one or the other is controlled by the configuration parameter: `sdk`, set to either `transfer_sdk` or `faspmanager`

# Structure of examples

Each of the sample programs are strutured like this:

* `import test_environment` : `test_environment.py` is located in the same folder as the example :
	* it reads the configuration file
	* setup debug logging
	* defines the method: `start_transfer_and_wait` which takes a **transfer_spec** as argument to start a transfer.
* get configuration, urls, username, credentials, secrets, from test_environment.CONFIG
* call application API to build a **transfer_spec**
* call `start_transfer_and_wait ` with this **transfer_spec** to start a transfer

# Known Transfer SDK Issues

Even if property `etc` is set to other folder, it looks for `aspera-license` file in `etc` folder (will be fixed in next release).

Transfer fails if `http_fallback` is `True`.

# COS official documentation for Aspera SDK

<https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-aspera>
