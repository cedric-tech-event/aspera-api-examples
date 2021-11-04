#!/usr/bin/env python3
# laurent.martin.aspera@fr.ibm.com
import test_environment
import requests
import requests.auth
import logging
import json
import sys
import jwt
import calendar
import time

# take 5 minutes to account for time offset
JWT_NOTBEFORE_OFFSET_SEC=300
# one hour validity
JWT_EXPIRY_OFFSET_SEC=3600

config=test_environment.CONFIG['aoc']

with open(config['private_key_path']) as fin:
    private_key_pem=fin.read()

seconds_since_epoch=int(calendar.timegm(time.gmtime()))

jwt_payload = {
  'iss': config['client_id'],    # issuer
  'sub': config['user_email'],  # subject
  'aud': 'https://api.asperafiles.com/api/v1/oauth2/token', # audience
  'nbf': seconds_since_epoch-JWT_NOTBEFORE_OFFSET_SEC, # not before
  'exp': seconds_since_epoch+JWT_EXPIRY_OFFSET_SEC, # expiration
  'org': config['org']
}
logging.debug(jwt_payload)

data={
    'scope':      'user:all',
    'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    'assertion':  jwt.encode(jwt_payload, private_key_pem, algorithm='RS256')}

response = requests.post(
    url='https://api.ibmaspera.com/api/v1/oauth2/'+config['org']+'/token',
    auth=requests.auth.HTTPBasicAuth(config['client_id'], config['client_secret']),
    data=data,
    headers={
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
    },
    verify=True)
if response.status_code != 201:
    raise Exception('error')

logging.debug(response.text)

response_data = response.json()

request_headers={
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + response_data['access_token']
}

api_base = 'https://api.ibmaspera.com/api/v1/'

response = requests.get(api_base + 'self', headers=request_headers)

logging.debug(response.text)

