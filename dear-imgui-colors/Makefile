all: dear-imgui-colors.scss

clean:
	rm imgui_draw.cpp imgui-upstream-colors.scss

imgui_draw.cpp:
	wget https://raw.githubusercontent.com/ocornut/imgui/24dfe6db8ac2ffefce8cf02a6b585a05ebfcbe0a/imgui_draw.cpp

dear-imgui-colors.scss: convert-colors.py imgui_draw.cpp
	python3 convert-colors.py imgui_draw.cpp > dear-imgui-colors.scss
