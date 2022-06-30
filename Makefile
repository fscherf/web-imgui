.PHONY: clean

all: \
	dist/css/web-imgui.css \
	dist/js/web-imgui.js

clean:
	rm -rf \
		dist \
		packages \
		.sass-cache

distclean:
	rm -rf node_modules

node_modules: package.json
	npm install

# dist ########################################################################
dist: | node_modules
	# setup dist directory
	mkdir -p dist
	mkdir -p dist/fonts
	mkdir -p dist/css
	mkdir -p dist/js

	# copy fonts
	cp -r fonts/* dist/fonts
	cp -r node_modules/@fortawesome/fontawesome-free/webfonts/* dist/fonts

# css
dist/css/web-imgui.css: src/scss/*.scss | dist node_modules
	# build css
	npx sass \
		src/scss/web-imgui.scss dist/css/web-imgui.css \
		--load-path=node_modules \
		--embed-sources

# js
dist/js/web-imgui.js: src/ts/*.ts src/ts/tsconfig.json | dist node_modules
	# build js
	npx tsc -p src/ts/tsconfig.json

# release package #############################################################
package: all
	mkdir -p packages
	mv `npm pack` packages

# dev tools ###################################################################
http-server:
	npx http-server examples -c-1 $(args)
