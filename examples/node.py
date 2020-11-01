#!/usr/bin/env python3
import setup
import faspmanager
import faspmanager_helper
import requests
import requests.auth
import logging
import json
import sys

# files to send
upload_files = sys.argv

# package creation information
upload_request = {
    "transfer_requests":[
        {"transfer_request":{"paths":[{"destination":"/Upload"}]}}]}
logging.debug("req=%s",upload_request)

# create package and get information for file upload
response = requests.post(
    setup.CONFIG['node']['url'] + '/files/upload_setup',
    auth=requests.auth.HTTPBasicAuth(setup.CONFIG['node']['user'], setup.CONFIG['node']['pass']),
    data=json.dumps(upload_request),
    headers={
        "Content-Type": "application/json",
        "Accept": "application/json"
    },
    verify=False)
response_data = response.json()

logging.debug("resp=%s",response_data)

if 'error' in response_data:
    raise Exception(response_data['error']['internal_message'])

# get transfer spec returned by Faspex
t_spec = response_data["transfer_specs"][0]["transfer_spec"]

# add file list in transfer spec
t_spec['paths'] = []
for f in upload_files:
    t_spec['paths'].append({'source':f})

# send files into package
faspmanager_helper.start_transfer_and_wait(t_spec)
