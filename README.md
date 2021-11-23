# Laurent's python example for Aspera transfers

Tested with Python3 on OSX.

This project provides code examples to use some IBM Aspera APIs and transfer files for various IBM Aspera products using python.

The sample code in `src` shows how to transfer files using:

* IBM Aspera HSTS using SSH credentials
* IBM Aspera HSTS or Shares using Node credentials
* IBM Cloud Object Storage (COS) using IBM Cloud service credentials
* IBM Aspera Faspex
* IBM Aspera on Cloud using JWT and a private key

[General access to all IBM Aspera APIs here](https://developer.ibm.com/apis/catalog/?search=aspera)

# Quick start

1. [Create the configuration file and fill with valid server addresses and credentials](#config)

1. Execute all tests:

    ```bash
make
    ```

    This will:

    * Check and Download SDKs
    * Check and Install required python modules
    * Run sample programs

If you prefer to test a single application, you may configure only the appropriate section in the config file , have a look to the [`Makefile`](Makefile) to check how example is invoked and execute just the example relevant to you.

# <a href="config"></a>Configuration file

A template configuration file is provided: [`config.tmpl`](config.tmpl).

Copy the file `config.tmpl` into `config.yaml` and fill with your own server addresses, credentials and parameters.

```bash
cp config.tmpl config.yaml
vi config.yaml
```

Set the parameter `arch` to the architecture used (yes ... it could be auto-detected), one of:

* `osx-amd64`
* `windows-amd64`
* `linux-amd64`
* `linux-s390x`
* `linux-ppc64le`
* `aix-ppc64`

The parameter `sdk` selects which API will be used to start transfer, refer to section: [SDK Selection](#sdk), prefer to use `transfer`.

Example (with random credentials):

```
---
  arch: osx-amd64
  sdk: transfer
  faspex:
    url: https://faspex.example.com/aspera/faspex
    user: laurent
    pass: Sup3rS3cR3T!
  node:
    url: https://node.example.com:9092
    user: node_aspera
    pass: Sup3rS3cR3T!
  cos:
    endpoint: https://s3.eu-de.cloud-object-storage.appdomain.cloud
    bucket: mybucket
    key: FADSFds4324FDSAD25342FAsdfs-54FDFD54UAFtw8
    crn: 'crn:v1:bluemix:public:cloud-object-storage:global:a/4343hj4hj3h43jhj43hj:h3j2h3j2-5029-34jk-af65-hj43hj43hj43hj::'
    auth: https://iam.cloud.ibm.com/identity/token
  coscreds:
    bucket: mybucket
    service_credential_file: ./service_creds.json
    region: eu-de
  aoc:
    org: acme
    user_email: laurent.martin.aspera@fr.ibm.com
    private_key_path: /Users/laurent/.aspera/ascli/my_aoc_key
    client_id: aspera.global-cli-client
    client_secret: frpmsRsG4mjZ0PlxCgdJlvONqBg4Vlpz_IX7gXmBMAfsgMLy2FO6CXLodKfKAuhqnCqSptLbe_wdmnm9JRuEPO-PpFqpq_Kb
    workspace: Default
    shared_inbox: TheSharedInbox
```

# Required external components

When `make` is invoked (Quick Start), it will check and install:

* Required python modules
* Aspera FaspManager (Legacy SDK)
* Aspera Transfer SDK (Current SDK)

Check the [`Makefile`](Makefile) for details.

# <a href="sdk"></a>SDK Selection

TransferSDK (Legacy) versus FaspManager (Current)

To start transfers, sample code uses either:

* The current [Transfer SDK](https://developer.ibm.com/apis/catalog?search=%22aspera%20transfer%20sdk%22) which is recommended for new developments.
* Or the legacy [FASPManager API](https://developer.ibm.com/apis/catalog?search=%22fasp%20manager%20sdk%22) together with a helper method that translates the **transfer_spec** into the Legacy FaspManager structure.

In both cases, sample code uses the transfer spec structure, refer to API reference in Transfer SDK.

Use of one or the other is controlled by the configuration parameter: `sdk`, set to either `transfer` or `faspmanager`

# Structure of examples

Each of the sample programs are strutured like this:

* `import test_environment` : `test_environment.py` is located in the same folder as the example :
	* it reads the configuration file
	* setup debug logging
	* defines the method: `start_transfer_and_wait` which takes a **transfer_spec** as argument to start a transfer.
* get configuration, urls, username, credentials, secrets, from test_environment.CONFIG
* call application API to build a **transfer_spec**
* call `start_transfer_and_wait ` with this **transfer_spec** to start a transfer

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

Uncomment lines in `cos.py` to use service credential file instead of bare api key.

# Aspera on Cloud

For Aspera on Cloud, several items are required:

* `org` : The AoC Organization, i.e. the name before `.ibmaspera.com` in the URL
* `user_email` : The user's IBMid
* `private_key_path` : The path to the PEM file containing the user's private key. The user configured the associated public key in his AoC User's profile.
* `client_id` : (see below) The client app identifier
* `client_secret` : (see below) The client app secret

`client_id` and `client_secret` can be:

* either a specific application credential created in the admin interface of AoC (Integrations)
* or one of the two global client id : the one of aspera connect/drive or the one of the legacy `aspera` CLI :
    * `aspera.global-cli-client`
    * `frpmsRsG4mjZ0PlxCgdJlvONqBg4Vlpz_IX7gXmBMAfsgMLy2FO6CXLodKfKAuhqnCqSptLbe_wdmnm9JRuEPO-PpFqpq_Kb`

For example to extract the ones of Aspera Connect (Drive): `strings asperaconnect|grep -B1 '^aspera\.drive$'`

# Known Transfer SDK Issues

Even if property `etc` is set to other folder, it looks for aspera-license file in `etc` folder (will be fixed in next release).

Transfer fails if `http_fallback` is `True`.
