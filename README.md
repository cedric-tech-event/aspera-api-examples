# Aspera API use examples

This project provides code examples to use some IBM Aspera APIs and transfer files for various IBM Aspera products using some languages.

[General access to all IBM Aspera APIs here](https://developer.ibm.com/apis/catalog/?search=aspera)

See [Aspera transfer SDK on IBM site](https://developer.ibm.com/apis/catalog?search=%22aspera%20transfer%20sdk%22)

Code examples are provided as part of the SDK itself.

[Video about Transfer SDK](https://higherlogicstream.s3.amazonaws.com/IMWUC/d5b91301-6aa1-5741-e083-2a9121d9d8a7_file.mp4)

## Quick start

1. [Create the configuration file config.yaml and fill with valid server addresses and credentials](#config)

1. Setup global environment in main folder:

```bash
make
```

This downloads the SDKs and creates the files: `config.mak` and `config.env`.

## No internet access

If you don't have internet access on the system, download the Transfer SDK with a system with access from:

<https://ibm.biz/aspera_transfer_sdk>

and place the file here: `<main folder>/sdk/trsdk/transfer_sdk.zip`

## Testing individual script

Scripts use some environment variables present in `config.env`.
Once the file is generated by executing `make` in the top level folder, you can set the env vars like this:

```bash
. ../config.env
```

For example to execute an individual script:

```bash
cd python
truncate --size=1m datafile
python src/cos.py datafile
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

```yaml
---
  misc:
    system_type: osx-amd64
    client_sdk: transfer_sdk
    trsdk_url: grpc://127.0.0.1:55002
  httpgw:
    url: https://1.2.3.4/aspera/http-gwy
  server:
    user: aspera
    pass: demoaspera
    url: ssh://demo.asperasoft.com:33001
    download_file: /aspera-test-dir-small/10MB.1
    upload_folder: /Upload
  faspex:
    url: https://faspex.example.com/aspera/faspex
    user: faxpex_user
    pass: _the_password_here_
  node:
    url: https://node.example.com:9092
    user: node_user
    pass: _the_password_here_
  cos:
    endpoint: https://s3.eu-de.cloud-object-storage.appdomain.cloud
    bucket: mybucket
    key: _the_key_here_
    crn: 'crn:v1:bluemix:public:cloud-object-storage:global:_the_crn_::'
    auth: https://iam.cloud.ibm.com/identity/token
  coscreds:
    bucket: mybucket
    service_credential_file: ./service_creds.json
    region: eu-de
  aoc:
    org: acme
    user_email: john@example.com
    private_key_path: /path/to/my_aoc_key
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
* service credentials: create the file `private/service_creds.json`, follow: [get service credentials](https://www.rubydoc.info/gems/aspera-cli#using-service-credential-file)

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
