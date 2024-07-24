import { DeviceController } from "../../device/device";
import { Contact } from "../../stores/contact.store";
import { BaseSystem } from "../system";

export interface IncomingData {
    number: string;
    contact?: Contact | null;
}

export class IncomingCall extends BaseSystem {
    constructor(device: DeviceController) {
        super({ btnStart: 'close', btnEnd: 'check' }, device);

    }

    render(data: IncomingData) {
        return new Promise(resolve => {
            this.createUI(data);

            this.addEventListener('click', async () => {
                this.close();
                resolve(false);
            }, this.btnCenter);

            this.addEventListener('click', async () => {
                this.close();
                resolve(data);
            }, this.btnEnd);

            setTimeout(() => {
                this.close()
                resolve(false)
            }, 5 * 1000);
        });
    }

    private createUI(data: IncomingData) {
        const flexCenter = this.createFlexCenter();
        const callingStatus = this.createElement('div', ['callingStatus']);
        const statusEl = this.createElement('div', ['status']);
        statusEl.innerText = 'Incoming call';
        const contactNumber = this.createElement('div', ['contactNumber']);
        contactNumber.innerText = data.contact ? `${data.contact.firstName} ${data.contact.lastName}` : data.number;

        callingStatus.appendChild(statusEl);
        callingStatus.appendChild(contactNumber);

        flexCenter.appendChild(callingStatus);
        this.mainArea.appendChild(flexCenter);
    }
}