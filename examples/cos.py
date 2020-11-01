#!/usr/bin/env python3
import setup
import faspmanager
import faspmanager_helper
import faspmanager_cos
import requests
import logging
import json
import sys

cos_conf=setup.CONFIG['cos']
node_info=faspmanager_cos.node_info(cos_conf['service_credential_file'],cos_conf['bucket_region'],cos_conf['bucket_name'])

upload_files = sys.argv

# A- call node API with one transfer request to get one transfer spec
upload_setup_data = {"transfer_requests":[{"transfer_request":{"paths":[{"destination":"/"}]}}]}
response = requests.post(node_info['url'] + '/files/upload_setup', data=json.dumps(upload_setup_data), auth=node_info['auth'], headers=node_info['headers'])
if response.status_code != 200:
    raise Exception("error")
# extract the single transfer spec for a single transfer request
tspec = response.json()['transfer_specs'][0]['transfer_spec']
# add COS specific authorization info
tspec.update(node_info['tspec'])
logging.debug(tspec)
# set file to upload, as usual
tspec['paths'] = [{'source':'/Users/laurent/Documents/Samples/200KB.1'}]
tspec['create_dir'] = True
# B- start transfer, here we use the FASP Manager, but the newer Transfer SDK can be used as well
faspmanager_helper.start_transfer_and_wait(tspec)
