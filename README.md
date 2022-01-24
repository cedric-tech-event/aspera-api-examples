# Aspera API use examples

This project provides code examples to use some IBM Aspera APIs and transfer files for various IBM Aspera products using some languages.

[General access to all IBM Aspera APIs here](https://developer.ibm.com/apis/catalog/?search=aspera)

See [Aspera transfer SDK on IBM site](https://developer.ibm.com/apis/catalog?search=%22aspera%20transfer%20sdk%22)

Code examples are provided as part of the SDK itself.


## Quick start

1. [Create the configuration file and fill with valid server addresses and credentials](#config)

1. Setup global environment: (transfer SDK) in main folder:

```bash
make
```

## <a id="config"></a>Configuration file

A template configuration file is provided: [`config.tmpl`](config.tmpl).

Copy the file `config.tmpl` into `config.yaml` and fill with your own server addresses, credentials and parameters.

```bash
cp config.tmpl config.yaml
vi config.yaml
```

Set the parameter `arch` to the architecture used (yes ... it could be auto-detected), one of the folders in `sdk/trsdk`:

* `windows-x86_64`
* `osx-x86_64`
* `linux-x86_64`
* `linux-ppc64le`
* `linux-s390`
* `aix-ppc64`

The parameter `sdk` selects which API will be used to start transfer, refer to section: [SDK Selection](#sdk), prefer to use `transfer`.

Example (with random credentials):

```
---
  arch: osx-amd64
  sdk: transfer
  trsdk_url: grpc://127.0.0.1:55002
  server:
    user: aspera
    pass: demoaspera
    url: ssh://demo.asperasoft.com:33001
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

## COS service credentials

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

## Aspera on Cloud

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

