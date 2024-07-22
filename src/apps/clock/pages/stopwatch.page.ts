import { Page } from "../../../components/page";
import { ClockController } from "../../../controllers/clock.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";

interface ClockFormat {
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
}

export class StopwatchPage extends Page {
    private id: string | undefined;
    private startTime: number | null = null;
    private stopTime: number | null = null;
    private running: boolean = false;
    private laps: number[] = [];
    private timerInterval: number | null = null;

    private hourHand: HTMLElement | undefined;
    private minuteHand: HTMLElement | undefined;
    private secondHand: HTMLElement | undefined;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private clock: ClockController
    ) {
        super(history, { btnStart: 'LAP', btnEnd: 'START' });

        this.component.classList.add('stopwatchPage');

        this.init();
    }

    private init() {
        this.addEventListener('click', (event) => {
            const btn = event.target as HTMLButtonElement;
            if (btn.dataset.status === 'cancel') {
                this.reset();
                btn.dataset.status = 'laps';
                btn.innerHTML = 'LAP';
            } else {
                this.lap();
            }
            this.renderLap();
            this.dispatchCustomEvent('stopWatchUpdate', this.getStopwatchData());
        }, this.btnStart, false);

        this.addEventListener('click', (event) => {
            const btn = event.target as HTMLButtonElement;
            if (btn.dataset.status === 'play') {
                btn.dataset.status = 'pause';
                btn.innerHTML = 'START';
                if (this.btnStart) {
                    this.btnStart.dataset.status = 'cancel';
                    this.btnStart.innerHTML = 'RESET';
                }
                this.stop();
            } else {
                btn.dataset.status = 'play';
                btn.innerHTML = 'STOP';
                if (this.btnStart) {
                    this.btnStart.dataset.status = 'laps';
                    this.btnStart.innerHTML = 'LAP';
                }
                this.start();
            }
            const data = this.getStopwatchData();
            if (!data) return;
            this.clock.updateStopwatch(data);
        }, this.btnEnd, false);

        const updateStopwatch = () => {
            const data = this.getStopwatchData();
            if (!data) return;
            this.clock.updateStopwatch(data);
        }

        this.listen('pageClose', updateStopwatch);

        this.device.addEventListener('closeApp', () => {
            this.clock.removeChangeListener(updateStopwatch);
        });
    }

    render(data?: StopwatchPage) {
        this.mainArea.innerHTML = `
            <div class="scrollArea">
                <div class="clockArea">
                    <div class="clock">
                        <div class="clock-face">
                            <div class="hand hour-hand"></div>
                            <div class="hand minute-hand"></div>
                            <div class="hand second-hand"></div>
                        </div>
                        <div class="currentTime" id="currentTime">00:00:00:00</div>
                    </div>
                </div>
                <div class="timeLaps"></div>
            </div>`;

        if (data) {
            this.id = data.id;
            this.startTime = data.startTime;
            this.stopTime = data.stopTime;
            this.running = data.running;
            this.laps = data.laps;
            this.timerInterval = data.timerInterval;
        }

        this.hourHand = this.getElement('.hour-hand');
        this.minuteHand = this.getElement('.minute-hand');
        this.secondHand = this.getElement('.second-hand');

        if (this.running) {
            if (this.btnEnd) {
                this.btnEnd.dataset.status = 'play';
                this.btnEnd.innerHTML = 'STOP';
            }
            this.updateTime();
        } else if (this.startTime) {
            if (this.btnStart) {
                this.btnStart.dataset.status = 'cancel';
                this.btnStart.innerHTML = 'RESET';
            }

        }

        this.writeCurrentTimeToHtml('currentTime');
        this.renderLap();
    }

    renderLap() {
        const timeLaps = this.getElement('.timeLaps');
        timeLaps.innerHTML = '';

        const laps = this.getLaps();
        if (laps.length) {
            timeLaps.classList.add('bordered');
        } else {
            timeLaps.classList.remove('bordered');
        }
        
        for(const lap of laps) {
            const {hours, minutes, seconds, milliseconds} = this.getTimes(lap.time);
            const timelLap = this.createElement('div', ['timeLap'])
            timelLap.innerHTML = `<span>Lap ${lap.index}</span><span class="lapTimes">${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}:${this.pad(milliseconds)}</span>`;

            timeLaps.appendChild(timelLap);
        }
    }

    update() {
    }

    private getStopwatchData() {
        return {
            id: this.id || '',
            startTime: this.startTime,
            stopTime: this.stopTime,
            running: this.running,
            laps: this.laps,
            timerInterval: this.timerInterval,
        }
    }

    private getLaps() {
        const laps:{ time: number, index: number }[] = [];
        let total = 0, index = 0;
        for(const lap of this.laps) {
            total += lap;
            index += 1;
            laps.push({
                time: total,
                index: index
            })
        }
        return laps.reverse();
    }

    private renderClock({ hours, minutes, seconds }: ClockFormat) {
        const secondsDegrees = ((seconds / 60) * 360) + 90; // Offset by 90 degrees
        this.secondHand!.style.transform = `rotate(${secondsDegrees}deg)`;

        const minutesDegrees = ((minutes / 60) * 360) + ((seconds / 60) * 6) + 90;
        this.minuteHand!.style.transform = `rotate(${minutesDegrees}deg)`;

        const hoursDegrees = ((hours / 12) * 360) + ((minutes / 60) * 30) + 90;
        this.hourHand!.style.transform = `rotate(${hoursDegrees}deg)`;
    }

    private start(): void {
        if (!this.running) {
            this.startTime = Date.now() - (this.stopTime ? this.stopTime - this.startTime! : 0);
            this.stopTime = null;
            this.running = true;
            this.updateTime();
        }
    }

    private stop(): void {
        if (this.running) {
            this.stopTime = Date.now();
            this.running = false;
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
        }
    }

    private lap(): void {
        if (this.running) {
            const now = Date.now();
            const lapTime = now - (this.startTime! + (this.laps.length > 0 ? this.laps.reduce((a, b) => a + b, 0) : 0));
            this.laps.push(lapTime);
        }
    }

    private reset(): void {
        this.startTime = null;
        this.stopTime = null;
        this.running = false;
        this.laps = [];
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.writeCurrentTimeToHtml('currentTime');
    }

    private getElapsedTime(): number {
        if (this.running) {
            return Date.now() - this.startTime!;
        } else if (this.startTime !== null && this.stopTime !== null) {
            return this.stopTime - this.startTime;
        } else {
            return 0;
        }
    }

    private writeCurrentTimeToHtml(elementId: string): void {
        const element = this.getElement(`#${elementId}`);
        if (element) {
            const elapsedTime = this.getElapsedTime();
            const time = this.getTimes(elapsedTime)

            this.renderClock(time);
            element.textContent = `${this.pad(time.hours)}:${this.pad(time.minutes)}:${this.pad(time.seconds)}:${this.pad(time.milliseconds)}`;
        }
    }

    private getTimes(time: number): ClockFormat {
        const hours = Math.floor(time / 3600000);
        const minutes = Math.floor((time % 3600000) / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        const milliseconds = Math.floor((time % 1000) / 16.6667);

        return { hours, minutes, seconds, milliseconds };
    }

    private pad(num: number): string {
        return num.toString().padStart(2, '0');
    }

    private updateTime(): void {
        this.timerInterval = setInterval(() => {
            this.writeCurrentTimeToHtml('currentTime');
        }, 1000 / 60);
    }
}
