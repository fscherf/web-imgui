const THEMES: Array<string> = ['light', 'dark', 'classic'];
const DEFAULT_THEME: string = 'dark';

const MOVING_CLASS: string = 'web-imgui-window-moving';
const RESIZING_CLASS: string = 'web-imgui-window-resizing';

const TEMPLATE: string = `
    <div class="web-imgui-window web-imgui-window-active web-imgui-theme-dark">
        <div class="web-imgui-window-title-bar">
            <div class="web-imgui-window-title-bar-left">
                <i class="web-imgui-window-collapse-toggle fa-solid fa-caret-down"></i>
            </div>
            <div class="web-imgui-window-title-bar-title">Lorem Ipsum</div>
            <div class="web-imgui-window-title-bar-right">
                <i class="fa-solid fa-xmark"></i>
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
    public rootElement: HTMLElement;
    public element: HTMLElement;

    private titleBarElement: HTMLElement;
    private bodyElement: HTMLElement;
    private contentElement: HTMLElement;

    private activeResizer: Element;

    constructor(
        rootElement: HTMLElement,
        theme: String = DEFAULT_THEME,
    ) {

        this.rootElement = rootElement;

        // templating
        const template: HTMLElement = document.createElement('div');

        template.innerHTML = TEMPLATE;
        this.element = template.querySelector('.web-imgui-window');

        // find elements
        this.titleBarElement = this.element.querySelector('.web-imgui-window-title-bar');
        this.bodyElement = this.element.querySelector('.web-imgui-window-body');
        this.contentElement = this.element.querySelector('.web-imgui-window-content');

        // setup mouse events
        this.setupMouseMove();
        this.setupMouseResize();

        // append window to rootElement
        this.rootElement.appendChild(this.element);
    };

    // mouse events
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

    // elements
    getContentElement(): HTMLElement {
        return this.contentElement;
    };

    setTheme(name: string) {
    };
};
