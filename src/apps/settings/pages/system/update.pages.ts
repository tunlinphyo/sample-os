import { Page } from "../../../../components/page";
import { SettingsController } from "../../../../controllers/settings.controller";
import { DeviceController } from "../../../../device/device";
import { HistoryStateManager } from "../../../../device/history.manager";

export interface System {
    id: string;
    title: string;
}


export class SoftwareUpdatePage extends Page {
    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private setting: SettingsController
    ) {
        super(history, {});
    }

    render(data: (System & any)) {
        // console.log(data);
        const flexCenter = this.createFlexCenter();

        const titleEl = this.createElement('div', ['title']);
        const messageEl = this.createElement('div', ['message']);

        const version = data.version;
        const systemVersion = this.setting.version;

        if (version === systemVersion) {
            titleEl.textContent = `Version: ${systemVersion}`;
            messageEl.textContent = `OS is up to date`;
            flexCenter.appendChild(titleEl);
            flexCenter.appendChild(messageEl);
        } else {
            titleEl.textContent = `There is new version`;
            flexCenter.appendChild(titleEl);

            const buttonEl = this.createElement('button', ['osUpdate']);
            buttonEl.innerHTML = `
                Update to ${systemVersion}
                <span class="material-symbols-outlined">system_update_alt</span>
            `;
            this.addEventListener('click', async () => {
                const result = await this.device.confirmPopup.openPage('System Update', this.setting.message);
                if (result) this.setting.updateOS();
            }, buttonEl);
            flexCenter.appendChild(buttonEl);
        }


        this.mainArea.appendChild(flexCenter);

    }

    update() {

    }
}