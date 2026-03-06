PHONY: dev
	docker build -t 0yukali0/node:dev .
	docker run -it -p 22:22 -v .:/app 0yukali0/node:dev sh