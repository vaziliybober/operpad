install: install-deps

start:
	heroku local -f Procfile.dev

start-backend:
	npx nodemon --exec npx babel-node server/bin/slack.js

start-frontend:
	npx webpack serve

install-deps:
	npm ci

build:
	npm run build

test:
	npm test -s

ftest:
	npm run ftest -s

test-coverage:
	npm test -- --coverage --coverageProvider=v8

lint:
	npx eslint . --ext js,jsx

lint-fix:
	npx eslint . --fix --ext js

prettier:
	npx prettier . --write

publish:
	npm publish

deploy:
	git push heroku

check-prettier:
	bash check-prettier.sh

.PHONY: test