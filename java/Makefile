all::
include ../config.make
../config.make:
	@echo "Run make in upper folder to create config.make"
	@exit 1
PROJECT_NAME=javasamples
PROJECT_VERSION=0.1
JARFILE=build/libs/$(PROJECT_NAME)-$(PROJECT_VERSION)-all.jar
all::
	gradle build -Pconfig_proto_dir=$(CONFIG_TRSDK_ROOT)/noarch/connectors
	java -cp $(JARFILE) -Dconfig_yaml=$(CONFIG_YAML) client.COSFileUploadExample
	java -cp $(JARFILE) -Dconfig_yaml=$(CONFIG_YAML) client.ServerFileDownloadExample
clean:
	gradle clean -Pconfig_proto_dir=$(CONFIG_TRSDK_ROOT)/noarch/connectors
	rm -fr .gradle
