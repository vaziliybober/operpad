install:
	npm install

run:
	node bin/run.js

test:
	npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8

lint:
	npx eslint .

prettier:
	npx prettier . --write

check-prettier:
	bash check-prettier.sh

lint-fix:
	npx eslint . --fix --ext js

publish:
	npm publish --dry-run

link: 
	sudo npm link

publish:
	npm publish

.PHONY: test