#!/usr/bin/env python3
import xml.dom.minidom;
import requests;
import json;
import logging;

IBM_CLOUD_OAUTH_URL = 'https://iam.cloud.ibm.com/identity/token'

def node_info_basic(bucket_name, storage_endpoint, api_key, storage_crn, token_endpoint=IBM_CLOUD_OAUTH_URL):
    # 4- get bearer token to access COS S3 API
    # payload to generate auth token
    token_req_data = {
      'grant_type'   :'urn:ibm:params:oauth:grant-type:apikey',
      'response_type':'cloud_iam',
      'apikey'       :api_key
    }
    response = requests.post(token_endpoint, data=token_req_data, headers={'Content-type': 'application/x-www-form-urlencoded'})
    if response.status_code != 200:
        raise Exception("error")
    bearer_token_info = response.json()
    logging.debug(bearer_token_info)
    
    # 5- get Aspera connection information for the bucket
    header_auth = {
        'ibm-service-instance-id':storage_crn,
        'Authorization':bearer_token_info['token_type'] + " " + bearer_token_info['access_token'],
        'Accept':'application/xml'
        }
    response = requests.get("https://" + storage_endpoint + "/" + bucket_name, headers=header_auth, params={'faspConnectionInfo':True})
    if response.status_code != 200:
        raise Exception("error")
    logging.debug(response.content)
    ats_info_root = xml.dom.minidom.parseString(response.content.decode('utf-8'));
    ats_ak = ats_info_root.getElementsByTagName('AccessKey')[0]
    ats_url = ats_info_root.getElementsByTagName('ATSEndpoint')[0].firstChild.nodeValue
    ats_ak_id = ats_ak.getElementsByTagName('Id')[0].firstChild.nodeValue
    ats_ak_secret = ats_ak.getElementsByTagName('Secret')[0].firstChild.nodeValue
    
    # 6- get delegated token to access the node api
    token_req_data['response_type'] = 'delegated_refresh_token'
    token_req_data['receiver_client_ids'] = 'aspera_ats'
    response = requests.post(token_endpoint, data=token_req_data, headers={'Content-type': 'application/x-www-form-urlencoded'})
    if response.status_code != 200:
        raise Exception("error when generating token")
    delegated_token_info = response.json()
    aspera_storage_credentials = {
        'type': 'token',
        'token': delegated_token_info
    }
    logging.debug(aspera_storage_credentials)
    return {
      'url': ats_url,
      'auth': requests.auth.HTTPBasicAuth(ats_ak_id, ats_ak_secret),
      'headers': {
        'X-Aspera-Storage-Credentials':json.dumps(aspera_storage_credentials),
        },
      'tspec': {'tags':{'aspera':{'node':{'storage_credentials':aspera_storage_credentials}}}}
    }

def node_info_creds(bucket_name, bucket_region, service_credential_file, token_endpoint=IBM_CLOUD_OAUTH_URL):
    # 1- read and check format of service credentials
    with open(service_credential_file) as f:
      service_credentials = json.load(f)
    if not isinstance(service_credentials, dict):
        raise Exception("service creds must be a dict")
    for k in ['apikey', 'endpoints', 'resource_instance_id']:
        if not k in service_credentials:
            raise Exception("missing key: " + k)
    logging.debug(service_credentials)
    
    # 2- read endpoints from url in service credentials
    response = requests.get(service_credentials['endpoints'])
    if response.status_code != 200:
        raise Exception("error")
    
    # 3- get specific endpoint for region
    storage_endpoint = response.json()['service-endpoints']['regional'][bucket_region]['public'][bucket_region]
    logging.debug(storage_endpoint)
    
    return node_info_basic(bucket_name, storage_endpoint, service_credentials['apikey'], service_credentials['resource_instance_id'], token_endpoint)

