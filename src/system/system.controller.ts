import { ClockController } from "../controllers/clock.controller";
import { DeviceController } from "../device/device";
import { OSDate } from "../utils/date";


export class SystemController {
    constructor(
        private device: DeviceController,
        private clock: ClockController
    ) {
        this.renderListeners()
    }

    private renderListeners() {
        this.clock.addChangeListener(async (status: string) => {
            if (status === 'UPDATE_CLOCK') {
                this.updateClock();
            }
        });

        this.device.addEventListener('systemOpenStatus', (event) => {
            // @ts-ignore
            const data: boolean = event.detail.data;
            if (data) this.updateClock();
        });
    }

    private updateClock() {
        const clockEl = document.getElementById('dateTime') as HTMLElement;
        clockEl.textContent = OSDate.getCustomTime(new Date(), this.device.hour12, this.device.timeZone);
    }
}