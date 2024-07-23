import { DeviceController } from "../../device/device";
import { HistoryStateManager } from "../../device/history.manager";
import { OSBrowser } from "../../utils/browser";
import { OSDate } from "../../utils/date";
import { App } from "../app";


export class LockedScreenPage extends App {
    private hourHand: HTMLElement;
    private minuteHand: HTMLElement;
    // private secondHand: HTMLElement;
    private powerBtn: HTMLButtonElement;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController
    ) {
        super(history, { template: "lockedTemplate", parentEl: device.deviceEl });
        this.component.classList.add("lockedScreen");
        this.render();

        this.hourHand = this.getElement('.hour-hand');
        this.minuteHand = this.getElement('.minute-hand');
        // this.secondHand = this.getElement('.second-hand');
        this.powerBtn = this.getElement("#aiButton", this.device.component);
        
        this.init();
    }

    private init() {
        this.setClock();
        const now = new Date();
        const delay = (60 - now.getSeconds()) * 1000;
        setInterval(() => this.setClock(), delay);

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

        const clockEl = this.createElement('div', ['clockContainer']);
        clockEl.innerHTML = `
            <div class="clockArea">
                <div class="clock">
                    <div class="clock-face">
                        <div class="hand hour-hand"></div>
                        <div class="hand minute-hand"></div>
                    </div>
                </div>
            </div>
        `;
        // <div class="hand second-hand"></div>

        const dateEl = this.createElement('div', ['dateContainer']);
        dateEl.textContent = OSDate.customFormat(new Date(), {
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        }, this.device.timeZone);


        safeArea.appendChild(dateEl);
        safeArea.appendChild(clockEl);

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

    update() {}

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
        const now = new OSDate().getDateByTimeZone(this.device.timeZone);

        const seconds = now.getSeconds();
        // const secondsDegrees = ((seconds / 60) * 360) + 90; // Offset by 90 degrees
        // this.secondHand.style.transform = `rotate(${secondsDegrees}deg)`;

        const minutes = now.getMinutes();
        const minutesDegrees = ((minutes / 60) * 360) + ((seconds / 60) * 6) + 90;
        this.minuteHand.style.transform = `rotate(${minutesDegrees}deg)`;

        const hours = now.getHours();
        const hoursDegrees = ((hours / 12) * 360) + ((minutes / 60) * 30) + 90;
        this.hourHand.style.transform = `rotate(${hoursDegrees}deg)`;
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