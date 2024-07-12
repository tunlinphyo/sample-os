import { BaseComponent } from "./base"

export interface SelectItem {
    title: string;
    value: string;
    icon?: string;
}


export class SelectList extends BaseComponent {
    public selectList: HTMLElement

    public btnCenter?: HTMLButtonElement | undefined;

    constructor() {
        super('appTemplate');

        this.component.classList.add('screen--popup')
        this.selectList = this.createBody()
        this.setupActionButton('close', 'center');

        this.closePage = this.closePage.bind(this)
    }

    private createBody() {
        const mainArea = this.getElement('.mainArea')
        const scrollArea = this.createScrollArea()
        const selectList = this.createElement('div', ['selectList'])

        scrollArea.appendChild(selectList)
        mainArea.appendChild(scrollArea)

        return selectList
    }

    private render(list: SelectItem[], callback: (value: string) => void) {
        list.forEach(item => {
            const selectItem = this.createElement('button', ['selectItem', item.icon ? 'withIcon' : 'noIcon'], { type: 'button' })
            if (item.icon) {
                selectItem.innerHTML = `<span class="material-symbols-outlined">${item.icon}</span> ${item.title}`
            } else {
                selectItem.innerHTML = `${item.title}`
            }

            this.addEventListener('click', () => {
                callback(item.value)
            }, selectItem)

            this.selectList.appendChild(selectItem)
        })
    }

    public openPage(title: string, list: SelectItem[], className?: string): Promise<string | null> {
        return new Promise((resolve) => {
            this.getElement('#device', document.body).appendChild(this.component)
            this.selectList.innerHTML = '';

            if (className) {
                this.selectList.classList.add(className);
            } else {
                this.selectList.className = 'selectList';
            }

            this.addEventListener('click', async () => {
                resolve(null)
                this.closePage()
            }, this.btnCenter);

            this.render(list, async (value) => {
                resolve(value)
                this.closePage()
            })

            if (title) this.getElement('.statusBar-title').innerHTML = title;

            setTimeout(() => {
                this.component.classList.add('screen--show');
                this.dispatchCustomEvent('pageOpen');
                const transitionEndHandler = () => {
                    this.dispatchCustomEvent('pageOpenFinished');
                    this.component.removeEventListener('transitionend', transitionEndHandler);
                };
                this.component.addEventListener('transitionend', transitionEndHandler);
            }, 0)
        })
    }

    public closePage() {
        this.component.classList.remove('screen--show');
        this.dispatchCustomEvent('pageClose');
        this.dispatchCustomEvent('pageCloseFinished');
        this.removeAllEventListeners();
    }

    protected createScrollArea(): HTMLElement {
        const scrollContent = this.createElement('div', ['scrollArea']);
        return scrollContent;
    }

    protected setupActionButton(icon: string | undefined, position: 'start' | 'end' | 'center') {
        if (icon) {
            const button = this.createElement<HTMLButtonElement>('button', ['actionButton'], { type: 'button' })
            button.innerHTML = `<span class="material-symbols-outlined icon">${icon}</span>`;
            const target = this.getElement(`.actionButton.${position}`);
            this.replaceElement(target, button);
            if (position === 'center') this.btnCenter = button;
        }
    }

}
