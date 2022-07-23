import { WebImGui } from "./web-imgui-lib";

export const THEMES: Array<string> = ['light', 'dark', 'classic'];
export const DEFAULT_THEME: string = 'dark';

const MOVING_CLASS: string = 'web-imgui-window-moving';
const RESIZING_CLASS: string = 'web-imgui-window-resizing';

const TEMPLATE: string = `
    <div class="web-imgui-window">
        <div class="web-imgui-window-title-bar">
            <div class="web-imgui-window-title-bar-left">
                <i class="web-imgui-window-collapse-toggle fa-solid fa-caret-down"></i>
            </div>
            <div class="web-imgui-window-title-bar-title"></div>
            <div class="web-imgui-window-title-bar-right">
                <i class="web-imgui-window-close fa-solid fa-xmark"></i>
            </div>
        </div>
        <div class="web-imgui-window-body">
            <div class="web-imgui-window-content">
                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
            </div>
        </div>

        <div class="web-imgui-window-body-overlay"></div>

        <div class="web-imgui-window-resizer web-imgui-window-resize-w"></div>
        <div class="web-imgui-window-resizer web-imgui-window-resize-e"></div>
        <div class="web-imgui-window-resizer web-imgui-window-resize-s"></div>
        <div class="web-imgui-window-resizer web-imgui-window-resize-sw"></div>
        <div class="web-imgui-window-resizer web-imgui-window-resize-se"></div>
    </div>
`;

export class WebImGuiWindow {
    public webImGui: WebImGui;
    public element: HTMLElement;

    private titleBarElement: HTMLElement;
    private titleBarTitleElement: HTMLElement;
    private contentElement: HTMLElement;
    private closeElement: HTMLElement;

    private activeResizer: Element;

    // state
    private title: string;

    constructor(
        webImGui: WebImGui,
        theme: string = DEFAULT_THEME,
        title: string = '',
    ) {

        this.webImGui = webImGui;

        // templating
        const template: HTMLElement = document.createElement('div');

        template.innerHTML = TEMPLATE;
        this.element = template.querySelector('.web-imgui-window');

        // find elements
        this.titleBarElement = this.element.querySelector('.web-imgui-window-title-bar');
        this.titleBarTitleElement = this.element.querySelector('.web-imgui-window-title-bar-title');
        this.closeElement = this.element.querySelector('.web-imgui-window-close');
        this.contentElement = this.element.querySelector('.web-imgui-window-content');

        // set state
        this.setTheme(theme);
        this.setTitle(title);

        // setup mouse events
        this.setupMouseMove();
        this.setupMouseResize();
        this.setupRaise();
        this.setupClose();

        // append window to rootElement
        this.webImGui.rootElement.appendChild(this.element);
    };

    // setup ------------------------------------------------------------------
    setupRaise() {
        this.element.addEventListener('mousedown', event => {
            // skip if click was no left click
            if(event.which != 1) {
                return;
            };

            if(this._isActive()) {
                return;
            };

            this.raise();
            this.webImGui._saveState();
        });
    };

    setupClose() {
        this.closeElement.addEventListener('click', event => {
            // skip if click was no left click
            if(event.which != 1) {
                return;
            };

            event.preventDefault();

            this.close();
            this.webImGui._saveState();

            return false;
        });
    };

    setupMouseMove() {
        const handleMouseMove = (event: MouseEvent) => {
            event.preventDefault();

            this.element.classList.add(MOVING_CLASS);

            const clientRect = this.element.getClientRects()[0];

            this.element.style.left = (
                ((parseInt(this.element.style.left) || clientRect.left) +
                 event.movementX) + 'px'
            );

            this.element.style.top = (
                ((parseInt(this.element.style.top) || clientRect.top) +
                 event.movementY) + 'px'
            );
        };

        const handleMouseUp = (event: MouseEvent) => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);

            this.element.classList.remove(MOVING_CLASS);

            this.webImGui._saveState();
        };

        this.titleBarElement.addEventListener('mousedown', (event: MouseEvent) => {
            // skip if click was no left click
            if(event.which != 1) {
                return;
            };

            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        });
    };

    setupMouseResize() {
        const resizeStart = (event: MouseEvent) => {
            event.preventDefault();

            this.element.classList.add(RESIZING_CLASS);

            const clientRect = this.element.getClientRects()[0];

            // fint resizing direction
            let resizeLeft = false;
            let resizeRight = false;
            let resizeBottom = false;

            if(this.activeResizer.classList.contains('web-imgui-window-resize-w') ||
               this.activeResizer.classList.contains('web-imgui-window-resize-sw')) {

                resizeLeft = true;
            };

            if(this.activeResizer.classList.contains('web-imgui-window-resize-e') ||
               this.activeResizer.classList.contains('web-imgui-window-resize-se')) {

                resizeRight = true;
            };

            if(this.activeResizer.classList.contains('web-imgui-window-resize-s') ||
               this.activeResizer.classList.contains('web-imgui-window-resize-sw') ||
               this.activeResizer.classList.contains('web-imgui-window-resize-se')) {

                resizeBottom = true;
            };

            if(resizeLeft) {
                this.element.style.left = (
                    ((parseInt(this.element.style.left) || clientRect.left) +
                     event.movementX) + 'px'
                );

                this.element.style.width = (
                    ((parseInt(this.element.style.width) || clientRect.width) +
                     (event.movementX * -1)) + 'px'
                );
            };

            if(resizeRight) {
                this.element.style.width = (
                    ((parseInt(this.element.style.width) || clientRect.width) +
                     event.movementX) + 'px'
                );
            };

            if(resizeBottom) {
                this.element.style.height = (
                    ((parseInt(this.element.style.height) || clientRect.height) +
                     event.movementY) + 'px'
                );
            };
        };

        const resizeStop = () => {
            window.removeEventListener('mousemove', resizeStart);
            window.removeEventListener('mouseup', resizeStop);

            this.element.classList.remove(RESIZING_CLASS);

            this.webImGui._saveState();
        };

        const resizers = this.element.querySelectorAll('.web-imgui-window-resizer');

        resizers.forEach(resizer => {
            resizer.addEventListener('mousedown', (event: MouseEvent) => {
                // skip if click was no left click
                if(event.which != 1) {
                    return;
                };

                this.activeResizer = resizer;

                window.addEventListener('mousemove', resizeStart);
                window.addEventListener('mouseup', resizeStop);
            });
        });

    };

    // state ------------------------------------------------------------------
    setTheme(name: string) {
        if(!THEMES.includes(name)) {
            throw('invalid theme name');
        };

        this.element.classList.remove('web-imgui-theme-dark');
        this.element.classList.remove('web-imgui-theme-light');
        this.element.classList.remove('web-imgui-theme-classic');

        this.element.classList.add(`web-imgui-theme-${name}`);
    };

    // title
    setTitle(title: string) {
        this.title = title;
        this.titleBarTitleElement.innerHTML = title;
    };

    getTitle() {
        return this.title;
    };

    // position
    getPosition() {
        const rect = this.element.getBoundingClientRect();

        return [
            rect['x'],
            rect['y'],
            this.element.style.zIndex,
            rect['width'],
            rect['height'],
        ];
    };

    setPosition(
            x: number | undefined = undefined,
            y: number | undefined = undefined,
            z: number | undefined = undefined,
            width: number | undefined = undefined,
            height: number | undefined = undefined,
    ) {

        if(x != undefined) {
            this.element.style.left = `${x}px`;
        };

        if(y != undefined) {
            this.element.style.top = `${y}px`;
        };

        if(z != undefined) {
            this.element.style.zIndex = `${z}`;
        };

        if(width != undefined) {
            this.element.style.width = `${width}px`;
        };

        if(height != undefined) {
            this.element.style.height = `${height}px`;
        };
    };

    // action helper ----------------------------------------------------------
    _isActive(): boolean {
        return this.element.classList.contains('web-imgui-window-active');
    };

    _setActive(): void {
        this.element.classList.add('web-imgui-window-active');
    };

    _setInactive(): void {
        this.element.classList.remove('web-imgui-window-active');
    };

    // actions ----------------------------------------------------------------
    raise(): void {
        this.webImGui._raiseWindow(this);
        this.webImGui._saveState();
    };

    close(): void {
        this.webImGui._closeWindow(this);
    };
};
