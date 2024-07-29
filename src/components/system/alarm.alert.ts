import { DeviceController } from "../../device/device";
import { Alarm } from "../../stores/alarm.store";
import { OSDate } from "../../utils/date";
import { BaseSystem } from "../system";


export class AlarmAlert extends BaseSystem<Alarm> {
    private timeout: number | null = null;

    constructor(device: DeviceController) {
        super({ btnCenter: 'close', btnStart: 'snooze' }, device, 'alarm');
    }

    render(data: Alarm): Promise<Alarm | false> {
        return new Promise((resolve) => {
            this.createUI(data);

            this.timeout = setTimeout(() => {
                this.close()
                resolve(false)
            }, 2 * 60 * 1000);

            this.addEventListener('click', async () => {
                if (this.timeout) clearTimeout(this.timeout);
            }, this.btnCenter);

            this.addEventListener('click', async () => {
                if (this.timeout) clearTimeout(this.timeout);
                this.close();
                resolve(data);
            }, this.btnStart);

        });
    }

    createUI(data: Alarm) {
        this.mainArea.innerHTML = "";
        this.component.classList.add('alarmPage');
        const flexCenter = this.createFlexCenter();

        const alarmContainer = this.createElement('div', ['alarmContainer']);

        const snoozeIcon = this.createElement('div', ['snoozeIcon']);
        const iconEl = this.createElement('span', ['material-symbols-outlined', 'fill-icon']);
        iconEl.innerText = 'snooze';
        snoozeIcon.appendChild(iconEl);

        const alarmLabel = this.createElement('div', ['alarmLabel']);
        alarmLabel.innerText = data.label;

        const alarmTime = this.createElement('div', ['alarmTime']);
        alarmTime.innerText = OSDate.formatTime(data.time, this.device.hour12, this.device.timeZone);

        alarmContainer.appendChild(snoozeIcon);
        alarmContainer.appendChild(alarmLabel);
        alarmContainer.appendChild(alarmTime);

        flexCenter.appendChild(alarmContainer);
        this.mainArea.appendChild(flexCenter);

    }
}