import { DeviceController } from "../device/device";
import { HistoryStateManager } from "../device/history.manager";
import { OSNumber } from "../utils/number";


export class GestureService {
    private startY: number = 0;
    private currentY: number = 0;

    constructor(
        private history: HistoryStateManager,
        private device: DeviceController
    ) {
        this.touchEventListeners();
    }


    private touchEventListeners() {
        this.device.component.addEventListener('touchstart', (event) => {
            this.startY = event.touches[0].clientY;
            this.currentY = event.touches[0].clientY;
        }, false);

        this.device.component.addEventListener('touchmove', (event) => {
            event.preventDefault();
            this.currentY = event.touches[0].clientY;
            const moveY = this.currentY - this.startY;
            this.moving(moveY);
        }, false);

        this.device.component.addEventListener('touchend', () => {
            const moveY = this.currentY - this.startY;
            this.moveEnd(moveY);
        }, false);
    }

    private moving(y: number) {
        if (this.device.animating || !this.device.appOpened) return;
        const domRect: DOMRect = this.device.component.getBoundingClientRect();
        const max = domRect.height * -1;
        const startPos = domRect.top + domRect.height - 40;

        if (y < max) return;

        if (this.device.appOpened && this.startY > startPos && y < 0) {
            const appScale = OSNumber.mapRange(y, 0, max, 1, .5);
            const homeScale = OSNumber.mapRange(y, 0, max * 0.5, .7, 1);

            this.device.appContainer.style.transition = 'none';
            this.device.appContainer.style.translate = `0 ${y * -1}px`;
            this.device.appContainer.style.scale = `${appScale}`;

            this.device.homeFrame.style.transition = 'none';
            this.device.homeFrame.style.scale = `${homeScale}`;
        }
    }

    private moveEnd(y: number) {
        if (!this.device.appOpened) return;
        const domRect: DOMRect = this.device.component.getBoundingClientRect();
        const startPos = domRect.top + domRect.height - 40;
        if (this.startY > startPos && y < -80) {
            this.history.pushState('/', null);
        } else {
            this.device.appContainer.style.transition = 'all .5s ease';
            this.device.appContainer.style.translate = `0 0`;
            this.device.appContainer.style.scale = `1`;

            this.device.homeFrame.style.transition = 'scale .5s ease';
            this.device.homeFrame.style.scale = ".7";
        }
    }
}