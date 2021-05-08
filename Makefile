install: install-deps

start:
	heroku local -f Procfile.dev

start-backend:
	npx nodemon --exec npx babel-node server/bin/run.js

start-frontend:
	npx webpack serve

install-deps:
	npm ci

build:
	npm run build

lint:
	npx eslint . --ext js,jsx

lint-fix:
	npx eslint . --fix --ext js,jsx

prettier:
	npx prettier . --write

publish:
	npm publish

deploy:
	git push heroku

check-prettier:
	bash check-prettier.sh

.PHONY: test