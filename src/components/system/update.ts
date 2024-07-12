import { BaseComponent } from "../base";


export class SystemUpdate extends BaseComponent {
    public mainArea: HTMLElement;
    private parentEl: HTMLElement;

    constructor() {
        super('appTemplate');

        this.component.classList.add('screen--system');
        this.mainArea = this.getElement('.mainArea');
        this.parentEl = this.getElement('#device', document.body);

        this.render();
    }

    private render() {
        const flexCenter = this.createElement('div', ['flexCenter']);
        const titleEl = this.getElement('.statusBar-title');
        titleEl.textContent = 'Updating..';

        const loadingEl = this.createElement('div', ['systemLoader']);
        flexCenter.appendChild(loadingEl);

        this.mainArea.appendChild(flexCenter);
    }

    public openPage() {
        this.parentEl.appendChild(this.component);
        this.component.classList.add('screen--show');
        this.dispatchCustomEvent('pageOpen');
        const transitionEndHandler = () => {
            this.dispatchCustomEvent('pageOpenFinished');
            this.component.removeEventListener('transitionend', transitionEndHandler);
        };
        this.component.addEventListener('transitionend', transitionEndHandler);
    }

    public closePage() {
        this.component.classList.remove('screen--show');
        this.dispatchCustomEvent('pageClose');
        this.dispatchCustomEvent('pageCloseFinished');
        this.removeAllEventListeners();
        this.component.remove();
    }

}