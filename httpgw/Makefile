# run make to start server
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
