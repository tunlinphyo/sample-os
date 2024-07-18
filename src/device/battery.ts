export interface Navigator {
    getBattery(): Promise<BatteryManager>;
}

export interface BatteryManager extends EventTarget {
    charging: boolean;
    level: number;
    chargingTime: number;
    dischargingTime: number;

    onchargingchange: ((this: BatteryManager, ev: Event) => any) | null;
    onlevelchange: ((this: BatteryManager, ev: Event) => any) | null;
    onchargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
    ondischargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
}

// Battery class to model battery status
export class Battery {
    private charging: boolean;
    private level: number;
    private chargingTime: number;
    private dischargingTime: number;
    // private lastDischaringTime: Date | undefined;

    private batteryPercentage: HTMLElement;

    constructor() {
        this.charging = false;
        this.level = 0;
        this.chargingTime = 0;
        this.dischargingTime = Infinity;

        this.batteryPercentage = document.getElementById('batteryPercentage') as HTMLElement;

        // Initialize the battery status
        this.initBatteryStatus();
    }

    private initBatteryStatus(): void {
        if ('getBattery' in navigator || ('battery' in navigator && 'Promise' in window)) {
            (navigator as Navigator).getBattery().then((battery) => {
                this.updateBatteryStatus(battery);
                this.renderBatteryIcon();

                // Set up event listeners
                battery.onchargingchange = () => {
                    this.charging = battery.charging;
                    this.renderBatteryIcon();
                    // console.log("Battery charging: ", this.charging);
                };

                battery.onlevelchange = () => {
                    this.level = battery.level;
                    this.renderBatteryIcon();
                    // console.log("Battery level: ", this.level);
                };

                battery.onchargingtimechange = () => {
                    this.chargingTime = battery.chargingTime;
                    // console.log("Battery charging time: ", this.chargingTime + " seconds");
                };

                battery.ondischargingtimechange = () => {
                    this.dischargingTime = battery.dischargingTime;
                    // console.log("Battery discharging time: ", this.dischargingTime + " seconds");
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

        // Log initial battery status
        console.log("Battery charging: ", this.charging);
        console.log("Battery level: ", this.level * 100 + "%");
        console.log("Battery charging time: ", this.chargingTime + " seconds");
        console.log("Battery discharging time: ", this.dischargingTime + " seconds");
    }

    private renderBatteryIcon() {
        if (this.charging) {
            this.batteryPercentage.dataset.value = '';
            const boltEl = this.createElement(
                'span',
                ['material-symbols-outlined', 'batteryCharging', 'fill-icon'],
                { style: 'font-size: 14px; translate: -1px 0;' }
            );
            boltEl.textContent = 'bolt';
            this.batteryPercentage.appendChild(boltEl);
        } else {
            this.batteryPercentage.dataset.value = `${Math.round(this.level * 100)}`;
            const boltEl = this.getElement('.batteryCharging');
            if (!boltEl) return;
            boltEl.remove();
        }
    }

    protected getElement<T extends HTMLElement>(selector: string, parent: Document | HTMLElement = document): T {
        const element = parent.querySelector(selector) as T;
        if (!element) {
            // console.log(`Element with selector ${selector} not found.`);
        }
        return element;
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
}
