import { FormComponent } from "../../../components/form";
import { CustomChooseForm, CustomInputForm, CustomTimePickerForm } from "../../../components/form/form-elem";
import { alarmNames } from "../../../components/keyboard/consts";
import { Modal } from "../../../components/modal";
import { ClockController } from "../../../controllers/clock.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Alarm, RepeatOption } from "../../../stores/alarm.store";

class AlarmForm extends FormComponent {
    private alarm: Alarm | undefined;

    private time: CustomTimePickerForm | undefined;
    private label: CustomInputForm | undefined;
    private repeat: CustomChooseForm | undefined;

    constructor(
        device: DeviceController,
        parent: HTMLElement
    ) {
        super(device, 'eventForm', parent)
        this.init()
    }

    private init() { }

    render(data?: Alarm) {
        if (data) {
            this.alarm = data;
        } else {
            this.alarm = {
                id: '',
                time: new Date(),
                label: 'Alarm',
                repeat: [],
                active: true
            }
        }

        this.time = this.alarmTime({
            label: 'Alarm',
            defautValue: this.alarm.time,
            allMinutes: true,
        })

        const groupEl = this.createGroup()

        this.label = this.input({
            label: 'Label',
            type: 'text',
            defaultValue: this.alarm.label,
            keys: alarmNames,
        }, groupEl)
        this.repeat = this.chooseWeek({
            label: 'Repeat',
            defautValue: this.alarm.repeat.map(item => item.toString()),
            list: [
                {
                    label: 'Sunday',
                    value: '0'
                },
                {
                    label: 'Monday',
                    value: '1'
                },
                {
                    label: 'Tuesday',
                    value: '2'
                },
                {
                    label: 'Wendesday',
                    value: '3'
                },
                {
                    label: 'Thursday',
                    value: '4'
                },
                {
                    label: 'Friday',
                    value: '5'
                },
                {
                    label: 'Saturday',
                    value: '6'
                },
            ]
        }, groupEl)

        this.appendElement(groupEl);
    }

    getData() {
        const alarm: Alarm = {
            id: this.alarm?.id || '',
            label: this.label?.value || '',
            time: this.time?.value || new Date(),
            repeat: this.repeat?.value.map(item => parseInt(item) as RepeatOption) || [],
            active: true,
        }
        return alarm;
    }
}

export class AlarmEdit extends Modal {
    private form: AlarmForm | undefined;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private clock: ClockController
    ) {
        super(history, { btnStart: 'delete', btnEnd: 'check' })
        this.init()
    }

    private init() {
        this.addEventListener('click', () => {
            const data = this.form?.getData();
            if (!data) return;
            this.clock.updateAlarm(data);
        }, this.btnEnd, false);

        this.addEventListener('click', () => {
            const data = this.form?.getData();
            if (!data) return;
            this.clock.deleteAlarm(data);
        }, this.btnStart, false);

        const clockListener = (status: string) => {
            switch (status) {
                case 'UPDATE_ALARM':
                    this.closePage();
                    break;
            }
        };

        this.clock.addChangeListener(clockListener);

        this.device.addEventListener('closeApp', () => {
            this.clock.removeChangeListener(clockListener);
        });
    }

    render(data: Alarm) {
        if (data?.id) this.btnStart?.classList.remove('hide')
        else this.btnStart?.classList.add('hide')
        this.form = new AlarmForm(this.device, this.mainArea)
        this.form.render(data)
    }

    update() {}
}
