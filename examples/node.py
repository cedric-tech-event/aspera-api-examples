#!/usr/bin/env python3
import setup
import faspmanager
import faspmanager_helper
import requests
import logging
import requests.auth
import json
import sys

# get file to upload from command line
files_to_upload = sys.argv
destination_folder='/Upload'

# get node information from config file
config=setup.CONFIG['node']

# prepare node API request for upload_setup
upload_setup_request = {'transfer_requests':[{'transfer_request':{'paths':[{'destination':destination_folder}]}}]}

request_headers={
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }

# call Node API with one transfer request to get one transfer spec
response = requests.post(
    config['url'] + '/files/upload_setup',
    auth=requests.auth.HTTPBasicAuth(config['user'], config['pass']),
    data=json.dumps(upload_setup_request),
    headers=request_headers,
    verify=False)
if response.status_code != 200:
    raise Exception('error')

response_data = response.json()

# extract the single transfer spec (we sent a single transfer request)
t_spec = response_data['transfer_specs'][0]['transfer_spec']
logging.debug(t_spec)

# add file list in transfer spec
t_spec['paths'] = []
for f in files_to_upload:
    t_spec['paths'].append({'source':f})

# send files into package
faspmanager_helper.start_transfer_and_wait(t_spec)
