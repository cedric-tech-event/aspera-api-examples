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
	node server_v2.js
	node server.js
clean:
	rm -f .is_setup package-lock.json file
	rm -fr node_modules
