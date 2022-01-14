# run make in upper folder to generate this file
include ../config.make

SRC=src
TMPDIR=tmp

# environment required for the samples

# used by test scripts
export CONFIG_SDK_ROOT CONFIG_FSMGR_DIR CONFIG_TRSDK_DIR_ARCH CONFIG_TRSDK_DIR_GENERIC CONFIG_YAML CONFIG_TMPDIR

all: libs
	mkdir -p $(TMPDIR)
	date > $(TMPDIR)/This_is_a_test.txt
	dd of=$(TMPDIR)/1G.bin bs=1k seek=$$((1024*1024)) count=0
	$(SRC)/server.py
	$(SRC)/faspex.py $(TMPDIR)/This_is_a_test.txt
	$(SRC)/node.py $(TMPDIR)/This_is_a_test.txt
	$(SRC)/cos.py $(TMPDIR)/This_is_a_test.txt
	$(SRC)/cos2.py $(TMPDIR)/This_is_a_test.txt
	$(SRC)/aoc.py 'test package' 2 $(TMPDIR)/1G.bin
$(CONFIG_TRSDK_DIR_GENERIC)/connectors/python/requirements.txt:
	@echo "run make in upper folder to install transfer SDK"
	exit 1
libs: .is_installed_libs
.is_installed_libs: .is_installed_sdk $(CONFIG_TRSDK_DIR_GENERIC)/connectors/python/requirements.txt
	pip3 install -r $(CONFIG_TRSDK_DIR_GENERIC)/connectors/python/requirements.txt
	pip3 install requests PyYAML pyjwt
	touch $@
sdk: .is_installed_sdk
.is_installed_sdk: 
	mkdir -p $(CONFIG_FSMGR_DIR)
	curl -s http://download.asperasoft.com/download/sw/sdk/faspmanager/python/faspmanager-sdk-python-3.7.2-d787953b521f059412ad1713afaa38ccbb760a47.zip -o $(CONFIG_FSMGR_DIR)/faspmanager-sdk-python-3.7.2.zip
	unzip -d $(CONFIG_FSMGR_DIR) $(CONFIG_FSMGR_DIR)/faspmanager-sdk-python-3.7.2.zip
	#ln -s noarch $(CONFIG_TRSDK_ROOT)/etc
	touch $@
# TODO: remove when transfersdk fixed: the "ln -s" is because of bug in transfer sdk: it requires "etc" even if property "etc" is set in config file
clean:
	rm -f .is_installed_libs .is_installed_sdk
	rm -fr $(TMPDIR) $(CONFIG_FSMGR_DIR)
	find . -name __pycache__|xargs rm -fr
