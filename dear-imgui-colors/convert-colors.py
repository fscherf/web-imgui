import sys
import re

COLOR_RE = re.compile(r'\s+colors\[ImGuiCol_(?P<name>[^\]]+)\]\s+= ImVec4\((?P<red>[0-9\.]+)f, (?P<green>[0-9\.]+)f, (?P<blue>[0-9\.]+)f, (?P<alpha>[0-9\.]+)f')
NAME_PADDING = 40

THEMES = {
    'dark': (194, 247),
    'classic': (254, 307),
    'light': (315, 368),
}


def ImVec4_to_8bit_int(vec: str):
    return float(vec) / (1.0 / 256)


def get_theme_name(line_number):
    for name, (start, stop) in THEMES.items():
        if line_number >= start and line_number < stop:
            return name


text = open(sys.argv[1], 'r').read()
last_theme = ''

for line_number, line in enumerate(text.splitlines()):

    # find theme
    theme = get_theme_name(line_number)

    if not theme:
        continue

    if theme != last_theme:
        if last_theme:
            print()

        print(f'// theme: {theme}')

        last_theme = theme

    # parse line
    match = COLOR_RE.search(line)

    if not match:
        print(f'// {line}')

        continue

    groups = match.groupdict()

    # generate variables
    name = groups['name']
    red = ImVec4_to_8bit_int(groups['red'])
    green = ImVec4_to_8bit_int(groups['green'])
    blue = ImVec4_to_8bit_int(groups['blue'])
    alpha = groups['alpha']

    full_name = f'web-imgui-{theme}-{name}:'.ljust(NAME_PADDING)

    # render scss line
    print(f'${full_name} rgba({red}, {green}, {blue}, {alpha});')
