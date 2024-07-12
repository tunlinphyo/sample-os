import { FormComponent } from "../../../../components/form";
import { CustomSelectForm, CustomToggleForm } from "../../../../components/form/form-elem";
import { Page } from "../../../../components/page";
import { SettingsController } from "../../../../controllers/settings.controller";
import { DeviceController } from "../../../../device/device";
import { HistoryStateManager } from "../../../../device/history.manager";
import { DateTimeInfo, Setting } from "../../../../stores/settings.store";
import { SelectItem } from "../../../../components/select";
import { CITIES } from "../../../../utils/cities";

class TimeZoneForm extends FormComponent {
    private data: DateTimeInfo | undefined;

    private format24: CustomToggleForm | undefined;
    private auto: CustomToggleForm | undefined;
    private timezone: CustomSelectForm | undefined;

    private timezoneList: SelectItem[] = CITIES.map(item => ({ title: item.city, value: item.timeZone })).sort((a, b) => {
        return a.title.localeCompare(b.title);
    });

    constructor(
        device: DeviceController,
        parent: HTMLElement,
        private setting: SettingsController
    ) {
        super(device, 'contactForm', parent);
        this.init();
    }

    private init() { }

    render(data?: DateTimeInfo) {
        this.cleanup();

        if (!data) {
            this.data = {
                autoTimeZone: false,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                hour12: true
            }
        } else {
            this.data = data;
        }

        const timeGroup = this.createGroup();

        this.format24 = this.toggle({
            label: '24-Hour Time',
            defaultValue: !this.data.hour12
        }, timeGroup);

        const timezoneGroup = this.createGroup();

        this.auto = this.toggle({
            label: 'Set Automatically',
            defaultValue: this.data.autoTimeZone
        }, timezoneGroup);
        this.timezone = this.select({
            label: 'Time Zone',
            defautValue: this.data.timeZone,
            list: this.timezoneList
        }, timezoneGroup);

        this.format24.addEventListener('change', (data: boolean) => {
            this.setting.hour12 = !data;
        });
        this.auto.addEventListener('change', (data: boolean) => {
            this.setting.autoZone = data;
        });
        this.timezone.addEventListener('change', (data: string) => {
            this.setting.timeZone = data;
        })

        this.appendElement(timeGroup);
        this.appendElement(timezoneGroup);
    }

    getData() {}
}


export class DateTimePage extends Page {
    private form: TimeZoneForm | undefined;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private setting: SettingsController
    ) {
        super(history, {});
        this.init();
    }

    private init() {
        const settingListener = (status: string, data: any) => {
            switch (status) {
                case 'UPDATE_TIMEZONE':
                case 'UPDATE_HOUR12':
                    this.update('update', data);
                    break;
            }
        };

        this.setting.addChangeListener(settingListener);

        this.device.addEventListener('closeApp', () => {
            this.setting.removeChangeListener(settingListener);
        });
    }

    render(data: Setting) {
        this.form = new TimeZoneForm(this.device, this.mainArea, this.setting);
        this.form.render(data.data);
    }

    update(_: string, data: Setting) {
        this.removeAllEventListeners();
        this.mainArea.innerHTML = '';
        this.render(data);
    }


}