import { SettingsController } from "../../controllers/settings.controller";
import { DeviceController } from "../../device/device";
import { debounce } from "../../utils/debounce";
import { OSNumber } from "../../utils/number";
import { BaseComponent } from "../base";

export class VolumeControls extends BaseComponent {
    private powerBtn: HTMLButtonElement;
    private volumeEl?: HTMLElement;
    private bgEl?: HTMLElement;
    private volumeIcon?: HTMLElement;
    private volumeUp: HTMLButtonElement;
    private volumeDown: HTMLButtonElement;

    private isActive: boolean = false;
    private savedVolume: number = 0.5;
    private debouncedHandler: () => void;

    constructor(
        device: DeviceController,
        private setting: SettingsController
    ) {
        super('volumeControl', device.deviceEl);
        this.component.classList.add('volumeControls');

        this.close = this.close.bind(this);
        this.powerBtn = this.getElement("#aiButton", device.component);
        this.volumeUp = this.getElement("#volumeUpButton", device.component);
        this.volumeDown = this.getElement("#volumeDownButton", device.component);

        this.debouncedHandler = debounce(this.close, 2000);

        this.init();
    }

    // get muted() {
    //     return this.setting.volumes.isMuted;
    // }
    // set muted(data: boolean) {
    //     this.onMuted(data);
    //     const volumes = this.setting.volumes
    //     volumes.isMuted = data;
    //     this.setting.volumes = volumes;
    // }

    get volume() {
        return this.setting.volumes.mediaVolume;
    }
    set volume(data: number) {
        this.debouncedHandler();
        this.onSlience(data === 0);
        const volumes = this.setting.volumes
        volumes.mediaVolume = data;
        this.setting.volumes = volumes;
        this.renderRange(data);
    }

    private slience(data: boolean) {
        if (data) {
            this.savedVolume = this.volume;
            this.volume = 0;
        } else {
            this.volume = this.savedVolume || 0.5;
        }
    }

    private increase() {
        if (this.volumeEl) {
            this.volumeEl.style.transition = `transform .5s ease`;
        }
        this.volume = Math.min(1, this.volume + 0.1)
    }
    private decrease() {
        if (this.volumeEl) {
            this.volumeEl.style.transition = `transform .5s ease`;
        }
        this.volume = Math.max(0, this.volume - 0.1)
    }

    private init() {
        this.debouncedHandler();

        this.addEventListener('click', () => {
            this.close();
        }, this.powerBtn, false);

        this.addEventListener('click', () => {
            this.volumeUp.animate([
                { translate: '0 0' },
                { translate: '5px 0' },
                { translate: '0 0' }
            ], {
                duration: 500,
                easing: 'ease',
                iterations: 1
            });

            if (this.isActive) {
                this.increase();
            } else {
                this.open();
            }
        }, this.volumeUp, false);

        this.addEventListener('click', () => {
            this.volumeDown.animate([
                { translate: '0 0' },
                { translate: '5px 0' },
                { translate: '0 0' }
            ], {
                duration: 500,
                easing: 'ease',
                iterations: 1
            });

            if (this.isActive) {
                this.decrease();
            } else {
                this.open();
            }
        }, this.volumeDown, false);
    }

    private renderVolume() {
        const volumeGroup = this.createElement('div', ['volumeGroup']);

        const volumeSlider = this.createElement('div', ['volumeRange']);
        this.bgEl = this.createElement('div', ['rangeBackground']);
        this.volumeEl = this.createElement('div', ['currentVolume']);
        volumeSlider.appendChild(this.bgEl);
        volumeSlider.appendChild(this.volumeEl);

        this.touchEventListeners(volumeSlider);

        this.volume = this.setting.volumes.mediaVolume;

        this.volumeIcon = this.createElement('div', ['volumeIcon']);
        this.volumeIcon.innerHTML = `<span class="material-symbols-outlined">
            ${this.volume === 0 ? 'volume_off' : 'volume_up'}
        </span>`;
        volumeGroup.appendChild(this.volumeIcon);

        volumeGroup.appendChild(volumeSlider);

        this.component.appendChild(volumeGroup);
    }

    private renderRange(data: number) {
        if (this.volumeEl) {
            const volume = OSNumber.mapRange(data, 0, 1, 100, 0);
            this.volumeEl.style.transform = `translate(0, ${volume}%)`;
            if (this.volume > 0.85) {
                this.volumeEl.textContent = `${(this.volume * 100).toFixed(0)}`;
                if ((this.bgEl)) this.bgEl.textContent = ``;
            } else {
                this.volumeEl.textContent = ``;
                if (this.bgEl) this.bgEl.textContent = `${(this.volume * 100).toFixed(0)}`;
            }
        }
    }
    private rangeEnd() {
        if (this.volumeEl) {
            this.volumeEl.style.transition = `transform .5s ease`;
        }
    }
    private onSlience(data: boolean) {
        if (this.volumeIcon) {
            this.volumeIcon.innerHTML = `<span class="material-symbols-outlined">${data ? 'volume_off' : 'volume_up'}</span>`;
        }
    }

    private touchEventListeners(elem: HTMLElement) {
        let startY = 0, currentY = 0;
        elem.addEventListener('touchstart', (event) => {
            event.preventDefault();
            startY = event.touches[0].clientY;
            currentY = event.touches[0].clientY;
            if (!this.onButton(startY, elem.getBoundingClientRect())) {
                this.volume = this.calcPosition(currentY, elem.getBoundingClientRect());
            }
        }, false);

        elem.addEventListener('touchmove', (event: TouchEvent) => {
            event.preventDefault();
            currentY = event.touches[0].clientY;
            if (this.volumeEl) {
                this.volumeEl.style.transition = `transform .1s ease`;
            }
            this.volume = this.calcPosition(currentY, elem.getBoundingClientRect());
            if (!this.onButton(currentY, elem.getBoundingClientRect())) {
            }
        }, false);

        elem.addEventListener('touchend', () => {
            const move = Math.abs(startY - currentY);
            if (this.onButton(startY, elem.getBoundingClientRect())) {
                if (move > 5) {
                    this.volume = this.calcPosition(currentY, elem.getBoundingClientRect());
                } else {
                    this.slience(this.volume !== 0);
                }
            } else {
                this.volume = this.calcPosition(currentY, elem.getBoundingClientRect());
            }
            this.rangeEnd();
        }, false);

        elem.addEventListener('mousedown', (event: MouseEvent) => {
            startY = event.clientY;
            currentY = event.clientY;
            if (!this.onButton(startY, elem.getBoundingClientRect())) {
                this.volume = this.calcPosition(currentY, elem.getBoundingClientRect());
            }

            const onMouseMove = (moveEvent: MouseEvent) => {
                currentY = moveEvent.clientY;
                if (this.volumeEl) {
                    this.volumeEl.style.transition = `transform .1s ease`;
                }
                this.volume = this.calcPosition(currentY, elem.getBoundingClientRect());
                if (!this.onButton(currentY, elem.getBoundingClientRect())) {
                }
            };

            const onMouseUp = () => {
                const move = Math.abs(startY - currentY);
                if (this.onButton(startY, elem.getBoundingClientRect())) {
                    if (move > 5) {
                        this.volume = this.calcPosition(currentY, elem.getBoundingClientRect());
                    } else {
                        this.slience(this.volume !== 0);
                    }
                } else {
                    this.volume = this.calcPosition(currentY, elem.getBoundingClientRect());
                }
                this.rangeEnd();
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }, false);
    }

    private onButton(start: number, rect: DOMRect) {
        const end = rect.top + rect.height - 48;
        return start > end
    }

    private calcPosition(current: number, rect: DOMRect) {
        const start = rect.top + 8;
        const end = rect.top + rect.height - 8;
        if (current < start) return 1;
        if (current > end) return 0;
        return OSNumber.mapRange(current, start, end, 1, 0);
    }

    open() {
        this.component.innerHTML = '';

        this.renderVolume();
        this.component.classList.add('screen--show');

        this.dispatchCustomEvent('volumeOpen');
        const transitionEndHandler = () => {
            this.isActive = true;
            this.dispatchCustomEvent('volumeOpenFinished');
            this.component.removeEventListener('transitionend', transitionEndHandler);
        };
        this.component.addEventListener('transitionend', transitionEndHandler);
    }

    close() {
        this.component.classList.remove('screen--show');
        this.dispatchCustomEvent('volumeClose');

        const transitionEndHandler = () => {
            this.isActive = false;
            this.component.removeEventListener('transitionend', transitionEndHandler);
            this.dispatchCustomEvent('volumeCloseFinished');
            this.removeAllEventListeners();
        };
        this.component.addEventListener('transitionend', transitionEndHandler);
    }

    protected setupActionButton(icon: string, position: 'start' | 'end' | 'center') {
        const button = this.createElement<HTMLButtonElement>('button', ['actionButton', position], { type: 'button' })
        button.innerHTML = `<span class="material-symbols-outlined icon">${icon}</span>`;
        const target = this.getElement(`.actionButton.${position}`);
        this.replaceElement(target, button);
        return button;
    }
}