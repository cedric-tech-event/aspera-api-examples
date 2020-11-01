all:
	date > This_is_a_test.txt
	./examples/server.py
	./examples/faspex.py This_is_a_test.txt
	./examples/node.py This_is_a_test.txt
	./examples/cos.py This_is_a_test.txt
clean:
	rm -fr This_is_a_test.txt 200KB.1
