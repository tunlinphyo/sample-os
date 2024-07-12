import { Page } from "../../../components/page";
import { SettingsController } from "../../../controllers/settings.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Setting } from "../../../stores/settings.store";

export class TogglePage extends Page {
    private item: Setting | undefined;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private setting: SettingsController
    ) {
        super(history, {});
        this.init();
    }

    private init() {
        const settingListener = (status: string, data: any) => {
            switch (status) {
                case 'TOGGLE_VALUE':
                    this.update('update', data);
                    break;
            }
        };

        this.setting.addChangeListener(settingListener);

        this.device.addEventListener('closeApp', () => {
            this.setting.removeChangeListener(settingListener);
        });
    }

    render(data: Setting) {
        this.item = data;
        const scrollArea = this.createScrollArea();

        const toggleContainer = this.createElement('button', ['toggleContainer']);
        const labelEl = this.createElement('span', ['label']);
        labelEl.textContent = data.title;

        const toggleButton = this.createElement<HTMLButtonElement>('span', ['toggleButton'], {
            type: 'button',
            'data-toggle':  data.value,
        });

        toggleContainer.appendChild(labelEl);
        toggleContainer.appendChild(toggleButton);
        scrollArea.appendChild(toggleContainer);

        this.addEventListener('click', () => {
            this.setting.toggleSetting(data);
        }, toggleContainer);

        this.mainArea.appendChild(scrollArea);
    }

    update(_: string, data: Setting) {
        if (!this.isActive) return;
        if (data.id !== this.item?.id) return;
        this.removeAllEventListeners();
        this.mainArea.innerHTML = '';
        this.render(data);
    }
}
