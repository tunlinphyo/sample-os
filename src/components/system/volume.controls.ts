import { SettingsController } from "../../controllers/settings.controller";
import { DeviceController } from "../../device/device";
import { Volume } from "../../stores/settings.store";
import { BaseComponent } from "../base";


export class VolumeControls extends BaseComponent {
    public mainArea: HTMLElement;
    public btnCenter: HTMLButtonElement;

    private volumeUp: HTMLButtonElement;
    private volumeDown: HTMLButtonElement;

    constructor(
        private device: DeviceController,
        private setting: SettingsController
    ) {
        super('appTemplate', device.deviceEl);
        this.component.classList.add('volumeControls');
        this.mainArea = this.getElement('.mainArea');
        this.btnCenter = this.setupActionButton();

        this.volumeUp = this.getElement("#volumeUpButton", document.body);
        this.volumeDown = this.getElement("#volumeDownButton", document.body);

        this.init();
    }

    private init() {
        this.addEventListener('click', () => {
            this.close();
        }, this.btnCenter, false);

        this.addEventListener('click', () => {
            this.open();
        }, this.volumeUp, false);

        this.addEventListener('click', () => {
            this.open();
        }, this.volumeDown, false);
    }

    open() {
        this.mainArea.innerHTML = '';

        this.getElement('.statusBar-title').innerHTML = 'Volume';
        this.component.classList.add('screen--show');

        this.dispatchCustomEvent('volumeOpen');
        const transitionEndHandler = () => {
            this.dispatchCustomEvent('volumeOpenFinished');
            this.component.removeEventListener('transitionend', transitionEndHandler);
        };
        this.component.addEventListener('transitionend', transitionEndHandler);
    }

    close() {
        this.component.classList.remove('screen--show');
        this.dispatchCustomEvent('volumeClose');

        const transitionEndHandler = () => {
            this.component.removeEventListener('transitionend', transitionEndHandler);
            this.dispatchCustomEvent('volumeCloseFinished');
            this.removeAllEventListeners();
        };
        this.component.addEventListener('transitionend', transitionEndHandler);
    }

    protected setupActionButton() {
        const button = this.createElement<HTMLButtonElement>('button', ['actionButton', 'center'], { type: 'button' })
        button.innerHTML = `<span class="material-symbols-outlined icon">close</span>`;
        const target = this.getElement(`.actionButton.center`);
        this.replaceElement(target, button);
        return button;
    }
}