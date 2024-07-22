import { Popup } from "../popup";

export interface ChooseItem {
    label: string;
    value: string;
    icon?: string;
}

export interface ChooseData {
    list: ChooseItem[];
    selected: string[];
}

export class ChooseList extends Popup {
    private chooseList: HTMLElement | undefined;

    constructor() {
        super({ btnEnd: true })
    }

    render(data: ChooseData) {
        const list = data.list;
        this.data = data.selected;

        const scrollArea = this.createScrollArea();
        this.chooseList = this.createElement('div', ['chooseList']);

        for(const item of list) {
            const isSelected = this.data.includes(item.value)
            const chooseItem = this.createElement('button', ['chooseItem'], { 'data-selected': isSelected.toString() });
            // if (item.icon) {
            //     const iconEl = this.createElement('span', ['material-symbols-outlined']);
            //     iconEl.textContent = item.icon;
            //     chooseItem.appendChild(iconEl);
            // }
            const nameEl = this.createElement('div', ['selectName']);
            nameEl.textContent = item.label;
            const toggleEl = this.createElement('span', ['material-symbols-outlined', 'icon', 'selectIcon']);
            toggleEl.textContent = 'check';

            this.addEventListener('click', () => {
                const selected = chooseItem.dataset.selected;
                if (selected === 'false') {
                    chooseItem.dataset.selected = 'true';
                    this.data.push(item.value);
                } else {
                    chooseItem.dataset.selected = 'false';
                    this.data = this.data.filter((d: string) => d !== item.value);
                }
            }, chooseItem)

            chooseItem.appendChild(nameEl);
            chooseItem.appendChild(toggleEl);

            this.chooseList.appendChild(chooseItem);
        }

        scrollArea.appendChild(this.chooseList)
        this.mainArea.appendChild(scrollArea)
    }

    update(data: ChooseData): void {
        // console.log(data)
        if (this.chooseList) this.chooseList.innerHTML = '';

        this.render(data)
    }
}
