import { Page } from "../../../components/page";
import { ScrollBar } from "../../../components/scroll-bar";
import { SettingsController } from "../../../controllers/settings.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Setting, StoreInfo } from "../../../stores/settings.store";
import { IndexedDBUsage } from "../helpers/db-usage";

export class StoragePage extends Page {
    private scrollBar?: ScrollBar;
    private storage: IndexedDBUsage;
    private item: Setting | undefined;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private setting: SettingsController,
    ) {
        super(history, {});
        this.component.classList.add('fullBottom');
        this.storage = new IndexedDBUsage();
        // this.storage.getUsage();
        this.addListeners();
    }

    private addListeners() {
        this.listen<StoreInfo>('deleteStoreStorage', async (data) => {
            if (!data) return;
            const result = await this.device.confirmPopup.openPage(
                'Delete storage',
                `Are you sure to delete all data for ${data.name}?`
            );
            if (result) {
                if (data.id === 'settings') {
                    this.setting.updateOS();
                }
                for (const store of data.stores) {
                    await this.storage.clearStore(`${store}-store`, store);
                }
                this.update();
                this.device.setHistory(data.id, []);
                //TODO: need to add clear data from store
            }
        });

        // this.addEventListener('click', async () => {
        //     const result = await parent.appConfirm.openPage(
        //         'Delete storage',
        //         `Are you sure to delete all data?`
        //     );
        //     if (result) {
        //         await this.deleteAllData();
        //         parent.location.reload();
        //     }
        // }, this.btnEnd, false);
    }

    async render(data: Setting) {
        this.item = data;
        const scrollArea = this.createScrollArea();

        await this.renderStorage(scrollArea);
        this.renderApps(data.data || [], scrollArea);

        this.mainArea.appendChild(scrollArea);

        setTimeout(() => {
            if (!this.scrollBar) {
                this.scrollBar = new ScrollBar(this.component);
            } else {
                this.scrollBar?.reCalculate();
            }
        }, 100)
    }

    update() {
        this.removeAllEventListeners();
        this.mainArea.innerHTML = '';
        if (this.item) this.render(this.item);
    }

    // private async deleteAllData() {
    //     for(const app of this.item?.data) {
    //         for (const store of app.stores) {
    //             await this.storage.clearStore(`${store}-store`, store);
    //         }
    //     }
    // }

    private async renderApps(list: StoreInfo[], parentEl: HTMLElement) {
        const listEl = this.createElement('ul', ['appList', 'storageList']);
        for (const item of list) {
            const itemEl = this.createElement('li', ['appItem']);
            const labelEl = this.createElement('div', ['appName']);
            labelEl.textContent = item.name;

            const totalUsage = await this.storage.getStoreUsage(item.stores.map(name => `${name}-store`));

            const deleteButton = this.createElement('button', ['clearStorage']);
            deleteButton.innerHTML = `
                ${IndexedDBUsage.bytesToMB(totalUsage, 4)} MB
                <span class="material-symbols-outlined icon--ssm">arrow_forward_ios</span>
            `;

            itemEl.appendChild(labelEl);
            itemEl.appendChild(deleteButton);

            this.addEventListener('click', () => {
                this.dispatchCustomEvent('deleteStoreStorage', item);
            }, deleteButton);

            listEl.appendChild(itemEl);
        }

        parentEl.appendChild(listEl);
    }

    private async renderStorage(parentEl: HTMLElement) {
        const storageContainer = this.createElement('div', ['storageContainer']);

        if (this.storage.isSupport()) {

        }

        const storage = await this.storage.getStorage();
        const [ quots, usage ] = [ storage?.quota || 0, storage?.usage || 0 ]

        const titleEl = this.createElement('h3');
        titleEl.textContent = 'Device Storage';
        storageContainer.appendChild(titleEl);

        const GB = IndexedDBUsage.bytesToGB(usage);
        const isGB = !!Number(GB);
        const messageEl = this.createElement('div', ['message']);
        messageEl.textContent = `${isGB ? GB : IndexedDBUsage.bytesToMB(usage)} ${ isGB ? 'GB' : 'MB' } of ${IndexedDBUsage.bytesToGB(quots)} GB used`;
        storageContainer.appendChild(messageEl);

        const usagePercentage = Math.ceil(usage / quots * 100);
        const freeStorage = IndexedDBUsage.bytesToGB(quots - usage);
        const progressEl = this.createElement('div', ['progress'], {
            'data-free': `${freeStorage}`,
            'data-support': this.storage.isSupport() ? 'support' : 'not-support'
        });

        const progressBar = this.createElement('div', ['progressBar'], {
            style: `width: ${usagePercentage}%;`,
        });
        progressEl.appendChild(progressBar);

        storageContainer.appendChild(progressEl);

        parentEl.appendChild(storageContainer);
    }
}