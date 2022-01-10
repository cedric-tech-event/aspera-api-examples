import sys
import os
import yaml
import logging

try:
    # Python 3
    import http.client as http_client
except ImportError:
    # Python 2
    import httplib as http_client

# set logger for debugging
logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)

# debug http: see: https://stackoverflow.com/questions/10588644
http_client.HTTPConnection.debuglevel = 1

# where transfered files will be stored
tmp_folder = os.environ['TMPDIR']

# use "ascp" in PATH, add the one from sdk
os.environ['PATH'] += os.environ['CONFIG_TRSDK_DIR_ARCH']

# configuration from configuration file
CONFIG = yaml.load(open(os.environ['CONFIG_YAML']), Loader=yaml.FullLoader)

# depending on flag, use new SDK, or old faspmanager
if 'sdk' in CONFIG and CONFIG['sdk'] == 'faspmanager':
    # tell where to find legacy faspmanager lib
    sys.path.insert(1, os.environ['CONFIG_FSMGR_DIR'])
    import helper_aspera_faspmanager

    def start_transfer_and_wait(t_spec):
        logging.debug(t_spec)
        helper_aspera_faspmanager.start_transfer_and_wait(t_spec)

else:
    sys.path.insert(1, os.path.join(os.environ['CONFIG_TRSDK_DIR_GENERIC'], 'connectors', 'python'))
    import helper_aspera_transfer_sdk

    def start_transfer_and_wait(t_spec):
        # TODO: remove when transfer sdk bug fixed
        t_spec['http_fallback'] = False
        logging.debug(t_spec)
        helper_aspera_transfer_sdk.start_transfer_and_wait(t_spec)
