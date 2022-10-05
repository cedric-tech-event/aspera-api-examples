# old way to get SDK:
#	curl -o current_sdk.zip https://developer.ibm.com/caas-storage/skillscollection/apie-next/dev/API--aspera--http-gateway-api/en/_attachments/ibm-aspera-httpgateway-sdk-6.1.2-f1c6b4d.zip
#	unzip current_sdk.zip 'dist/*'
#	mv dist/js/http-gateway.* .
#	rm -fr dist current_sdk.zip

# Set to 1 to validate cert, and to 0 to ignore cert
NODE_TLS_REJECT_UNAUTHORIZED=0
export NODE_TLS_REJECT_UNAUTHORIZED
all::
dist/http-gateway.js:
	mkdir -p dist
	npm --prefix dist install --save @ibm-aspera/http-gateway-sdk-js
	mv dist/node_modules/@ibm-aspera/http-gateway-sdk-js/js/http-gateway.js* dist
	rm -fr dist/node_modules dist/package*.json
node_modules:
	npm install
conf.js: ../config.yaml node_modules
	node convert.js ../config.yaml > $@
all:: node_modules dist/http-gateway.js conf.js
	npm start
clean:
	rm -f package-lock.json conf.js
	rm -f aspera-httpgw-example.zip
	rm -fr dist node_modules
zip:
	zip aspera-httpgw-example.zip $$(git ls-files)
