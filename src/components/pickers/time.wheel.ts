import { Popup } from "../popup";

export class TimeWheel extends Popup {
    private hours: number = 0;
    private minutes: number = 0;
    private seconds: number = 0;

    constructor() {
        super({ btnEnd: true }, 'timeWheelTemplate');
        const timeWheel = this.getElement('.timeWheel')!;

        this.mainArea = timeWheel;
    }

    render(data: number) {
        this.convertSeconds(data);
        // console.log(data);
        // console.log(this.hours, this.minutes, this.seconds);

        this.mainArea.innerHTML = `
            <div class="timeContainer">
                <div class="numberDisplay">hour</div>
                <div class="numberDisplay">min</div>
                <div class="numberDisplay">sec</div>
            </div>
        `;

        const SIZE = 40;
        const hourEl = this.createElement('div', ['numberContainer'], { 'data-number': 'hour' });
        for(let i = 0; i < 24; i++) {
            const number = this.createElement('div', ['number'], { 'data-number': i.toString() });
            number.textContent = i.toString();
            hourEl.appendChild(number);
        }
        this.addEventListener('scroll', () => {
            this.hours = Math.floor(hourEl.scrollTop / SIZE);
            this.data = this.getTotalMilliseconds();
        }, hourEl);
        this.mainArea.appendChild(hourEl);
        hourEl.scrollTop = SIZE * (this.hours + 1);

        const minEl = this.createElement('div', ['numberContainer'], { 'data-number': 'min' });
        for(let i = 0; i < 60; i++) {
            const number = this.createElement('div', ['number'], { 'data-number': i.toString() });
            number.textContent = i.toString();
            minEl.appendChild(number);
        }
        this.addEventListener('scroll', () => {
            this.minutes = Math.floor(minEl.scrollTop / SIZE);
            this.data = this.getTotalMilliseconds();
        }, minEl);
        this.mainArea.appendChild(minEl);
        minEl.scrollTop = SIZE * (this.minutes + 1);

        const secEl = this.createElement('div', ['numberContainer'], { 'data-number': 'sec' });
        for(let i = 0; i < 60; i++) {
            const number = this.createElement('div', ['number'], { 'data-number': i.toString() });
            number.textContent = i.toString();
            secEl.appendChild(number);
        }
        this.addEventListener('scroll', () => {
            this.seconds = Math.floor(secEl.scrollTop / SIZE);
            this.data = this.getTotalMilliseconds();
        }, secEl);
        this.mainArea.appendChild(secEl);
        secEl.scrollTop = SIZE * (this.seconds + 1);
    }

    update(data: number) {
        this.render(data);
    }
    private convertSeconds(milliseconds: number) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const seconds = totalSeconds % 60;

        this.hours = hours;
        this.minutes = minutes;
        this.seconds = seconds;
    }

    private getTotalMilliseconds() {
        return (this.hours * 3600 + this.minutes * 60 + this.seconds) * 1000;
    }
}