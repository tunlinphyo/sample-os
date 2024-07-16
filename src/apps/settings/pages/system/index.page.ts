import { Page } from "../../../../components/page";
import { HistoryStateManager } from "../../../../device/history.manager";
import { Setting } from "../../../../stores/settings.store";

export interface System {
    id: string;
    title: string;
}

export class SystemPage extends Page {
    constructor(
        history: HistoryStateManager,
    ) {
        super(history, {});
    }

    render(data: Setting) {
        const list: (System & any)[] = data.data;

        this.createSettingList(list);
    }

    update() {

    }

    private createSettingList(list: (System & any)[]) {
        const listEl = this.createElement('ul', ['settingList']);

        for(const item of list) {
            const itemEl = this.createItem(item);
            listEl.appendChild(itemEl);
        }

        this.mainArea.appendChild(listEl);
    }

    private createItem(item: (System & any)) {
        const itemEl = this.createElement('li', ['settingItem'], { id: item.id });

        const itemMainButton = this.createElement('button', ['itemSystem']);
        itemMainButton.innerHTML = `
            ${item.title}
            <span class="material-symbols-outlined icon--ssm">arrow_forward_ios</span>
        `;
        itemEl.appendChild(itemMainButton);
        this.addEventListener('click', () => {
            this.history.pushState('/system/update', item)
        }, itemMainButton);

        return itemEl;
    }

}
