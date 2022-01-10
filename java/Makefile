all::
include ../config.make
../config.make:
	@echo "Run make in upper folder to create config.make"
	@exit 1
all:: .compiled
	java -cp build/libs/javasamples-1.1-all.jar client.COSFileUploadExample
.compiled: build.gradle
	gradle build
	touch $@
clean:
	gradle clean
	rm -fr .gradle .compiled
	rm -f downloaded_file
