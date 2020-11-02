#!/usr/bin/env python3
import setup
import faspmanager
import faspmanager_helper
import faspmanager_cos
import requests
import logging
import json
import sys

# get file to upload from command line
files_to_upload = sys.argv
destination_folder='/'

# get bucket information from config file
config=setup.CONFIG['cos']

# get Aspera Transfer Service Node information for specified COS bucket
node_info=faspmanager_cos.node_info_creds(config['bucket_name'],config['bucket_region'],config['service_credential_file'])
#node_info=faspmanager_cos.node_info_basic(config['bucket_name'],config['storage_endpoint'],config['api_key'],config['crn'],config['token_endpoint'])

# prepare node API request for upload_setup
upload_setup_request = {'transfer_requests':[{'transfer_request':{'paths':[{'destination':destination_folder}]}}]}

request_headers={
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }

request_headers.update(node_info['headers'])

# call Node API with one transfer request to get one transfer spec
response = requests.post(
    node_info['url'] + '/files/upload_setup',
    auth=node_info['auth'],
    data=json.dumps(upload_setup_request),
    headers=request_headers)
if response.status_code != 200:
    raise Exception('error')

response_data = response.json()

# extract the single transfer spec (we sent a single transfer request)
t_spec = response_data['transfer_specs'][0]['transfer_spec']

# add COS specific authorization info
t_spec.update(node_info['tspec'])
logging.debug(t_spec)

# add file list in transfer spec
t_spec['paths'] = []
for f in files_to_upload:
    t_spec['paths'].append({'source':f})

# start transfer, here we use the FASP Manager, but the newer Transfer SDK can be used as well
faspmanager_helper.start_transfer_and_wait(t_spec)
