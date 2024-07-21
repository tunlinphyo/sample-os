import { BaseComponent } from "./base"

export interface PageActions {
    btnStart?: string;
    btnCenter?: string;
    btnEnd: boolean;
}

export abstract class Popup extends BaseComponent {
    public data: any|undefined;
    public mainArea: HTMLElement;

    public btnStart?: HTMLButtonElement | undefined;
    public btnCenter?: HTMLButtonElement | undefined;
    public btnEnd?: HTMLButtonElement | undefined;

    public isActive: boolean = false

    constructor(actions: PageActions, templateId?: string) {
        super(templateId || 'appTemplate');

        this.component.classList.add('screen--popup')
        this.mainArea = this.getElement('.mainArea')

        this.setupActionButton(actions.btnStart, 'start');
        this.setupActionButton(actions.btnCenter || 'close', 'center');
        if (actions.btnEnd) {
            this.setupActionButton('check', 'end');
        }

        this.closePage = this.closePage.bind(this)
    }

    abstract render(data: any): void;
    abstract update(data: any[] | any): void;

    public listen<T>(eventName: string, callback: (data?: T) => void): void {
        this.addEventListener(eventName, (event) => {
            // @ts-ignore
            const data: T = event.detail.data
            callback(data)
        }, this.component, false)
    }

    public openPage<T>(title?: string, data?: T[] | T, isCalendar?: boolean): Promise<T|boolean> {
        return new Promise((resolve) => {
            try {
                this.getElement('#device', document.body).appendChild(this.component)
            } catch(_) {
                document.body.appendChild(this.component)
            }
            this.addEventListener('click', async () => {
                this.closePage()
                resolve(false)
            }, this.btnCenter);

            if (this.btnEnd) {
                // this.removeBtnStart();
                this.addEventListener('click', async () => {
                    this.closePage()
                    resolve(this.data || true)
                }, this.btnEnd);
            }

            if (!isCalendar) this.mainArea.innerHTML = '';
            this.render(data);

            if (title) this.getElement('.statusBar-title').innerHTML = title;

            setTimeout(() => {
                this.component.classList.add('screen--show');
                this.dispatchCustomEvent('pageOpen');
                const transitionEndHandler = () => {
                    this.dispatchCustomEvent('pageOpenFinished');
                    this.isActive = true;
                    this.component.removeEventListener('transitionend', transitionEndHandler);
                };
                this.component.addEventListener('transitionend', transitionEndHandler);
            }, 0)
        })
    }

    public closePage() {
        this.component.classList.remove('screen--show');
        this.dispatchCustomEvent('pageClose');
        this.isActive = false;
        this.dispatchCustomEvent('pageCloseFinished');
        this.removeAllEventListeners();
    }

    protected setupActionButton(icon: string | undefined, position: 'start' | 'end' | 'center') {
        if (icon) {
            const button = this.createElement<HTMLButtonElement>('button', ['actionButton', position], { type: 'button' })
            button.innerHTML = `<span class="material-symbols-outlined icon">${icon}</span>`;
            const target = this.getElement(`.actionButton.${position}`);
            this.replaceElement(target, button);
            if (position === 'start') this.btnStart = button;
            if (position === 'center') this.btnCenter = button;
            if (position === 'end') this.btnEnd = button;
        }
    }

    protected removeBtnStart() {
        try {
            const target = this.getElement(`.actionButton.start`);
            if (target) target.remove();
        } catch(error) {}
    }

    protected createScrollArea(): HTMLElement {
        const scrollContent = this.createElement('div', ['scrollArea']);
        return scrollContent;
    }

    protected createFlexCenter(): HTMLElement {
        const flexCenter = this.createElement('div', ['flexCenter']);
        return flexCenter;
    }

    protected createList(classNames: string[] = []) {
        return this.createElement('div', [...classNames, 'scrollList'])
    }
}