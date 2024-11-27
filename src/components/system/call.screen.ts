import { Contact } from "../../stores/contact.store";
import { CallTime } from "../../utils/call";
import { BaseSystem } from "../system";
import { DeviceController } from "../../device/device";
import { History } from "../../stores/history.store";

export interface Call {
    contact?: Contact;
    number: string;
    status: 'incoming_call' | 'outgoing_call'
}

export class CallScreen extends BaseSystem<Omit<History, 'id'>> {
    private stopwatch: CallTime;

    constructor(device: DeviceController) {
        super({ template: 'callScreenTemplate', btnEnd: 'call_end' }, device, 'phone');
        this.stopwatch = new CallTime();
    }

    render(data: Omit<History, 'id'>): Promise<Omit<History, 'id'>> {
        return new Promise((resolve) => {

            this.mainArea.innerHTML = "";
            const flexCenter = this.createFlexCenter()
            const callingStatus = this.createElement('div', ['callingStatus'])
            const statusEl = this.createElement('div', ['status'])
            statusEl.innerText = 'Connecting..';
            const contactNumber = this.createElement('div', ['contactNumber'])
            contactNumber.innerText = data.contact ? `${data.contact.firstName} ${data.contact.lastName}` : data.number;

            const callActions = this.createElement('div', ['callActions']);

            const micIcon = this.createActionButton('mic');
            callActions.appendChild(micIcon);

            const speakerIcon = this.createActionButton('volume_up');
            callActions.appendChild(speakerIcon);

            const dialIcon = this.createActionButton('apps');
            callActions.appendChild(dialIcon);

            callingStatus.appendChild(statusEl)
            callingStatus.appendChild(contactNumber)
            callingStatus.appendChild(callActions)

            flexCenter.appendChild(callingStatus)
            this.mainArea.appendChild(flexCenter)

            this.addEventListener('click', () => {
                data.data = this.stopwatch.getCurrentTime()
                resolve(data);
                this.stopwatch.reset();
            }, this.btnEnd);

            setTimeout(() => {
                this.stopwatch.setDisplay(statusEl);
                this.stopwatch.start();
            }, 0);
        });
    }

    private createActionButton(iconOn: string) {
        const actionButton = this.createElement('button', ['callAction'], { 'data-status': 'on' });
        actionButton.innerHTML = `<span class="material-symbols-outlined icon">${iconOn}</span>`;

        return actionButton;
    }
}