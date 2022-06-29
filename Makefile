.PHONY: clean

all: web-imgui/css/web-imgui.css \
	 web-imgui/js/web-imgui.js \
	 web-imgui/build-information.json

clean:
	rm -rf \
		web-imgui \
		packages \
		.sass-cache \
		scss/*.css \
		scss/*.map \
		ts/*.js \
		ts/*.map

# web-imgui ###################################################################
web-imgui:
	mkdir web-imgui
	mkdir web-imgui/js
	mkdir web-imgui/css
	ln -s ts web-imgui/ts

web-imgui/css/web-imgui.css: scss/*.scss | web-imgui
	scss scss/web-imgui.scss scss/web-imgui.css
	rm -rf web-imgui/css
	cp -r scss web-imgui/css

web-imgui/js/web-imgui.js: ts/*.ts | web-imgui
	tsc
	rm -rf web-imgui/js
	cp -r ts web-imgui/js

web-imgui/build-information.json: | web-imgui
	bin/build-information > web-imgui/build-information.json

# release package #############################################################
package: all
	mkdir -p packages
	mv `npm pack` packages

# dev tools ###################################################################
server:
	python3 -m http.server --directory=examples
