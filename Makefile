SRC=src
TMP=tmp
LIB=lib

all: lib/faspmanager
	mkdir -p $(TMP)
	date > $(TMP)/This_is_a_test.txt
	$(SRC)/server.py
	$(SRC)/faspex.py $(TMP)/This_is_a_test.txt
	$(SRC)/node.py $(TMP)/This_is_a_test.txt
	$(SRC)/cos.py $(TMP)/This_is_a_test.txt
	$(SRC)/aoc.py $(TMP)/This_is_a_test.txt

clean:
	rm -fr $(TMP) $(LIB)
	find . -name __pycache__|xargs rm -fr

faspmanager: lib/faspmanager

lib/faspmanager:
	mkdir -p $(LIB)
	curl -s http://download.asperasoft.com/download/sw/sdk/faspmanager/python/faspmanager-sdk-python-3.7.2-d787953b521f059412ad1713afaa38ccbb760a47.zip -o $(LIB)/faspmanager-sdk-python-3.7.2.zip
	cd $(LIB) && unzip faspmanager-sdk-python-3.7.2.zip

doc:
	sed 's/:.*/:/' < config.yaml > config.tmpl
