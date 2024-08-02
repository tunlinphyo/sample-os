import { App } from "../../../components/app";
import { SelectItem } from "../../../components/select";
import { SettingsController } from "../../../controllers/settings.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Setting, Volume } from "../../../stores/settings.store";
import { OSBrowser } from "../../../utils/browser";

export class SettingApp extends App {

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private setting: SettingsController
    ) {
        super(history, { template: 'actionTemplate' });
        this.render(this.setting.settings);
        this.init();
    }

    private init() {

        const settingListener = (status: string) => {
            switch (status) {
                case 'UPDATE_THEME':
                case 'TOGGLE_VALUE':
                case 'UPDATE_SOUNDS':
                    this.update('update', this.setting.settings);
                    break;
            }
        };

        this.setting.addChangeListener(settingListener);

        this.device.addEventListener('closeApp', () => {
            this.setting.removeChangeListener(settingListener);
        });
    }

    render(settings: Setting[]) {
        this.createSettingList(settings);
    }

    update(_: string, list: Setting[]) {
        for (const item of list) {
            const valueEl = this.getElement(`#${item.id}Value`);
            if (!valueEl) continue;
            valueEl.textContent = item.value;
        }
    }

    private createSettingList(list: Setting[]) {
        const listEl = this.createElement('ul', ['settingList']);

        for(const item of this.filterSettings(list)) {
            const itemEl = this.createItem(item);
            listEl.appendChild(itemEl);
        }

        this.mainArea.appendChild(listEl);
    }

    private createItem(item: Setting) {
        const itemEl = this.createElement('li', ['settingItem'], { id: item.id });

        const itemMainButton = this.createElement('button', ['itemMain']);
        itemMainButton.textContent = item.title;
        itemEl.appendChild(itemMainButton);
        this.addEventListener('click', () => {
            this.openSetting({ type: 'main', data: item });
        }, itemMainButton);

        const itemToggleButton = this.createElement('button', ['itemToggle']);
        const value = typeof item.value === "string" ? item.value : item.value;
        itemToggleButton.innerHTML = `
            <span id="${item.id}Value">${value}</span>
            <span class="material-symbols-outlined icon--ssm">arrow_forward_ios</span>
        `;
        itemEl.appendChild(itemToggleButton);
        this.addEventListener('click', () => {
            this.openSetting({ type: 'toggle', data: item });
        }, itemToggleButton);

        return itemEl;
    }

    private filterSettings(list: Setting[]) {
        return list.filter(item => item.inList);
    }

    private openSetting(item: { type: 'main' | 'toggle', data: Setting}) {
        const {type, data} = item;

        switch(data.id) {
            case 'display':
                if (type === 'main') {
                    this.history.pushState('/display', data.id);
                } else {
                    this.changeDisplay(data);
                }
                break;
            case 'sounds':
                if (type === 'main') {
                    this.history.pushState('/sounds', data.id);
                } else {
                    this.toggleMute(data.data);
                }
                break;
            case 'wifi':
            case 'bluetooth':
            case 'cellular':
                this.handleToggle(type, data);
                break;
            case 'apps':
                // console.log('OPEN APPS');
                this.history.pushState('/applications', data.id);
                break;
            case 'storage':
                this.history.pushState('/storage', data);
                break;
            case 'battery':
                this.history.pushState('/battery', data);
                break;
            case 'system':
                this.history.pushState('/system', data.id);
                break;
            default:
                break;
        }
    }

    private handleToggle(type: string, data: Setting) {
        if (type === 'main') {
            const setting = this.setting.getSettingItem(data.id);
            this.history.pushState('/toggles', setting?.id);
        } else {
            this.setting.toggleSetting(data);
        }
    }

    private async changeDisplay(data: Setting) {
        const list: SelectItem[] = [
            {
                title: 'Auto',
                value: 'auto',
                icon: 'contrast'
            },
            {
                title: 'Light',
                value: 'light',
                icon: 'light_mode'
            },
            {
                title: 'Dark',
                value: 'dark',
                icon: 'dark_mode'
            },
        ];
        const selected = await this.device.selectList.openPage('Appearence', list);
        if (selected) {
            const item = list.find(item => item.value === selected);
            if (!item) return;
            data.value = item.value;
            data.data = item.value === 'auto' ? OSBrowser.getPreferredColorScheme() : item.value;
            this.setting.updateTheme(data);
        }
    }

    private async toggleMute(data: Volume) {
        const list: SelectItem[] = [
            {
                title: 'Noti',
                value: 'noti',
                icon: 'notifications'
            },
            {
                title: 'Mute',
                value: 'mute',
                icon: 'notifications_off'
            },
        ];
        const selected = await this.device.selectList.openPage<string>('Notifigation', list);
        if (selected && typeof selected === 'string') {
            if (selected === 'mute' && data.notiVolume === 0) return;
            if (selected === 'noti' && data.notiVolume !== 0) return;
            data.notiVolume = selected === 'noti' ? 0.5 : 0;
            data.isMuted = data.notiVolume == 0;
            this.setting.volumes = data;
        }
    }
}
