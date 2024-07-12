import { HistoryStateManager } from "../device/history.manager";
import { BaseComponent } from "./base";

export interface AppActions {
    btnStart?: string;
    btnCenter?: string;
    btnEnd?: string;
    template?: string;
}

export abstract class App extends BaseComponent {
    public mainArea: HTMLElement;

    public btnStart?: HTMLButtonElement | undefined;
    public btnCenter?: HTMLButtonElement | undefined;
    public btnEnd?: HTMLButtonElement | undefined;

    constructor(
        protected history: HistoryStateManager,
        actions?: AppActions
    ) {
        super(actions?.template || 'appTemplate', document.body)

        this.component.classList.add('screen--app');
        this.mainArea = this.getElement('.mainArea');

        if (actions) {
            this.setupActionButton(actions.btnStart, 'start');
            this.setupActionButton(actions.btnCenter, 'center');
            this.setupActionButton(actions.btnEnd, 'end');
        } else {
            this.mainArea.classList.add('.noActions')
        }
        this.onLoad()
    }

    abstract render(data: any, option?: any): void;
    abstract update(operation: string, data: any, changedItem?: any): void;

    public listen<T>(eventName: string, callback: (data?: T) => void): void {
        this.addEventListener(eventName, (event) => {
            // @ts-ignore
            const data: T = event.detail.data
            callback(data)
        }, this.component, false)
    }

    private onLoad() {
        setTimeout(() => {
            try {
                const loading = this.getElement('.loadingScreen', document.body);
                loading.classList.add('remove')

                const transitionEndHandler = () => {
                    loading.removeEventListener('transitionend', transitionEndHandler);
                    loading.remove()
                };
                loading.addEventListener('transitionend', transitionEndHandler);
            } catch(error) {}
        }, 700)
    }

    protected setupActionButton(icon: string | undefined, position: 'start' | 'end' | 'center') {
        if (icon) {
            const button = this.createElement<HTMLButtonElement>('button', ['actionButton'], { type: 'button' })
            button.innerHTML = `<span class="material-symbols-outlined icon">${icon}</span>`;
            const target = this.getElement(`.actionButton.${position}`);
            this.replaceElement(target, button);
            if (position === 'start') this.btnStart = button;
            if (position === 'center') this.btnCenter = button;
            if (position === 'end') this.btnEnd = button;
        }
    }

    protected createScrollArea(classList: string[] = []): HTMLElement {
        const scrollContent = this.createElement('div', [ ...classList, 'scrollArea']);
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

    protected renderNoData(message: string) {
        const msgEl = this.createElement('div', ['noData']);
        msgEl.textContent = message;
        this.mainArea.appendChild(msgEl);
    }
}