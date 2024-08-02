import { FormComponent } from "../../../components/form";
import { CustomSelectForm, CustomToggleForm } from "../../../components/form/form-elem";
import { Page } from "../../../components/page";
import { SelectItem } from "../../../components/select";
import { SettingsController } from "../../../controllers/settings.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Setting } from "../../../stores/settings.store";
import { VolumeSlider } from "./volume.slider";

class SoundsForm extends FormComponent {
    private ringTone?: CustomSelectForm;
    private textTone?: CustomSelectForm;
    private defaultAlert?: CustomSelectForm;

    private ringTones: SelectItem[] = [
        {
            title: 'Reflection',
            value: 'reflection'
        },
        {
            title: 'Arpeggio',
            value: 'arpeggio'
        },
        {
            title: 'Canopy',
            value: 'canopy'
        },
        {
            title: 'Chalet',
            value: 'chalet'
        },
        {
            title: 'Daybreak',
            value: 'daybreak'
        },
    ];

    constructor(
        device: DeviceController,
        parent: HTMLElement,
        private setting: SettingsController
    ) {
        super(device, 'contactForm', parent);
    }

    render(data?: Setting) {

        const labelEl = this.createElement('div', ['formLabel']);
        labelEl.textContent = 'Rington and Alerts';
        this.appendElement(labelEl);

        const volumeGroup = this.createElement('div', ['ringToneSlider']);

        const notiVolume = new VolumeSlider(volumeGroup, data?.data.notiVolume || 0, ['notifications', 'notifications_off']);

        notiVolume.addEventListener<number>('change', (value) => {
            const volumes = this.setting.volumes;
            volumes.notiVolume = value;
            volumes.isMuted = value == 0;
            this.setting.volumes = volumes;
        });

        const toneGroup = this.createGroup();

        this.ringTone = this.select({
            label: 'Ringtone',
            defautValue: 'reflection',
            list: this.ringTones
        }, toneGroup);

        this.ringTone = this.select({
            label: 'Text Tone',
            defautValue: 'daybreak',
            list: this.ringTones
        }, toneGroup);

        this.ringTone = this.select({
            label: 'Default Alerts',
            defautValue: 'canopy',
            list: this.ringTones
        }, toneGroup);

        this.appendElement(volumeGroup);
        this.appendElement(toneGroup);
    }

    getData() {}
}

export class SoundsPage extends Page {
    private form?: SoundsForm;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private setting: SettingsController
    ) {
        super(history, {});
    }

    render(data: Setting) {
        this.form = new SoundsForm(this.device, this.mainArea, this.setting);
        this.form.render(data);
    }

    update(_: string, item: Setting) {
        this.removeAllEventListeners();
        this.mainArea.innerHTML = "";
        this.render(item);
    }
}