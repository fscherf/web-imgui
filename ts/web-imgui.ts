import { WebImGuiWindow } from "./window.js";

export class WebImGui {
    window: WebImGuiWindow;

    constructor() {
        console.log('hello');

        this.window = new WebImGuiWindow();
    };
};