import { DeviceController } from "../device/device";
import { BaseComponent } from "./base";

export interface SystemActions {
    btnStart?: string;
    btnCenter?: string;
    btnEnd?: string;
    template?: string;
}

export abstract class BaseSystem<T> extends BaseComponent {
    private systemAlert: HTMLElement;
    private iframeEl: HTMLIFrameElement;
    public mainArea: HTMLElement;

    public btnStart?: HTMLButtonElement | undefined;
    public btnCenter?: HTMLButtonElement | undefined;
    public btnEnd?: HTMLButtonElement | undefined;

    constructor(
        actions: SystemActions,
        private device: DeviceController
    ) {
        super(actions.template || 'appTemplate');
        this.systemAlert = this.getElement('.systemAlert', this.device.component);
        this.iframeEl = this.getElement('#systemFrame', this.device.component);
        this.mainArea = this.getElement('.mainArea');

        this.setupActionButton(actions.btnStart, 'start');
        this.setupActionButton(actions.btnCenter, 'center');
        this.setupActionButton(actions.btnEnd, 'end');

    }

    abstract render(data: T): Promise<T | boolean>;

    open(title: string, data: T, ): Promise<T | boolean> {
        return new Promise(async (resolve) => {
            if (!this.iframeEl.contentDocument) return false;

            const titleEl = this.getElement('.statusBar-title')
            if (titleEl) titleEl.innerHTML = title;

            this.dispatchCustomEvent('pageOpen');
            this.iframeEl.contentDocument.body.appendChild(this.component);
            this.systemAlert.style.display = 'block';

            if (this.btnCenter) {
                this.addEventListener('click', async () => {
                    this.close()
                    resolve(false)
                }, this.btnCenter);
            }

            this.device.systemOpen = true;

            const result = await this.render(data);
            this.close();
            resolve(result);
        });
    }

    close() {
        this.device.systemOpen = false;
        this.dispatchCustomEvent('pageClose');
        this.systemAlert.style.display = 'none';
        this.component.remove();
    }

    protected setupActionButton(icon: string | undefined, position: 'start' | 'end' | 'center') {
        if (icon) {
            const allCaps = this.isAllCaps(icon);
            const button = this.createElement<HTMLButtonElement>('button', ['actionButton', position], { type: 'button' });
            if (allCaps) button.classList.add('textIcon');
            button.innerHTML = allCaps ? icon : `<span class="material-symbols-outlined icon">${icon}</span>`;
            const target = this.getElement(`.actionButton.${position}`);
            if (target) {
                this.replaceElement(target, button);
                if (position === 'start') this.btnStart = button;
                if (position === 'center') this.btnCenter = button;
                if (position === 'end') this.btnEnd = button;
            }
        }
    }

    protected createFlexCenter(): HTMLElement {
        const flexCenter = this.createElement('div', ['flexCenter']);
        return flexCenter;
    }
}