import { Contact } from "../../stores/contact.store";
import { BaseComponent } from "../base"

export interface OutgoingData {
    number: string;
    contact?: Contact | null;
}

export class OutgoingCall extends BaseComponent {
    public mainArea: HTMLElement;

    public btnStart?: HTMLButtonElement | undefined;
    public btnCenter?: HTMLButtonElement | undefined;
    public btnEnd?: HTMLButtonElement | undefined;

    public isActive: boolean = false

    constructor() {
        super('appTemplate');

        this.component.classList.add('screen--popup')
        this.mainArea = this.getElement('.mainArea')

        this.setupActionButton('close', 'center');

        this.closePage = this.closePage.bind(this)
    }

    render(data: OutgoingData) {
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

    public openPage(data: OutgoingData): Promise<OutgoingData | boolean> {
        return new Promise((resolve) => {
            try {
                this.getElement('#device', document.body).appendChild(this.component)
            } catch(_) {
                document.body.appendChild(this.component)
            }
            this.addEventListener('click', async () => {
                this.closePage()
                resolve(false)
            }, this.btnCenter);

            setTimeout(() => {
                const isSuccess = Math.random() < 0.75;
                this.closePage()
                resolve(isSuccess ? data : false)
            }, 30 * 1000);

            this.mainArea.innerHTML = ''
            this.render(data);

            this.getElement('.statusBar-title').innerHTML = "Incoming call";

            setTimeout(() => {
                this.component.classList.add('screen--show');
                this.dispatchCustomEvent('pageOpen');
                const transitionEndHandler = () => {
                    this.dispatchCustomEvent('pageOpenFinished');
                    this.isActive = true;
                    this.component.removeEventListener('transitionend', transitionEndHandler);
                };
                this.component.addEventListener('transitionend', transitionEndHandler);
            }, 0)
        })
    }

    public closePage() {
        this.component.classList.remove('screen--show');
        this.dispatchCustomEvent('pageClose');
        this.isActive = false;
        this.dispatchCustomEvent('pageCloseFinished');
        this.removeAllEventListeners();
    }

    protected setupActionButton(icon: string | undefined, position: 'start' | 'end' | 'center') {
        if (icon) {
            const button = this.createElement<HTMLButtonElement>('button', ['actionButton', position], { type: 'button' })
            button.innerHTML = `<span class="material-symbols-outlined icon">${icon}</span>`;
            const target = this.getElement(`.actionButton.${position}`);
            this.replaceElement(target, button);
            if (position === 'start') this.btnStart = button;
            if (position === 'center') this.btnCenter = button;
            if (position === 'end') this.btnEnd = button;
        }
    }

    protected createFlexCenter(): HTMLElement {
        const flexCenter = this.createElement('div', ['flexCenter']);
        return flexCenter;
    }
}