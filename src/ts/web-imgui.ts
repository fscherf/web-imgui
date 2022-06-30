import { WebImGuiWindow } from "./window.js";

export class WebImGui {
    public rootElement: HTMLElement;
    public windows: Array<WebImGuiWindow>;

    constructor(rootElement: HTMLElement) {
        this.rootElement = rootElement;
        this.windows = [];
    };

    createWindow(): WebImGuiWindow {
        const _window = new WebImGuiWindow(
            this.rootElement,
            'dark',
        );

        this.windows.push(_window);

        return _window;
    };
};
