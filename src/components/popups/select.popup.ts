import { Popup } from "../popup";
import { ScrollBar } from "../scroll-bar";

export interface SelectItem {
    title: string;
    value: string;
    icon?: string;
}

export class SelectPopup extends Popup {
    public selectList?: HTMLElement;
    private scrollBar?: ScrollBar;

    constructor(iframeEl: HTMLIFrameElement) {
        super(iframeEl, { btnEnd: false }, 'actionTemplate');
    }

    render(list: SelectItem[], className?: string) {
        this.selectList = this.createBody();
        if (className) this.selectList.classList.add(className);
        return new Promise(resolve => {
            list.forEach(item => {
                const selectItem = this.createElement('button', ['selectItem', item.icon ? 'withIcon' : 'noIcon'], { type: 'button' });
                if (item.icon) {
                    selectItem.innerHTML = `<span class="material-symbols-outlined">${item.icon}</span> ${item.title}`
                } else {
                    selectItem.innerHTML = `${item.title}`
                }

                this.addEventListener('click', () => {
                    resolve(item.value);
                }, selectItem);

                this.selectList?.appendChild(selectItem)
            });
            this.scrollBar?.reCalculate();
        });
    }

    private createBody() {
        const mainArea = this.getElement('.mainArea')
        const scrollArea = this.createScrollArea()
        const selectList = this.createElement('div', ['selectList'])

        scrollArea.appendChild(selectList)
        mainArea.appendChild(scrollArea)

        this.scrollBar = new ScrollBar(this.component);
        return selectList
    }
}
