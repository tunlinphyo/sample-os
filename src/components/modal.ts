import { HistoryStateManager } from "../device/history.manager";
import { BaseComponent } from "./base"

export interface PageActions {
    btnStart?: string;
    btnCenter?: string;
    btnEnd?: string;
    template?: string;
}

export abstract class Modal extends BaseComponent {
    public mainArea: HTMLElement;

    public btnStart?: HTMLButtonElement | undefined;
    public btnCenter?: HTMLButtonElement | undefined;
    public btnEnd?: HTMLButtonElement | undefined;

    public isActive: boolean = false

    constructor(
        protected history: HistoryStateManager,
        actions: PageActions
    ) {
        super(actions?.template || 'appTemplate', document.body);

        this.component.classList.add('screen--modal')
        this.mainArea = this.getElement('.mainArea')

        this.setupActionButton(actions.btnStart, 'start');
        this.setupActionButton('close', 'center');
        this.setupActionButton(actions.btnEnd, 'end');

        this.closePage = this.closePage.bind(this)
    }

    abstract render(data: any): void;
    abstract update(operation: string, data: any[] | any, changedItem?: any): void;

    public listen<Contact>(eventName: string, callback: (data?: Contact) => void): void {
        this.addEventListener(eventName, (event) => {
            // @ts-ignore
            const data: Contact = event.detail.data
            callback(data)
        }, this.component, false)
    }

    public openPage<T>(title?: string, data?: T[] | T) {
        this.addEventListener('click', this.closePage, this.btnCenter, false);
        this.mainArea.innerHTML = ''
        this.render(data)

        if (title) this.getElement('.statusBar-title').innerHTML = title;
        this.component.classList.add('screen--show');

        this.dispatchCustomEvent('pageOpen');
        const transitionEndHandler = () => {
            this.dispatchCustomEvent('pageOpenFinished');
            this.isActive = true;
            this.component.removeEventListener('transitionend', transitionEndHandler);
        };
        this.component.addEventListener('transitionend', transitionEndHandler);
    }

    public closePage() {
        this.history.goBack();
        this.component.classList.remove('screen--show');
        this.dispatchCustomEvent('pageClose');

        const transitionEndHandler = () => {
            this.component.removeEventListener('transitionend', transitionEndHandler);
            this.dispatchCustomEvent('pageCloseFinished');
            this.isActive = false;
            this.removeAllEventListeners();
        };
        this.component.addEventListener('transitionend', transitionEndHandler);
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

    protected createGroup(title: string, classNames: string[] = [], boldTitle: boolean = false) {
        const groupEl = this.createElement('div', [...classNames, 'group'])
        const titleEl = this.createElement('div', ['groupTitle'])
        if (boldTitle) titleEl.classList.add('bold')
        titleEl.innerText = title
        groupEl.appendChild(titleEl)

        return groupEl
    }

    protected createGroupItem(html: string, dataId: string, classNames: string[] = []) {
        const itemEl = this.createElement('button', [...classNames, 'groupItem'], { type: 'button', 'data-id': dataId })
        itemEl.innerHTML = html
        return itemEl
    }

    protected renderNoData(message: string, parentEl?: HTMLElement) {
        const msgEl = this.createElement('div', ['noData']);
        msgEl.textContent = message;
        if (parentEl) parentEl.appendChild(msgEl);
        else this.mainArea.appendChild(msgEl);
    }
}