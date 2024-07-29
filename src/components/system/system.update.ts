import { DeviceController } from "../../device/device";
import { BaseSystem } from "../system";


export class SystemUpdate extends BaseSystem<undefined> {
    constructor(device: DeviceController) {
        super({ }, device, 'alarm');
    }

    render(): Promise<undefined> {
        return new Promise((_) => {
            const flexCenter = this.createElement('div', ['flexCenter']);
            const titleEl = this.getElement('.statusBar-title');
            titleEl.textContent = 'Updating..';

            const loadingEl = this.createElement('div', ['systemLoader']);
            flexCenter.appendChild(loadingEl);

            this.mainArea.appendChild(flexCenter);
        })
    }

    update() {

    }
}