SRC=src
TMP=tmp
LIB=sdk

FASPMANAGER_DIR=$(LIB)/fspmgr
TRANSFERSDK_DIR=$(LIB)/trsdk

export FASPMANAGER_DIR TRANSFERSDK_DIR

all: libs
	mkdir -p $(TMP)
	date > $(TMP)/This_is_a_test.txt
	$(SRC)/server.py
	$(SRC)/faspex.py $(TMP)/This_is_a_test.txt
	$(SRC)/node.py $(TMP)/This_is_a_test.txt
	$(SRC)/cos.py $(TMP)/This_is_a_test.txt
	$(SRC)/aoc.py $(TMP)/This_is_a_test.txt

doc:
	sed 's/^\(    [^:]*:\).*/\1 your_value_here/' < config.yaml > config.tmpl

clean:
	rm -fr $(TMP) $(LIB)
	find . -name __pycache__|xargs rm -fr
	rm -f .libs_installed .sdk_installed

sdk: .sdk_installed
.sdk_installed: 
	rm -fr $(LIB)
	mkdir -p $(FASPMANAGER_DIR)
	curl -s http://download.asperasoft.com/download/sw/sdk/faspmanager/python/faspmanager-sdk-python-3.7.2-d787953b521f059412ad1713afaa38ccbb760a47.zip -o $(LIB)/faspmanager-sdk-python-3.7.2.zip
	cd $(FASPMANAGER_DIR) && unzip ../faspmanager-sdk-python-3.7.2.zip
	mkdir -p $(FASPMANAGER_DIR) $(TRANSFERSDK_DIR)
	curl -s https://eudemo.asperademo.com/aspera/faspex/transfer_sdk.zip -o $(LIB)/transfer_sdk.zip
	cd $(TRANSFERSDK_DIR) && unzip ../transfer_sdk.zip
	touch .sdk_installed

libs: .libs_installed
.libs_installed: sdk
	pip3 install -r $(TRANSFERSDK_DIR)/noarch/connectors/python/requirements.txt
	pip3 install requests PyYAML pyjwt
	touch .libs_installed
