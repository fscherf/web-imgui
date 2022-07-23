import { WebImGui } from "./web-imgui-lib.js";


window.addEventListener('load', () => {
    window['webImGui'] = new WebImGui();
});
