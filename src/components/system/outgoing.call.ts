import { DeviceController } from "../../device/device";
import { Contact } from "../../stores/contact.store";
import { BaseSystem } from "../system";

export interface OutgoingData {
    number: string;
    contact?: Contact | null;
}

export class OutgoingCall extends BaseSystem {
    constructor(device: DeviceController) {
        super({ btnCenter: 'close' }, device);
    }

    render(data: any) {
        return new Promise((resolve) => {
            this.createUI(data);

            setTimeout(() => {
                const isSuccess = Math.random() < 0.75;
                this.close()
                resolve(isSuccess ? data : false)
            }, 3 * 1000);
        });
    }

    private createUI(data: any) {
        const flexCenter = this.createFlexCenter()
        const callingStatus = this.createElement('div', ['callingStatus'])
        const statusEl = this.createElement('div', ['status'])
        statusEl.innerText = 'Connecting..';
        const contactNumber = this.createElement('div', ['contactNumber'])
        contactNumber.innerText = data.contact ? `${data.contact.firstName} ${data.contact.lastName}` : data.number;

        callingStatus.appendChild(statusEl)
        callingStatus.appendChild(contactNumber)

        flexCenter.appendChild(callingStatus)
        this.mainArea.appendChild(flexCenter)
    }
}
