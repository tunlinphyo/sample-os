import { DeviceController } from "../../device/device";
import { HistoryStateManager } from "../../device/history.manager";
import { WeatherService } from "../../services/weather.service";
import { OSBrowser } from "../../utils/browser";
import { OSDate } from "../../utils/date";
import { App } from "../app";


export class LockedScreenPage extends App {
    // private hourHand: HTMLElement;
    // private minuteHand: HTMLElement;
    // private secondHand: HTMLElement;
    private powerBtn: HTMLButtonElement;
    private weatherEl: HTMLElement | undefined;
    private clockEl: HTMLElement | undefined;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController
    ) {
        super(history, { template: "lockedTemplate", parentEl: device.deviceEl });
        this.component.classList.add("lockedScreen");
        this.render();

        // this.hourHand = this.getElement('.hour-hand');
        // this.minuteHand = this.getElement('.minute-hand');
        // this.secondHand = this.getElement('.second-hand');
        this.powerBtn = this.getElement("#aiButton", this.device.component);

        this.init();
    }

    private init() {
        this.setClock();
        const now = new Date();
        const delay = (60 - now.getSeconds()) * 1000;
        setTimeout(() => {
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

        this.clockEl = this.createElement('div', ['clockContainer']);
        // clockEl.innerHTML = `
        //     <div class="clockArea">
        //         <div class="clock">
        //             <div class="clock-face">
        //                 <div class="hand hour-hand"></div>
        //                 <div class="hand minute-hand"></div>
        //             </div>
        //         </div>
        //     </div>
        // `;
        // <div class="hand second-hand"></div>

        const dateEl = this.createElement('div', ['dateContainer']);
        dateEl.textContent = OSDate.customFormat(new Date(), {
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        }, this.device.timeZone);

        this.weatherEl = this.createElement('div', ['weatherContainer']);
        this.weatherEl.textContent = 'Weather';

        safeArea.appendChild(dateEl);
        safeArea.appendChild(this.clockEl);
        safeArea.appendChild(this.weatherEl);

        const homeNavigation = this.createElement('button', ['homeNavigation']);
        const navButton = this.createElement('button', ['navButton']);

        navButton.addEventListener('click', () => {
            if (OSBrowser.isTouchSupport()) {
                this.lockedAnimate();
            } else {
                this.openLocked();
            }
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
                <span class="material-symbols-outlined" style="translate: 0 -2px">${WeatherService.getIcon(weather.weather[0].icon)}</span>:
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
        }
    }

    private setClock() {
        if (!this.clockEl) return;
        this.clockEl.textContent = OSDate.getCustomTime(new Date(), true, this.device.timeZone);

        // const now = new OSDate().getDateByTimeZone(this.device.timeZone);

        // const seconds = now.getSeconds();
        // // const secondsDegrees = ((seconds / 60) * 360) + 90; // Offset by 90 degrees
        // // this.secondHand.style.transform = `rotate(${secondsDegrees}deg)`;

        // const minutes = now.getMinutes();
        // const minutesDegrees = ((minutes / 60) * 360) + ((seconds / 60) * 6) + 90;
        // this.minuteHand.style.transform = `rotate(${minutesDegrees}deg)`;

        // const hours = now.getHours();
        // const hoursDegrees = ((hours / 12) * 360) + ((minutes / 60) * 30) + 90;
        // this.hourHand.style.transform = `rotate(${hoursDegrees}deg)`;
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