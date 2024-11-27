import { PhoneController } from "../../controllers/phone.controller";
import { DeviceController } from "../../device/device";
import { TimerData } from "../../stores/clock.store";
import { OSDate } from "../../utils/date";
import { BaseSystem } from "../system";


export class TimerAlert extends BaseSystem<TimerData> {
    private timeout: number | null = null;

    constructor(
        device: DeviceController,
        private phone: PhoneController,
    ) {
        super({ btnCenter: 'close', btnStart: 'timer_play' }, device, 'timer');
    }

    render(_: TimerData): Promise<boolean> {
        return new Promise((resolve) => {
            this.createUI();

            this.timeout = setTimeout(() => {
                this.close();
                resolve(false);
            }, 30 * 1000);

            this.addEventListener('click', async () => {
                if (this.timeout) clearTimeout(this.timeout);
                this.close();
                resolve(false);
            }, this.btnCenter);

            this.addEventListener('click', async () => {
                if (this.timeout) clearTimeout(this.timeout);
                this.close();
                resolve(true);
            }, this.btnStart);

            this.phone.addChangeListener((status: string, data: any) => {
                if (status === 'IN_CALL' && data) {
                    console.log('IN_CALL::TIMER')
                    if (this.timeout) clearTimeout(this.timeout);
                    this.close();
                    resolve(false);
                }
            });
        });
    }

    createUI() {
        this.mainArea.innerHTML = "";
        this.component.classList.add('timerPage');
        const flexCenter = this.createFlexCenter();

        const alarmContainer = this.createElement('div', ['alarmContainer']);

        const snoozeIcon = this.createElement('div', ['snoozeIcon']);
        const iconEl = this.createElement('span', ['material-symbols-outlined', 'fill-icon']);
        iconEl.innerText = 'timer';
        snoozeIcon.appendChild(iconEl);

        const alarmLabel = this.createElement('div', ['alarmLabel']);
        alarmLabel.innerText = 'Timer done';

        const alarmTime = this.createElement('div', ['alarmTime']);
        alarmTime.innerText = OSDate.formatTime(new Date(), this.device.hour12, this.device.timeZone);

        alarmContainer.appendChild(snoozeIcon);
        alarmContainer.appendChild(alarmLabel);
        alarmContainer.appendChild(alarmTime);

        flexCenter.appendChild(alarmContainer);
        this.mainArea.appendChild(flexCenter);
    }
}