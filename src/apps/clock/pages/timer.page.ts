import { Page } from "../../../components/page";
import { ClockController } from "../../../controllers/clock.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { TimerData } from "../../../stores/clock.store";

export class TimerPage extends Page {
    private timerData: TimerData | undefined;

    private clockRing: HTMLElement | undefined;
    private timeDisplay: HTMLElement | undefined;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private clock: ClockController
    ) {
        super(history, { btnStart: 'RESET', btnEnd: 'START' });
        this.init();
    }

    init() {
        this.addEventListener('click', async (event) => {
            const btn = event.target as HTMLButtonElement;
            let status: string = '';
            if (btn.dataset.status === 'playing') status = 'stop';
            else status = 'start';
            if (!this.timerData) return;
            this.updateTimer({ status: status, data: this.timerData });
        }, this.btnEnd, false);

        this.addEventListener('click', () => {
            if (!this.timerData) return;
            this.updateTimer({ status: 'reset', data: this.timerData });
        }, this.btnStart, false);

        this.listen('openPage', () => {
            this.update('update', this.clock.remaining, this.clock.duration);
        });

        const clockListener = (status: string, data: any) => {
            switch (status) {
                case 'TIMER_UPDATE':
                    this.update('update', data.remainingTime, data.duration);
                    this.updateButton(data);
                    break;
            }
        }

        this.clock.addChangeListener(clockListener);

        this.device.addEventListener('closeApp', () => {
            this.clock.removeChangeListener(clockListener);
        });
    }

    render(data: TimerData) {
        this.timerData = data;
        this.mainArea.innerHTML = `
            <div class="scrollArea">
                <div class="clockArea">
                    <div class="clockRing"></div>
                </div>
            </div>
        `;

        this.clockRing = this.getElement('.clockRing');
        this.timeDisplay = this.createElement('button', ['timeDisplay']);

        if (data) {
            this.updateUI(data.remainingTime, data.duration);
            this.updateButton(data);
        }

        this.addEventListener('click', async () => {
            const result = (await this.device.timeWheel.openPage('Timer', data.duration));
            if (typeof result !== 'boolean' && this.timerData) {
                this.timerData.duration = result;
                this.updateTimer({ status: 'reset', data: this.timerData });
            }
        }, this.timeDisplay);

        const ring = this.getElement('.clockRing');

        ring.appendChild(this.timeDisplay);
    }

    update(_: string, remainingTime: number, duration: number) {
        if (!this.isActive) return;
        this.updateUI(remainingTime, duration);
    }

    updateButton(data: TimerData) {
        if (!this.btnEnd) return;
        if (data.running) {
            this.btnEnd.dataset.status = 'playing';
            this.btnEnd.innerHTML = 'STOP';
        } else if (data.remainingTime === data.duration) {
            this.btnEnd.dataset.status = 'stopped';
            this.btnEnd.innerHTML = 'START';
        } else {
            this.btnEnd.dataset.status = 'paused';
            this.btnEnd.innerHTML = 'RESUME';
        }
    }

    private updateTimer({ status, data }: { status: string, data: TimerData}) {
        console.log(status, data);
        switch (status) {
            case 'start':
                this.clock.timerStart();
                break;
            case 'stop':
                this.clock.timerStop();
                break;
            case 'reset':
                this.clock.timerReset(data.duration);
                break;
        }
    }

    private updateUI(remainingTime: number, duration: number) {
        const percentage = remainingTime / duration * 100;
        const result = this.convertMilliseconds(remainingTime);
        if (result.hours) {
            this.timeDisplay!.classList.add('withHours');
            this.timeDisplay!.textContent = `${this.pad(result.hours)}:${this.pad(result.minutes)}:${this.pad(result.seconds)}`;
        } else {
            this.timeDisplay!.classList.remove('withHours');
            this.timeDisplay!.textContent = `${this.pad(result.minutes)}:${this.pad(result.seconds)}`;
        }
        if ((result.hours || result.minutes || result.seconds) === 0) {
            this.clockRing!.style.background = `conic-gradient(var(--stoke-color) 100%, var(--fill-color) 0)`;
        } else {
            this.clockRing!.style.background = `conic-gradient(var(--fill-color) ${percentage}%, var(--stoke-color) 0)`;
        }
    }

    public convertMilliseconds(totalMilliseconds: number) {
        const totalSeconds = Math.round(totalMilliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return { hours, minutes, seconds };
    }

    public pad(num: number): string {
        return num.toString().padStart(2, '0');
    }
}