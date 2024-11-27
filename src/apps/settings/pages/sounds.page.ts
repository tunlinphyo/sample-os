import { FormComponent } from "../../../components/form";
import { CustomSelectForm } from "../../../components/form/form-elem";
import { Page } from "../../../components/page";
import { SelectItem } from "../../../components/select";
import { AudioController } from "../../../controllers/audio.controller";
import { SettingsController } from "../../../controllers/settings.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Setting } from "../../../stores/settings.store";
import { OSAudio } from "../../../utils/audio";
import { VolumeSlider } from "./volume.slider";

class SoundsForm extends FormComponent {
    private ringTone?: CustomSelectForm;
    private textTone?: CustomSelectForm;
    private defaultAlert?: CustomSelectForm;
    private callback: () => void;
    private audio: OSAudio;

    private textTones: SelectItem[] = [
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

    private ringTones: SelectItem[] = [
        {
            title: 'Buzz Symphony',
            value: 'buzz'
        },
        {
            title: 'Silent Beats',
            value: 'beats'
        },
        {
            title: 'Pulse Groove',
            value: 'groove'
        },
        {
            title: 'Haptic Rhythm',
            value: 'rhythm'
        },
        {
            title: 'Vibe Chime',
            value: 'vibe'
        },
    ];

    constructor(
        device: DeviceController,
        parent: HTMLElement,
        private setting: SettingsController,
        private audioController: AudioController
    ) {
        super(device, 'contactForm', parent);
        this.audio = audioController.initAudio('noti-song')
        this.callback = () => {
            console.log(this.audio.currentTime);
            if (this.audio.currentTime > 3) {
                this.stopAudio();
            }
        }
    }

    render(data?: Setting) {

        const labelEl = this.createElement('div', ['formLabel', 'marginBottom']);
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

        console.log(this.setting.volumes);

        const toneGroup = this.createGroup();

        this.ringTone = this.select({
            label: 'Ringtone',
            defautValue: this.setting.volumes.ringTone,
            list: this.ringTones
        }, toneGroup);

        this.textTone = this.select({
            label: 'Text Tone',
            defautValue: this.setting.volumes.textTone,
            list: this.textTones
        }, toneGroup);

        this.defaultAlert = this.select({
            label: 'Default Alerts',
            defautValue: this.setting.volumes.defaultAlert,
            list: this.ringTones
        }, toneGroup);

        this.ringTone.addEventListener('change', (data: string) => {
            this.playAudio(data);
            this.setting.volumes = { ...this.setting.volumes, ringTone: data };
        });

        this.textTone.addEventListener('change', (data: string) => {
            this.playAudio(data);
            this.setting.volumes = { ...this.setting.volumes, textTone: data };
        });

        this.defaultAlert.addEventListener('change', (data: string) => {
            this.playAudio(data);
            this.setting.volumes = { ...this.setting.volumes, defaultAlert: data };
        });

        this.appendElement(volumeGroup);
        this.appendElement(toneGroup);
    }

    getData() {}

    private playAudio(data: string) {
        const url = this.audioController.notiFiles[data];
        if (url) {
            this.audio.e.addEventListener('timeupdate', this.callback);
            this.audio.playSong(url, 0);
            this.audio.loop = false;
        }
    }

    private stopAudio() {
        this.audio.pause();
        this.audio.data = '';
        this.audio.e.removeEventListener('timeupdate', this.callback);
    }

}

export class SoundsPage extends Page {
    private form?: SoundsForm;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private setting: SettingsController,
        private audio: AudioController
    ) {
        super(history, {});
    }

    render(data: Setting) {
        this.form = new SoundsForm(this.device, this.mainArea, this.setting, this.audio);
        this.form.render(data);
    }

    update(_: string, item: Setting) {
        this.removeAllEventListeners();
        this.mainArea.innerHTML = "";
        this.render(item);
    }
}