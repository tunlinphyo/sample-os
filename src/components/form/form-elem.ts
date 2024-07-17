import { SelectItem } from '../select';
import { Phone } from '../../stores/contact.store';
import { EventListenerInfo } from '../base';
import { Keyboard } from '../keyboard';
import { OSDate } from '../../utils/date';
import { OSArray } from '../../utils/arrays';
import { phoneNumbers } from "../../stores/history.store";
import { DatePickerData } from '../pickers/year.picker';
import { TimePickerData } from '../pickers/time.picker';
import { ChooseData, ChooseItem } from '../pickers/choose.picker';
import { DeviceController } from '../../device/device';

export interface InputConfig {
    type: 'text' | 'number' | 'textarea';
    label: string;
    defaultValue: string;
    keys?: { [key: string]: string }
}

export interface ToggleConfig {
    label: string;
    defaultValue: boolean;
}

export interface DateConfig {
    type: 'date' | 'date-time';
    label: string;
    defaultValue: Date;
}

export interface SelectConfig {
    label: string;
    defautValue: string;
    list: SelectItem[];
}

export interface ChooseConfig {
    label: string;
    defautValue: string[];
    list: ChooseItem[];
}

export interface AlarmConfig {
    label: string;
    defautValue: Date;
    allMinutes?: boolean;
}

export class CustomForm {
    private eventListeners: EventListenerInfo[] = [];

    constructor(public target: HTMLElement) {}

    protected replaceElement(oldElement: HTMLElement, newElement: HTMLElement) {
        if (oldElement.parentNode) {
            oldElement.parentNode.replaceChild(newElement, oldElement);
        } else {
            throw new Error('Parent node not found for the element to be replaced.');
        }
    }

    protected createElement<T extends HTMLElement>(elementName: string, classes: string[] = [], attributes: { [key: string]: string } = {}): T {
        const element = document.createElement(elementName) as T;

        if (classes.length > 0) {
            element.classList.add(...classes);
        }

        for (const key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                element.setAttribute(key, attributes[key]);
            }
        }

        return element;
    }

    protected getElement<T extends HTMLElement>(selector: string, parent: Document | HTMLElement = this.target): T {
        const element = parent.querySelector(selector) as T;
        if (!element) {
            throw new Error(`Element with selector ${selector} not found.`);
        }
        return element;
    }

    protected getAllElement<T extends HTMLElement>(selector: string, parent: Document | HTMLElement = this.target): NodeListOf<T> {
        const elements = parent.querySelectorAll(selector) as NodeListOf<T>;
        if (!elements) {
            throw new Error(`Element with selector ${selector} not found.`);
        }
        return elements;
    }

    protected dispatchFormEvent(eventName: string, data: any) {
        const event = new CustomEvent(eventName, { detail: data });
        this.target.dispatchEvent(event);
    }

    public addEventListener<T>(eventName: string, callback: (value: T) => void, target: EventTarget = this.target, options?: boolean | AddEventListenerOptions) {
        const listener = (event: Event) => {
            const value = (event as CustomEvent<string>).detail as T
            callback(value)
        }
        target.addEventListener(eventName, listener, options);
        if (options) this.eventListeners.push({ eventName, target, listener, options });
    }

    public removeEventListener(eventName: string, listener: EventListenerOrEventListenerObject, target: EventTarget = this.target, options?: boolean | AddEventListenerOptions) {
        target.removeEventListener(eventName, listener, options);
        this.eventListeners = this.eventListeners.filter(
            ev => ev.eventName !== eventName || ev.listener !== listener || ev.options !== options || ev.target !== target
        );
    }

    protected removeAllEventListeners() {
        for (const { eventName, target, listener, options } of this.eventListeners) {
            this.removeEventListener(eventName, listener, target, options);
        }
    }

    public toggle(show: boolean) {
        if (show) {
            this.target.classList.remove('hide')
        } else {
            this.target.classList.add('hide')
        }
    }
}

export class CustomInputForm extends CustomForm {
    private input: HTMLButtonElement;

    constructor(private device: DeviceController, target: HTMLElement, config: InputConfig) {
        super(target);
        this.input = this.getElement<HTMLButtonElement>('.inputValue');

        this.init(config)
    }

    private init(config: InputConfig) {
        this.keyboardOpen(config, this.input, (value) => {
            this.value = value
        }, config.keys)
    }

    // value
    get value() {
        return this.input.textContent || '';
    }
    set value(value: string) {
        this.input.textContent = value;
        this.dispatchFormEvent('change', value);
    }

    // error
    get error() {
        return this.input.classList.contains('error');
    }
    set error(isError: boolean) {
        if (isError) this.input.classList.add('error');
        else this.input.classList.remove('error');
    }

    public keyboardOpen(config: InputConfig, inputBox: HTMLButtonElement, callback: (value: string) => void, keys?: { [key: string]: string }) {
        inputBox.addEventListener('click', () => {
            const keyboard: Keyboard = {
                label: config.label,
                defaultValue: inputBox.innerText,
                type: config.type,
                btnEnd: 'check',
                keys,
            }
            this.device.keyboard.open(keyboard).then(callback);
        })
    }
}

export class CustomToggleForm extends CustomForm {
    private input: HTMLButtonElement;

    constructor(target: HTMLElement) {
        super(target);
        this.input = this.getElement<HTMLButtonElement>('.toggleButton');

        this.init()
    }

    private init() {
        this.input.addEventListener('click', () => {
            const status = this.input.dataset.toggle;
            this.value = status === 'on' ? false : true;
        })
    }

    // value
    get value() {
        const status = this.input.dataset.toggle || 'off';
        return status === 'on' ? true : false;
    }
    set value(value: boolean) {
        const status = value ? 'on' : 'off';
        this.input.dataset.toggle = status;
        this.dispatchFormEvent('change', value);
    }
}

export class CustomDateTimeForm extends CustomForm {
    private dateInput: HTMLButtonElement;
    private timeInput: HTMLButtonElement;
    private date: Date = new Date();

    constructor(private device: DeviceController, target: HTMLElement, config: DateConfig) {
        super(target);
        this.dateInput = this.getElement<HTMLButtonElement>('#dateInput');
        this.timeInput = this.getElement<HTMLButtonElement>('#timeInput');

        this.init(config);
    }

    private init(config: DateConfig) {
        this.value = config.defaultValue;

        if (config.type === 'date') this.toggleTime(false)

        this.dateInput.addEventListener('click', async () => {
            const result = (await this.device.datePicker.openPage('', { ...this.dateData }));
            if (result && typeof result != "boolean") this.dateData = result as DatePickerData;
        });
        this.timeInput.addEventListener('click', async () => {
            const result = (await this.device.timePicker.openPage<TimePickerData>('Time Picker', { ...this.timeData }));
            if (result && typeof result != "boolean") this.timeData = result as TimePickerData;
        })
    }

    // value
    get value() {
        return new Date(this.date);
    }
    set value(value: Date) {
        this.date = new Date(value);
        this.dateInput.textContent = OSDate.formatShortDate(value);
        this.timeInput.textContent = OSDate.getFormatTime(value, this.device.hour12);
        this.dispatchFormEvent('change', value);
    }

    // Date
    get dateData() {
        return new OSDate(this.value).getYearMonthDay();
    }
    set dateData(value: DatePickerData) {
        this.date.setFullYear(value.year);
        this.date.setMonth(value.month);
        this.date.setDate(value.day);

        this.value = this.date;
    }

    // Time
    get timeData() {
        return new OSDate(this.value).timeObject(true);
    }
    set timeData(value: TimePickerData) {
        const hours = this.device.hour12 ? OSDate.get24Hour(value.hour, value.isAm) : value.hour;
        this.date.setHours(hours);
        this.date.setMinutes(value.minute);

        this.value = this.date;
    }

    public toggleTime(show: boolean) {
        if (show) {
            this.timeInput.classList.remove('hide')
        } else {
            this.timeInput.classList.add('hide')
        }
    }
}

export class CustomTimePickerForm extends CustomForm {
    private input: HTMLButtonElement;
    private time: Date;
    private config: AlarmConfig;

    constructor(private device: DeviceController, target: HTMLElement, config: AlarmConfig) {
        super(target);
        this.config = config;
        this.input = this.getElement<HTMLButtonElement>('.inputValue');
        this.time = new Date(config.defautValue);

        this.init(config)
    }

    private init(config: AlarmConfig) {
        this.value = new Date(config.defautValue);
        this.addEventListener('click', async () => {
            const result = await this.device.timePicker.openPage(config.label, { ...this.timeData, allMinutes: config.allMinutes });
            if (result) this.timeData = result as TimePickerData;
        }, this.input, false)
    }

    // value
    get value() {
        return this.time;
    }
    set value(value: Date) {
        const timeData = new OSDate(value).timeObject(!this.config.allMinutes);
        this.time.setHours(value.getHours(), value.getMinutes(), 0, 0);
        if (this.device.hour12) {
            this.input.innerHTML = `<span>${this.getHour(timeData.hour)}:${String(timeData.minute).padStart(2, '0')}</span><small>${timeData.isAm ? 'AM' : 'PM'}</small>`;
        } else {
            this.input.innerHTML = `<span>${timeData.hour}:${String(timeData.minute).padStart(2, '0')}</span>`;
        }
        this.dispatchFormEvent('change', value);
    }

    get timeData() {
        return new OSDate(this.time).timeObject(!this.config.allMinutes);
    }
    set timeData(value: TimePickerData) {
        const date = new Date(this.time);
        date.setHours(
            this.device.hour12 ? OSDate.get24Hour(value.hour, value.isAm) : value.hour,
            value.minute, 0, 0
        );
        this.value = date;
    }

    private getHour(hours: number) {
        return String(hours % 12 || 12).padStart(2, '0');
    }
}

export class CustomSelectForm extends CustomForm {
    private input: HTMLButtonElement;
    private selectList: SelectItem[];

    constructor(private device: DeviceController, target: HTMLElement, config: SelectConfig) {
        super(target);
        this.input = this.getElement<HTMLButtonElement>('.selectButton');
        this.selectList = config.list;

        this.init(config)
    }

    private init(config: SelectConfig) {
        this.value = config.defautValue;
        this.input.addEventListener('click', async () => {
            const value = await this.device.selectList.openPage(config.label, config.list, 'contacts');
            if (value) this.value = value
        })
    }

    // value
    get value() {
        return this.input.dataset.value || ''
    }
    set value(value: string) {
        const item = this.selectList.find(item => item.value === value);
        if (item) {
            this.input.dataset.value = item.value;
            this.input.innerHTML = `${item.title} <span class="material-symbols-outlined">unfold_more</span>`;
            this.dispatchFormEvent('change', value);
        }
    }
}

export class CustomChooseForm extends CustomForm {
    private input: HTMLButtonElement;
    private _value: string[] = [];

    constructor(private device: DeviceController, target: HTMLElement, config: ChooseConfig, private customDisplay?: (list: string[]) => string) {
        super(target);
        this.input = this.getElement<HTMLButtonElement>('.inputValue');

        this.init(config)
    }

    private init(config: ChooseConfig) {
        this.value = config.defautValue;
        this.input.addEventListener('click', async () => {
            const value = await this.device.chooseList.openPage<any>(config.label, { list: config.list, selected: config.defautValue } satisfies ChooseData)
            if (value) {
                this.value = value as string[];
            }
        })
    }

    // value
    get value() {
        return this._value;
    }
    set value(value: string[]) {
        this._value = value;
        this.input.textContent = this.customDisplay ? this.customDisplay(value) : value.join(',');
        this.dispatchFormEvent('change', value);
    }
}

export class PhoneLabelHandler {
    public static addPhone(phones: Phone[], number: string = '') {
        const phoneTypes: string[] = [
            "Mobile",
            "Home",
            "Work",
            "Company"
        ];

        const selected = phones.map(item => item.type);
        const type = OSArray.pickFirst<string>(phoneTypes, selected);

        return {
            type: type || 'Mobile',
            number,
        };
    }
}

export class CustomPhoneForm extends CustomForm {
    private group: HTMLElement;
    private phones: Phone[];

    constructor(private device: DeviceController, target: HTMLElement, config: Phone[]) {
        super(target);
        this.phones = config;
        this.group = this.getElement('#phoneList');
        this.init();
    }

    init() {
        this.renderPhones();
        this.addEventListener<Phone>('phoneRemove', (phone) => {
            this.phones = this.phones.filter(item => item.type !== phone.type)
            // this.renderPhones(this.phones)
        })
        this.addEventListener<Phone>('phoneAdd', () => {
            const phone = PhoneLabelHandler.addPhone(this.phones);
            this.phones.push(phone);
        })
    }

    get value(): Phone[] {
        return this.phones;
    }
    set value(action: { type: 'add' | 'remove' | 'update', phone: Phone }) {
        if (action.type === 'add') {
            this.phones.push(action.phone);
        } else if (action.type === 'remove') {
            this.phones = this.phones.filter(i => i.type !== action.phone.type);
        } else if (action.type === 'update') {
            this.phones = this.phones.map(i => i.type === action.phone.type ? action.phone : i)
        }
        this.renderPhones()
        this.dispatchFormEvent('change', this.phones);
    }

    private addPhone() {
        const phone = PhoneLabelHandler.addPhone(this.phones);
        this.value = { type: 'add', phone }
    }

    renderPhones() {
        this.removeAllEventListeners();
        this.group.innerHTML = '';
        this.phones.forEach(phone => {
            const phoneInput = this.createElement('div', ['phoneInput'])

            const removeButton = this.createElement('button', ['removeButton'])
            removeButton.innerHTML = '<span class="material-symbols-outlined">do_not_disturb_on</span>'

            this.addEventListener('click', () => {
                this.value = { type: 'remove', phone }
            }, removeButton, true)

            const phoneType = this.createElement('div', ['phoneType'])
            phoneType.innerText = phone.type

            const createInput = this.createElement<HTMLButtonElement>('button', ['inputValue'])
            createInput.innerText = phone.number

            this.keyboardOpen('Phone Number', createInput, (value: string) => {
                const updated: Phone = { ...phone, number: value || '' }
                this.value = { type: 'update', phone: updated }
            }, phoneNumbers)

            phoneInput.appendChild(removeButton)
            phoneInput.appendChild(phoneType)
            phoneInput.appendChild(createInput)

            this.group.appendChild(phoneInput)
        })
        if (this.phones.length < 4) {
            const addNewPhone = this.createElement('button', ['addNew'])
            addNewPhone.innerHTML = '<span class="material-symbols-outlined">add_circle</span> add phone'

            this.addEventListener('click', () => {
                this.addPhone()
            }, addNewPhone, true)

            this.group.appendChild(addNewPhone)
        }
    }

    public keyboardOpen(label: string, inputBox: HTMLButtonElement, callback: (value: string) => void, keys?: { [key: string]: string }) {
        inputBox.addEventListener('click', () => {
            const keyboard: Keyboard = {
                label,
                defaultValue: inputBox.innerText,
                type: 'number',
                btnEnd: 'check',
                keys,
            }
            this.device.keyboard.open(keyboard).then(callback);
        })
    }
}
