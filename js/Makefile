# test file to transfer, here generated file, but could be real file with a path
FILE_TRANSFER=faux:///100m?100m
all: run
include ../config.make
../config.make:
	@echo "Run make in upper folder to create config.make"
	@exit 1
export CONFIG_TRSDK_DIR_GENERIC CONFIG_YAML
setup: .is_setup
.is_setup:
	npm install
	touch $@
run: .is_setup
	node server_v2.js '$(FILE_TRANSFER)'
	node server.js '$(FILE_TRANSFER)'
clean:
	rm -f .is_setup package-lock.json file
	rm -fr node_modules
