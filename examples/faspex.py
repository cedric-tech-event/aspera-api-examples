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
package_files = sys.argv

# package creation information for Faspex API v3
delivery_info = {
    "delivery": {
        "title": "Yo man!",
        "recipients": ["admin"],
        "sources": [{
            "paths": package_files
        }]
    }
}

# create package and get information for file upload
response = requests.post(
    setup.CONFIG['faspex']['url'] + '/send',
    auth=requests.auth.HTTPBasicAuth(setup.CONFIG['faspex']['user'], setup.CONFIG['faspex']['pass']),
    data=json.dumps(delivery_info),
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
t_spec = response_data['xfer_sessions'][0]

# add file list in transfer spec
t_spec['paths'] = []
for f in package_files:
    t_spec['paths'].append({'source':f})

# send files into package
faspmanager_helper.start_transfer_and_wait(t_spec)
