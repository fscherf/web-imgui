import { WebImGuiWindow, DEFAULT_THEME } from './window.js';
import { getCookie, setCookie } from './cookies.js';

const DEFAULT_ROOT_ELEMENT_SELECTOR: string = 'body';


export class WebImGui {
    public theme: string;
    public rootElement: HTMLElement;
    public wigWindows: Array<WebImGuiWindow>;

    constructor() {
        this.wigWindows = [];

        this.setTheme(DEFAULT_THEME);
        this.setRootElement(DEFAULT_ROOT_ELEMENT_SELECTOR);
    };

    // windows ----------------------------------------------------------------
    _getWindowsSortedByZIndex(): Array<WebImGuiWindow> {
        return this.wigWindows.sort(
            (a: WebImGuiWindow, b: WebImGuiWindow) => {
                if(a.element.style.zIndex < b.element.style.zIndex) {
                    return -1;
                };

                if(a.element.style.zIndex > b.element.style.zIndex) {
                    return 1;
                };

                return 0;
            }
        );
    };

    _getWindowWithHighestZIndex(): WebImGuiWindow {
        const wigWindows = this._getWindowsSortedByZIndex();

        return wigWindows[wigWindows.length-1];
    };

    _placeWindowInitially(wigWindow: WebImGuiWindow) {
        const findPosition = () => {
            let x: number = 10;
            let y: number = 10;

            while(true) {
                let positionFound = true;

                for(let i=0; i<this.wigWindows.length; i++) {
                    let wigWindow = this.wigWindows[i];
                    let wigWindowPosition = wigWindow.getPosition();

                    if(wigWindowPosition[0] == x ||
                       wigWindowPosition[1] == y) {

                        positionFound = false;
                        x += 20;
                        y += 25;

                        break;
                    };

                };

                if(positionFound) {
                    return [x, y];
                };
            };
        };

        const position = findPosition();

        wigWindow.setPosition(...position)
        this._raiseWindow(wigWindow);
    };

    _raiseWindow(wigWindow: WebImGuiWindow) {
        const wigWindows = this._getWindowsSortedByZIndex();

        wigWindows.forEach((_wigWindow: WebImGuiWindow, index: number) => {
            if(_wigWindow == wigWindow) {
                _wigWindow.setPosition(
                    undefined,
                    undefined,
                    wigWindows.length,
                );

                _wigWindow._setActive();

            } else {
                _wigWindow.setPosition(
                    undefined,
                    undefined,
                    index,
                );

                _wigWindow._setInactive();
            };
        });
    };

    _closeWindow(wigWindow: WebImGuiWindow) {
        // remove HTML element
        wigWindow.element.remove();

        // remove window from internal state
        this.wigWindows = this.wigWindows.filter(_wigWindow => {
            return _wigWindow != wigWindow;
        });

        // raise window with the highest z-index
        this._raiseWindow(this._getWindowWithHighestZIndex());
    };

    // state ------------------------------------------------------------------
    _getEmptyStateObject(): object {
        return {
            windows: {},
        };
    };

    _getState(): object {
        const state = this._getEmptyStateObject();

        this.wigWindows.forEach(wigWindow => {
            state['windows'][wigWindow.getTitle()] = wigWindow.getPosition();
        });

        return state;
    };

    _saveState(): void {
        console.debug('saving state');

        const state: string = JSON.stringify(this._getState());

        setCookie('WebImGui', state, 100);
    };

    _resetState(): void {
        console.debug('resetting state');

        const state: string = JSON.stringify(this._getEmptyStateObject());

        setCookie('WebImGui', state, 100);
    };

    _loadState(): object {
        console.debug('loading state');

        const cookie: string = getCookie('WebImGui');

        if(cookie == '') {
            return this._getState();
        };

        return JSON.parse(cookie);
    };

    // public API -------------------------------------------------------------
    setRootElement(selector: string) {
        this.rootElement = document.querySelector(selector);
    };

    setTheme(name: string) {
        this.theme = name;

        this.wigWindows.forEach(wigWindow => {
            wigWindow.setTheme(name);
        });
    };

    getWindow(title: string): WebImGuiWindow {
        // get state
        const state = this._loadState();

        // search for previous window
        for(let i=0; i<this.wigWindows.length; i++) {
            if(this.wigWindows[i].getTitle() == title) {
                return this.wigWindows[i];
            };
        };

        // create new window
        const wigWindow = new WebImGuiWindow(
            this,
            this.theme,
            title,
        );

        this.wigWindows.push(wigWindow);

        // place window
        if(title in state['windows']) {
            const position = state['windows'][title];

            wigWindow.setPosition(...position);

        } else {
            this._placeWindowInitially(wigWindow);

        };
    };

    reset(): void {

        // clear cookie
        this._resetState();

        // place windows
        let x: number = 10;
        let y: number = 10;

        this._getWindowsSortedByZIndex().forEach((wigWindow, index) => {
            let position = [x, y, index, 500, 300];

            wigWindow.setPosition(...position);

            x += 20;
            y += 25;
        });
    };
};
