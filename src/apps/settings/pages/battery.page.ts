import { Page } from "../../../components/page";
import { BatteryManager, Navigator } from "../../../device/battery";
import { HistoryStateManager } from "../../../device/history.manager";
import { OSDate } from "../../../utils/date";

export class BatteryPage extends Page {
    private charging: boolean = false;
    private level: number = 0;
    private chargingTime: number = Infinity;
    private dischargingTime: number = Infinity;

    constructor(
        history: HistoryStateManager
    ) {
        super(history, {});
        this.initBatteryStatus();
    }

    render() {
        if (!this.isSupport()) {
            return this.renderNotSupport();
        }

        const scrollArea = this.createScrollArea();

        const percentage = Math.round(this.level * 100);

        const barreryContainer = this.createElement('div', ['barreryContainer']);

        const batteryPercentage = this.createElement('div', ['batteryPercentage']);
        batteryPercentage.innerHTML = `
            <span>${percentage}</span>
            <small>%</small>
        `;

        const percentageContainer = this.createElement('div', ['percentageContainer']);
        const percentageBar = this.createElement('div', ['percentageBar'], {
            style: `width: ${percentage}%`,
        });
        percentageContainer.appendChild(percentageBar);

        const chargingStatus = this.createElement('div', ['chargingStatus']);
        let status = 'Not charging';
        if (isFinite(this.chargingTime)) {
            const { hours, minutes } = OSDate.secondsToHoursMinutes(this.chargingTime);
            status = `Charging: ${hours} h ${minutes} m to 100%`;
        } else if (this.charging) {
            status = `Charging: ${percentage}%`;
        } else if (isFinite(this.dischargingTime)) {
            const { hours, minutes } = OSDate.secondsToHoursMinutes(this.dischargingTime);
            status = `${hours} hours ${minutes} minutes left`;
        }
        chargingStatus.textContent = status;

        barreryContainer.appendChild(batteryPercentage);
        barreryContainer.appendChild(percentageContainer);
        barreryContainer.appendChild(chargingStatus);

        scrollArea.appendChild(barreryContainer);
        this.mainArea.appendChild(scrollArea);
    }

    update() {
        this.removeAllEventListeners();
        this.mainArea.innerHTML = '';
        this.render();
    }

    private renderNotSupport() {
        const flexCenter = this.createFlexCenter();

        const messageEl = this.createElement('div', ['message']);
        messageEl.innerHTML = 'The Battery Status API is not supported in this browser. Please try using the Chrome desktop browser.';
        flexCenter.appendChild(messageEl);

        this.mainArea.appendChild(flexCenter);
    }

    public isSupport() {
        return ('getBattery' in navigator || ('battery' in navigator && 'Promise' in window))
    }

    private initBatteryStatus(): void {
        if ('getBattery' in navigator || ('battery' in navigator && 'Promise' in window)) {
            (navigator as Navigator).getBattery().then((battery) => {
                this.updateBatteryStatus(battery);

                // Set up event listeners
                battery.onchargingchange = () => {
                    this.charging = battery.charging;
                    this.update();
                };

                battery.onlevelchange = () => {
                    this.level = battery.level;
                    this.update();
                };

                battery.onchargingtimechange = () => {
                    this.chargingTime = battery.chargingTime;
                    this.update();
                };

                battery.ondischargingtimechange = () => {
                    this.dischargingTime = battery.dischargingTime;
                    this.update();
                };
            }).catch((error: any) => {
                console.error("Battery Status API is not supported on this device.", error);
            });
        } else {
            // console.log("No battery status support!")
        }
    }

    private updateBatteryStatus(battery: BatteryManager): void {
        this.charging = battery.charging;
        this.level = battery.level;
        this.chargingTime = battery.chargingTime;
        this.dischargingTime = battery.dischargingTime;
    }

}