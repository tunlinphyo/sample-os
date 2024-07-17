import { Page } from "../../../components/page";
import { SettingsController } from "../../../controllers/settings.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { HomeApp, Setting } from "../../../stores/settings.store";
import { SortableList } from "../../../utils/sortable";

interface SortData {
    id: string;
    order: number;
    isShow: boolean;
}

export class ApplicationsPage extends Page {
    private appList: HTMLUListElement | undefined;
    private item: Setting | undefined;
    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private setting: SettingsController
    ) {
        super(history, {}); // btnEnd: 'check'
        this.init();
    }

    private init() {
        // this.addEventListener('click', () => {
        //     if (!this.item) return;
        //     const data = this.getDataFormList(this.appList);
        //     this.item.data = this.updateApps(data);
        //     this.setting.updateApps(this.item);
        //     this.closePage();
        // }, this.btnEnd, false);

        this.listen('pageClose', () => {
            if (!this.item) return;
            const data = this.getDataFormList(this.appList);
            this.item.data = this.updateApps(data);
            this.setting.updateApps(this.item);
        });

        this.device.addEventListener('closeApp', () => {
            if (!this.item) return;
            const data = this.getDataFormList(this.appList);
            this.item.data = this.updateApps(data);
            this.setting.updateApps(this.item);
        });
    }

    render(item: Setting) {
        this.item = item;
        const scrollArea = this.createScrollArea();

        this.appList = this.createElement<HTMLUListElement>('ul', ['appList'], { id: 'sortable-list' });
        for(const app of this.orderApps(item.data)) {
            const appEl = this.createElement<HTMLLIElement>('li', ['appItem'], {
                'data-id': app.id,
                // draggable: 'true',
                'data-toggle':  app.isShow ? 'on' : 'off',
            });

            //<span class="material-symbols-outlined">drag_handle</span>
            const iconEl = this.createElement('span', ['material-symbols-outlined', 'grab']);
            iconEl.textContent = 'drag_handle';
            appEl.appendChild(iconEl);

            const appName = this.createElement('div', ['appName']);
            appName.textContent = app.name;
            appEl.appendChild(appName);

            if (!app.isSystem) {
                const toggleButton = this.createElement<HTMLButtonElement>('button', ['toggleButton'], {
                    type: 'button',
                    'data-toggle':  app.isShow ? 'on' : 'off',
                });
                this.addEventListener('click', (event) => {
                    const elem = event.target as HTMLButtonElement;
                    const toggle = elem.dataset.toggle;
                    const status = toggle === 'on' ? 'off' : 'on'
                    elem.dataset.toggle = status;
                    // console.log("CLICK", elem);
                    if (elem.parentElement) {
                        elem.parentElement.dataset.toggle = status;
                    }
                }, toggleButton);
                appEl.appendChild(toggleButton);
            }

            this.appList.appendChild(appEl);
        }

        scrollArea.appendChild(this.appList);
        this.mainArea.appendChild(scrollArea);

        new SortableList('sortable-list');
    }

    update(_: string, item: Setting) {
        this.removeAllEventListeners();
        this.mainArea.innerHTML = "";
        this.render(item);
    }

    private orderApps(list: HomeApp[]) {
        return list.sort((a, b) => a.order - b.order);
    }

    private updateApps(list: SortData[]): HomeApp[] {
        return (this.item?.data || []).map((item: HomeApp) => {
            const sort = list.find(i => i.id === item.id);
            if (sort) {
                return { ...item, ...sort };
            } else {
                return item;
            }
        })
    }

    private getDataFormList(listEl?: HTMLUListElement): SortData[] {
        if (!listEl) return [];
        const list: SortData[] = [];
        Array.from(listEl.children).forEach((itemEl) => {
            const elem = itemEl as HTMLLIElement;
            const [id, order, toggle] = [elem.dataset.id, elem.dataset.index, elem.dataset.toggle];

            list.push({
                id: id || '',
                order: order ? parseInt(order) : 0,
                isShow: toggle === 'on' ? true : false
            })
        })
        return list
    }
}