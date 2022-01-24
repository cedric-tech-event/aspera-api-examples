all::
include ../config.make
../config.make:
	@echo "Run make in upper folder to create config.make"
	@exit 1
# same as in settings.gradle
PROJECT_NAME=javasamples
# same as in build.gradle
PROJECT_VERSION=0.1
JARFILE=build/libs/$(PROJECT_NAME)-$(PROJECT_VERSION)-all.jar
JAVA_PROPS=-Ddaemon=$(CONFIG_TRSDK_DIR_ARCH)/asperatransferd -Dconfig_daemon=$(CONFIG_TRSDK_CONFIG) -Dconfig_yaml=$(CONFIG_YAML)
GRADLE_PROPS=-Pconfig_proto_dir=$(shell dirname $(CONFIG_TRSDK_PROTO))
all::
	gradle build $(GRADLE_PROPS)
	java -cp $(JARFILE) $(JAVA_PROPS) client.ServerFileUploadV1Example
	java -cp $(JARFILE) $(JAVA_PROPS) client.ServerFileDownloadV2Example
	java -cp $(JARFILE) $(JAVA_PROPS) client.COSFileUploadExample
clean:
	gradle clean $(GRADLE_PROPS)
	rm -fr .gradle
