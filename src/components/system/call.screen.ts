import { Popup } from "../popup";
import { Contact } from "../../stores/contact.store";
import { CallTime } from "../../utils/call";

export interface Call {
    contact?: Contact;
    number: string;
    status: 'incoming_call' | 'outgoing_call'
}


export class CallScreen extends Popup {
    private call: Call|undefined;
    private stopwatch: CallTime;

    constructor() {
        super({ btnCenter: 'call_end', btnEnd: false })
        this.stopwatch = new CallTime()
        this.init()
    }

    private init() {
        this.listen('pageClose', () => {
            this.dispatchCustomEvent('callDone', {
                type: this.call?.status,
                date: new Date(),
                contact: this.call?.contact,
                number: this.call?.number,
                data: this.stopwatch.getCurrentTime()
            })
            this.stopwatch.reset()
        })
    }

    async render(data: Call) {
        this.call = data
        const flexCenter = this.createFlexCenter()
        const callingStatus = this.createElement('div', ['callingStatus'])
        const statusEl = this.createElement('div', ['status'])
        statusEl.innerText = data.status === 'incoming_call' ? 'Connecting..' : 'Calling...';
        const contactNumber = this.createElement('div', ['contactNumber'])
        contactNumber.innerText = data.contact ? `${data.contact.firstName} ${data.contact.lastName}` : data.number;

        const callActions = this.createElement('div', ['callActions', 'hide']);

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

        const delay = data.status === 'incoming_call' ? 0 : 1000;
        setTimeout(() => {
            this.stopwatch.setDisplay(statusEl);
            this.stopwatch.start();
            callActions.classList.remove('hide');
        }, delay);
    }

    update() {}

    private createActionButton(iconOn: string) {
        const actionButton = this.createElement('button', ['callAction'], { 'data-status': 'on' });
        actionButton.innerHTML = `<span class="material-symbols-outlined icon">${iconOn}</span>`;

        return actionButton;
    }
}