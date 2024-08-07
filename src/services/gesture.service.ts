import { LockedScreenPage } from "../components/system/locked.screen";
import { DeviceController } from "../device/device";
import { HistoryStateManager } from "../device/history.manager";
import { OSNumber } from "../utils/number";


export class GestureService {
    private startY: number = 0;
    private currentY: number = 0;

    constructor(
        private history: HistoryStateManager,
        private device: DeviceController,
        private locked: LockedScreenPage
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

        this.device.component.addEventListener('mousedown', (event) => {
            this.startY = event.clientY;
            this.currentY = event.clientY;

            const onMouseMove = (moveEvent: MouseEvent) => {
                event.preventDefault();
                document.body.style.pointerEvents = 'none';
                this.currentY = moveEvent.clientY;
                const moveY = this.currentY - this.startY;
                this.moving(moveY);
            };

            const onMouseUp = () => {
                document.body.style.pointerEvents = 'auto';
                const moveY = this.currentY - this.startY;
                this.moveEnd(moveY);
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }, false);
    }

    private moving(y: number) {
        if (this.device.system.isSystem) return;
        const domRect: DOMRect = this.device.component.getBoundingClientRect();
        const max = domRect.height * -1;
        const startPos = domRect.top + domRect.height - 60;
        if (y < max) return;

        if (this.device.lockedDevice) {
            this.openLocked(y, startPos);
        } else {
            // if (this.device.animating) return;
            this.openApp(y, startPos, max);
        }

    }

    private moveEnd(y: number) {
        if (this.device.system.isSystem) return;
        const domRect: DOMRect = this.device.component.getBoundingClientRect();
        const startPos = domRect.top + domRect.height - 60;
        if (this.device.lockedDevice) {
            this.closeLock(y, startPos);
        } else {
            if (!this.device.appOpened) return;
            this.closeApp(y, startPos);
        }
    }

    private openLocked(y: number, startPos: number) {
        if (this.device.lockedDevice && this.startY > startPos && y < 0) {
            if (this.startY > startPos && y < -120) {
                this.locked.setLock(false);
            } else {
                this.locked.setLock(true);
            }
            this.locked.component.style.transition = 'none';
            this.locked.component.style.translate = `0 ${y}px`;
        }
    }

    private openApp(y: number, startPos: number, max: number) {
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

    private closeLock(y: number, startPos: number) {
        if (this.startY > startPos && y < -120) {
            this.locked.openLocked();
        } else {
            this.locked.component.style.transition = 'translate .5s ease';
            this.locked.component.style.translate = `0 0`;
        }
    }

    private closeApp(y: number, startPos: number) {
        if (this.startY > startPos && y < -80) {
            this.history.replaceState('/', null);
        } else {
            this.device.appContainer.style.transition = 'all .5s ease';
            this.device.appContainer.style.translate = `0 0`;
            this.device.appContainer.style.scale = `1`;

            this.device.homeFrame.style.transition = 'scale .5s ease';
            this.device.homeFrame.style.scale = ".7";
        }
    }
}