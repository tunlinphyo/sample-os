import { DeviceController } from "../../device/device";
import { Contact } from "../../stores/contact.store";
import { BaseSystem } from "../system";

export interface IncomingData {
    number: string;
    contact?: Contact | null;
}

export class IncomingCall extends BaseSystem<IncomingData> {
    private timeout: number | null = null;

    constructor(device: DeviceController) {
        super({ btnStart: 'close', btnEnd: 'check' }, device);
    }

    render(data: IncomingData): Promise<IncomingData | boolean> {
        return new Promise(resolve => {
            this.createUI(data);

            this.timeout = setTimeout(() => {
                this.close()
                resolve(false)
            }, 50 * 60 * 1000);

            this.addEventListener('click', async () => {
                if (this.timeout) clearTimeout(this.timeout);
                this.close();
                resolve(false);
            }, this.btnStart);

            this.addEventListener('click', async () => {
                if (this.timeout) clearTimeout(this.timeout);
                this.close();
                resolve(data);
            }, this.btnEnd);
        });
    }

    private createUI(data: IncomingData) {
        this.mainArea.innerHTML = "";
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