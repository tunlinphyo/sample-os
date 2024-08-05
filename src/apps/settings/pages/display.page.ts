import { Page } from "../../../components/page";
import { SelectItem } from "../../../components/select";
import { SettingsController } from "../../../controllers/settings.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Setting } from "../../../stores/settings.store";
import { OSBrowser } from "../../../utils/browser";

export class DisplayPage extends Page {
    private displays: SelectItem[] = [
        // {
        //     title: 'Auto',
        //     value: 'auto',
        // },
        {
            title: 'Light',
            value: 'light',
        },
        {
            title: 'Dark',
            value: 'dark',
        },
    ]

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private setting: SettingsController
    ) {
        super(history, {});
        this.init();
    }

    private init() {
        const displayListener = (status: string, data: Setting) => {
            switch (status) {
                case 'UPDATE_THEME':
                    this.update('update', data);
                    break;
            }
        };

        this.setting.addChangeListener(displayListener);

        this.device.addEventListener('closeApp', () => {
            this.setting.removeChangeListener(displayListener);
        });
    }

    render(data: Setting) {
        const scrollArea = this.createScrollArea();

        const displayContainer = this.createElement('div', ['displayContainer']);

        const current = OSBrowser.getPreferredColorScheme();
        if (data.value === 'auto' && data.data !== current) {
            this.setting.updateTheme({ ...data, data: current });
        }

        for(const display of this.displays) {
            const deviceContainer = this.createElement('div', ['deviceContainer']);
            const deviceSample = this.cloneTemplate("deviceTemplate");
            deviceSample.classList.add(display.value);

            const main = this.getElement(".deviceMain", deviceSample);
            main.textContent = display.title;

            const checkBox = this.createElement('span', ['material-symbols-outlined']);
            checkBox.textContent = data.data === display.value ? 'radio_button_checked' : 'radio_button_unchecked';

            deviceContainer.appendChild(deviceSample);
            deviceContainer.appendChild(checkBox);

            this.addEventListener('click', () => {
                this.setting.updateTheme({ ...data, value: display.value, data: display.value });
            }, deviceContainer);

            displayContainer.appendChild(deviceContainer);
        }

        const groupContiner = this.createElement('div', ['groupContiner']);

        const labelEl = this.createElement('div', ['formLabel']);
        labelEl.textContent = 'Appearence';
        groupContiner.appendChild(labelEl);


        const toggleGroup = this.createElement('div', ['toggleGroup']);
        const labelEL = this.createElement('div', ['inputLabel']);
        labelEL.textContent = 'Automatic';
        const toggleButton = this.createElement<HTMLButtonElement>('button', ['toggleButton'], {
            type: 'button',
            'data-toggle':  data.value === 'auto' ? 'on' : 'off'
        });

        this.addEventListener('click', () => {
            this.setting.updateTheme({
                ...data,
                value: data.value === 'auto' ? OSBrowser.getPreferredColorScheme() : 'auto',
                data: OSBrowser.getPreferredColorScheme()
            });
        }, toggleButton);

        toggleGroup.appendChild(labelEL);
        toggleGroup.appendChild(toggleButton);
        groupContiner.appendChild(toggleGroup);

        scrollArea.appendChild(groupContiner);
        scrollArea.appendChild(displayContainer);

        this.mainArea.appendChild(scrollArea);
    }

    update(_: string, item: Setting) {
        this.removeAllEventListeners();
        this.mainArea.innerHTML = "";
        this.render(item);
    }
}