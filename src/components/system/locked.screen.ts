import { DeviceController } from "../../device/device";
import { HistoryStateManager } from "../../device/history.manager";
import { WeatherService } from "../../services/weather.service";
// import { OSBrowser } from "../../utils/browser";
import { OSDate } from "../../utils/date";
import { App } from "../app";


export class LockedScreenPage extends App {
    // private hourHand: HTMLElement;
    // private minuteHand: HTMLElement;
    private lockedIcon: HTMLElement;
    private powerBtn: HTMLButtonElement;
    private weatherEl: HTMLElement | undefined;
    private clockEl: HTMLElement | undefined;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController
    ) {
        super(history, { template: "lockedTemplate", parentEl: device.deviceEl });
        this.component.classList.add("lockedScreen");
        this.lockedIcon = this.createLockIcon();
        this.powerBtn = this.getElement("#aiButton", this.device.component);

        this.render();
        this.init();
    }

    private init() {
        this.setClock();
        const now = new Date();
        const delay = (60 - now.getSeconds()) * 1000;
        setTimeout(() => {
            this.setClock();
            setInterval(() => this.setClock(), 60000);
        }, delay);

        this.powerBtn.addEventListener('click', () => {
            this.powerBtn.animate([
                { translate: '25px 0' },
                { translate: '20px 0' },
                { translate: '25px 0' }
            ], {
                duration: 500,
                easing: 'ease',
                iterations: 1
            });
            this.closeLocked();
        });
    }

    render() {
        const safeArea = this.createElement('div', ['safeArea']);

        const dateEl = this.createElement('div', ['dateContainer']);
        dateEl.textContent = OSDate.customFormat(new Date(), {
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        }, this.device.timeZone);

        this.clockEl = this.createElement('div', ['clockContainer']);

        const lockContainer = this.createElement('div', ['lockContainer']);
        lockContainer.appendChild(this.lockedIcon);

        this.weatherEl = this.createElement('div', ['weatherContainer']);
        this.weatherEl.textContent = 'Weather';

        safeArea.appendChild(dateEl);
        safeArea.appendChild(this.clockEl);
        safeArea.appendChild(lockContainer);
        safeArea.appendChild(this.weatherEl);

        const homeNavigation = this.createElement('button', ['homeNavigation']);
        const navButton = this.createElement('button', ['navButton']);

        navButton.addEventListener('click', () => {
            this.lockedAnimate();
            // if (OSBrowser.isTouchSupport()) {
            // } else {
            //     this.openLocked();
            // }
        });
        homeNavigation.appendChild(navButton);

        this.mainArea.appendChild(safeArea);
        this.mainArea.appendChild(homeNavigation);
    }

    update(_:string, weather: any) {
        if (!this.weatherEl) return;
        this.weatherEl.innerHTML = `
            <div class="weatherStatus">
                <span>${weather.weather[0].description}</span>
                <span class="material-symbols-outlined" style="translate: 0 -2px">${WeatherService.getIcon(weather.weather[0].icon)}</span>
                <span class="degree">${Math.round(weather.main.temp)}&deg;</span>
            </div>
        `;
    }

    openLocked() {
        this.device.lockedDevice = false;
        this.component.style.transition = 'translate .5s ease';
        this.component.style.translate = '0 -101%';
    }

    closeLocked() {
        this.component.style.transition = 'translate 0.3s ease';
        this.component.style.translate = '0 0';
        if (this.device.lockedDevice) {
            this.lockedAnimate();
        } else {
            this.device.lockedDevice = true;
            this.setLock(true);
        }
    }

    setLock(isLocked: boolean) {
        this.lockedIcon.textContent = isLocked ? 'lock' : 'lock_open_right';
    }

    private setClock() {
        if (!this.clockEl) return;
        this.clockEl.textContent = OSDate.getCustomTime(new Date(), true, this.device.timeZone);
    }

    private createLockIcon() {
        const lockIcon = this.createElement('span', ['material-symbols-outlined', 'icon--sm']);
        lockIcon.textContent = 'lock';
        return lockIcon;
    }

    private lockedAnimate() {
        this.component.animate([
            { transform: 'translateY(0)' },
            { transform: 'translateY(-16px)', offset: 0.3 },
            { transform: 'translateY(0)', offset: 0.6 },
            { transform: 'translateY(-8px)', offset: 0.8 },
            { transform: 'translateY(0)' }
        ], {
            duration: 1000,
            easing: 'ease-in-out',
            iterations: 1
        });
    }
}