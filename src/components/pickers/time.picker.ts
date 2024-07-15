import { DeviceController } from "../../device/device";
import { Popup } from "../popup";

export interface TimePickerData {
    hour: number;
    minute: number;
    isAm: boolean;
    allMinutes?: boolean;
}

export class TimePicker extends Popup {
    private time = {
        hour: 0,
        minute: 0,
        ampm: 0,
    };
    constructor(
        private device: DeviceController
    ) {
        super({ btnEnd: true }, 'timeWheelTemplate');
        const timeWheel = this.getElement('.timeWheel')!;
        timeWheel.classList.add('noLabel');

        this.mainArea = timeWheel;
    }

    render(data: TimePickerData) {
        console.log("TIME_DATA", data);
        const hours = this.device.hour12 ? data.hour % 12 : data.hour;
        this.time.hour = hours;
        this.time = {
            hour: hours || 12,
            minute: data.allMinutes ? data.minute : Math.round(data.minute / 5),
            ampm: data.isAm ? 0 : 1
        }

        this.mainArea.innerHTML = `
            <div class="timeContainer"></div>
        `;

        const SIZE = 40;
        const hourEl = this.createElement('div', ['numberContainer'], { 'data-number': 'hour' });
        for(let i = 1; i <= (this.device.hour12 ? 12 : 24); i++) {
            const number = this.createElement('div', ['number'], { 'data-number': (i).toString() });
            number.textContent = (i).toString();
            hourEl.appendChild(number);
        }
        this.addEventListener('scroll', () => {
            this.time.hour = Math.floor(hourEl.scrollTop / SIZE) + 1;
            this.data = this.getData(data.allMinutes);
        }, hourEl);
        this.mainArea.appendChild(hourEl);
        hourEl.scrollTop = SIZE * (this.time.hour);

        const minEl = this.createElement('div', ['numberContainer'], { 'data-number': 'min' });
        console.log('ALL_MINUTES', data.allMinutes);
        if (data.allMinutes) {
            for(let i = 0; i < 60; i++) {
                const number = this.createElement('div', ['number'], { 'data-number': i.toString() });
                number.textContent = i.toString().padStart(2, '0');
                minEl.appendChild(number);
            }
        } else {
            for(let i = 0; i < 60; i += 5) {
                const number = this.createElement('div', ['number'], { 'data-number': i.toString() });
                number.textContent = i.toString().padStart(2, '0');
                minEl.appendChild(number);
            }
        }
        this.addEventListener('scroll', () => {
            this.time.minute = Math.floor(minEl.scrollTop / SIZE);
            console.log(Math.floor(minEl.scrollTop / SIZE));
            this.data = this.getData(data.allMinutes);
        }, minEl);
        this.mainArea.appendChild(minEl);
        minEl.scrollTop = SIZE * (this.time.minute + 1);

        if (this.device.hour12) {
            const secEl = this.createElement('div', ['numberContainer'], { 'data-number': 'sec' });
            for(let i = 0; i < 2; i++) {
                const number = this.createElement('div', ['number'], { 'data-number': i.toString() });
                number.textContent = i ? 'PM' : 'AM';
                secEl.appendChild(number);
            }
            this.addEventListener('scroll', () => {
                this.time.ampm = Math.floor(secEl.scrollTop / SIZE);
                this.data = this.getData(data.allMinutes);
            }, secEl);
            this.mainArea.appendChild(secEl);
            secEl.scrollTop = SIZE * (this.time.ampm + 1);
        }
    }

    update(data: TimePickerData) {
        this.render(data);
    }

    private getData(allMinutes: boolean | undefined) {
        return {
            hour: this.time.hour,
            minute: allMinutes ? this.time.minute : this.time.minute * 5,
            isAm: !this.time.ampm
        }
    }
}
