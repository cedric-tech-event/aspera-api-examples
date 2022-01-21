all::
include ../config.make
../config.make:
	@echo "Run make in upper folder to create config.make"
	@exit 1
PROJECT_NAME=javasamples
PROJECT_VERSION=0.1
JARFILE=build/libs/$(PROJECT_NAME)-$(PROJECT_VERSION)-all.jar
PROPERTIES=-Ddaemon=$(CONFIG_TRSDK_DIR_ARCH)/asperatransferd -Dconfig_daemon=$(CONFIG_TRSDK_CONFIG) -Dconfig_yaml=$(CONFIG_YAML)
all::
	gradle build -Pconfig_proto_dir=$(CONFIG_TRSDK_ROOT)/noarch/connectors
	java -cp $(JARFILE) $(PROPERTIES) client.ServerFileUploadV1Example
	java -cp $(JARFILE) $(PROPERTIES) client.ServerFileDownloadV2Example
	java -cp $(JARFILE) $(PROPERTIES) client.COSFileUploadExample
clean:
	gradle clean -Pconfig_proto_dir=$(CONFIG_TRSDK_ROOT)/noarch/connectors
	rm -fr .gradle
