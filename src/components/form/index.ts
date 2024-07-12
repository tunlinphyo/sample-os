import { Phone } from "../../stores/contact.store";
import { DeviceController } from "../../device/device";
import { OSArray } from "../../utils/arrays";
import { BaseComponent } from "../base";
import { AlarmConfig, InputConfig, ToggleConfig, DateConfig, ChooseConfig, CustomChooseForm, CustomDateTimeForm, CustomInputForm, CustomPhoneForm, CustomSelectForm, CustomTimePickerForm, CustomToggleForm, SelectConfig } from "./form-elem";

export interface CustomEvent<T> extends Event {
    detail: T;
}

export type EventListenerInfo = {
    target: EventTarget;
    listener: EventListenerOrEventListenerObject;
    options?: boolean | AddEventListenerOptions;
};

export abstract class FormComponent extends BaseComponent {

    constructor(private device: DeviceController, template: string, parent: HTMLElement) {
        super(template, parent)
    }

    abstract render(): void;
    abstract getData(): any;

    public cleanup() {
        this.getElement('.formGroup').innerHTML = ''
        this.removeAllEventListeners()
    }

    public input(config: InputConfig, parent?: HTMLElement) {
        const inputGroup = this.createElement('div', ['inputGroup'])
        const inputBox = this.createElement<HTMLButtonElement>('button', ['inputValue'], {
            type: 'button',
            'data-type': config.type,
            'data-label': config.label,
        })
        inputBox.textContent = config.defaultValue;

        inputGroup.appendChild(inputBox)

        this.appendElement(inputGroup, parent)
        return new CustomInputForm(this.device, inputGroup, config)
    }

    public toggle(config: ToggleConfig, parent?: HTMLElement) {
        const toggleGroup = this.createElement('div', ['toggleGroup'])
        const labelEL = this.createElement('div', ['inputLabel'])
        labelEL.textContent = config.label
        const toggleButton = this.createElement<HTMLButtonElement>('button', ['toggleButton'], {
            type: 'button',
            'data-toggle':  config.defaultValue ? 'on' : 'off'
        })

        toggleGroup.appendChild(labelEL)
        toggleGroup.appendChild(toggleButton)

        this.appendElement(toggleGroup, parent)
        return new CustomToggleForm(toggleGroup)
    }

    public dateTime(config: DateConfig, parent?: HTMLElement) {
        const dateTimeGroup = this.createElement('div', ['dateTimeGroup'])
        const labelEL = this.createElement('div', ['inputLabel'])
        labelEL.textContent = config.label

        const dateInputGroup = this.createElement('div', ['dateInputGroup'])

        const dateBox = this.createElement<HTMLButtonElement>('button', ['inputValue'], { type: 'button', id: 'dateInput' })
        dateInputGroup.appendChild(dateBox)

        const timeBox = this.createElement<HTMLButtonElement>('button', ['inputValue'], { type: 'button', id: 'timeInput' })
        dateInputGroup.appendChild(timeBox)

        dateTimeGroup.appendChild(labelEL)
        dateTimeGroup.appendChild(dateInputGroup)

        this.appendElement(dateTimeGroup, parent)
        return new CustomDateTimeForm(this.device, dateTimeGroup, config)

    }

    public select(config: SelectConfig, parent?: HTMLElement) {
        const toggleGroup = this.createElement('div', ['toggleGroup'])
        const labelEL = this.createElement('div', ['inputLabel'])
        labelEL.textContent = config.label
        const toggleButton = this.createElement<HTMLButtonElement>('button', ['selectButton'], { type: 'button', 'data-value': config.defautValue })

        toggleGroup.appendChild(labelEL)
        toggleGroup.appendChild(toggleButton)

        this.appendElement(toggleGroup, parent)
        return new CustomSelectForm(this.device, toggleGroup, config)
    }

    public choose(config: ChooseConfig, parent?: HTMLElement) {
        const inputGroup = this.createElement('div', ['inputGroup'])
        const inputBox = this.createElement<HTMLButtonElement>('button', ['inputValue'], { type: 'button', 'data-label': config.label })
        const iconEl = this.createElement('div', ['inputIcon'])
        iconEl.innerHTML = `<span class="material-symbols-outlined">unfold_more</span>`;

        inputGroup.appendChild(inputBox)
        inputGroup.appendChild(iconEl)

        this.appendElement(inputGroup, parent)
        return new CustomChooseForm(this.device, inputGroup, config)
    }

    public chooseWeek(config: ChooseConfig, parent?: HTMLElement) {
        const inputGroup = this.createElement('div', ['inputGroup'])
        const inputBox = this.createElement<HTMLButtonElement>('button', ['inputValue'], { type: 'button', 'data-label': config.label })
        const iconEl = this.createElement('div', ['inputIcon'])
        iconEl.innerHTML = `<span class="material-symbols-outlined">unfold_more</span>`;

        inputGroup.appendChild(inputBox)
        inputGroup.appendChild(iconEl)

        this.appendElement(inputGroup, parent)
        return new CustomChooseForm(this.device, inputGroup, config, (list) => {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            if (list.length == 7) {
                return 'Every day';
            } else if (OSArray.isEqualItems(list, ['0', '6'])) {
                return 'Weekends';
            } else if (OSArray.isEqualItems(list, ['1', '2', '3', '4', '5'])) {
                return 'Weekdays';
            } else {
                return list.sort().map(item => days[parseInt(item)]).join(', ');
            }
        })
    }

    public phones(config: Phone[], parent?: HTMLElement) {
        const phoneInputGroup = this.createElement('div', ['phoneInputGroup'], { id: 'phoneInputs' })
        const phoneList = this.createElement('div', [], { id: 'phoneList' })

        phoneInputGroup.appendChild(phoneList)

        this.appendElement(phoneInputGroup, parent)
        return new CustomPhoneForm(this.device, phoneInputGroup, config);
    }

    public alarmTime(config: AlarmConfig, parent?: HTMLElement) {
        const alarmPicker = this.createElement('div', ['alarmPicker'])
        const inputBox = this.createElement<HTMLButtonElement>('button', ['inputValue'], { type: 'button' })

        alarmPicker.appendChild(inputBox)

        this.appendElement(alarmPicker, parent)
        return new CustomTimePickerForm(this.device, alarmPicker, config)
    }

    public addSection() {
        const dateSection = this.createElement('div', ['formSection'])
        this.appendElement(dateSection)
    }

    public appendElement(inputGroup: HTMLElement, parent?: HTMLElement) {
        if (parent) parent.appendChild(inputGroup)
        else this.getElement('.formGroup').appendChild(inputGroup)
    }

    public updateElement(elementSelector: string, inputGroup: HTMLElement) {
        const oldElement = this.getElement(elementSelector)
        if (oldElement) {
            this.replaceElement(oldElement, inputGroup)
        }
    }

    public createGroup() {
        return this.createElement('div', ['inputGroupContainer'])
    }
}