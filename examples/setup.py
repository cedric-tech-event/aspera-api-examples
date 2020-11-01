import sys
import os
import yaml
import logging
import http.client

# set logger for debugging
logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)

# get main folder
main_folder=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# tell where to find our libs
sys.path.insert(1, os.path.join(main_folder,'src'))

# if "ascp" is not already in PATH, add it here
# os.environ["PATH"] += os.pathsep + 'path_to_folder_containing_ascp'

CONFIG = yaml.load(open(os.path.join(main_folder,'private/config.yaml')), Loader=yaml.FullLoader)

sys.path.insert(1, CONFIG['faspmanager'])

# debug http
http.client.HTTPConnection.debuglevel = 1

# set logger for debugging
requests_log = logging.getLogger("requests.packages.urllib3")
requests_log.setLevel(logging.DEBUG)
requests_log.propagate = True
helper_log = logging.getLogger("faspmanager_helper")
helper_log.setLevel(logging.DEBUG)
helper_log.propagate = True
