import { BaseComponent } from "../base"

export interface PageActions {
    btnStart?: string;
    btnCenter?: string;
    btnEnd: boolean;
}

export class AppLoading extends BaseComponent {
    public data: any|undefined;
    public mainArea: HTMLElement;

    constructor(private iframeEl: HTMLIFrameElement) {
        super('appTemplate');

        this.component.classList.add('screen--popup');
        this.mainArea = this.getElement('.mainArea');

        this.closePage = this.closePage.bind(this);
        this.updateMessage = this.updateMessage.bind(this);
    }

    private render(message: string) {
        const flexCenter = this.createFlexCenter();

        const messageEl = this.createElement('div', ['loading-message']);
        messageEl.innerHTML = message;
        flexCenter.appendChild(messageEl);

        this.mainArea.appendChild(flexCenter);

        this.component.classList.add('screen--show');
        this.dispatchCustomEvent('pageOpen');
        const transitionEndHandler = () => {
            this.dispatchCustomEvent('pageOpenFinished');
            this.component.removeEventListener('transitionend', transitionEndHandler);
        };
        this.component.addEventListener('transitionend', transitionEndHandler);
    }

    public openPage(title: string, message: string): Promise<[() => void, (message: string) => void]> {
        return new Promise(resolve => {
            if (!this.iframeEl.contentDocument) return resolve([this.closePage, this.updateMessage]);
            this.iframeEl.contentDocument.body.appendChild(this.component);
            
            this.getElement('.statusBar-title').innerHTML = title;
            this.render(message);
    
            setTimeout(() => {
                resolve([this.closePage, this.updateMessage]);
            }, 1000);
        });

    }

    private updateMessage(message: string): Promise<boolean> {
        return new Promise(resolve => {
            const messageEl = this.getElement('.loading-message');
            console.log('MESSAGE_EL', messageEl);
            if (messageEl) messageEl.innerHTML = message;

            setTimeout(() => {
                resolve(true);
            }, 1000);
        })
    }

    private closePage() {
        this.component.classList.remove('screen--show');
        this.dispatchCustomEvent('pageClose');
        this.dispatchCustomEvent('pageCloseFinished');
        this.removeAllEventListeners();
    }

    protected createFlexCenter(): HTMLElement {
        const flexCenter = this.createElement('div', ['flexCenter']);
        return flexCenter;
    }
}