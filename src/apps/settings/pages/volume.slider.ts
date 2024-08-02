import { CustomForm } from "../../../components/form/form-elem";
import { OSNumber } from "../../../utils/number";


export class VolumeSlider extends CustomForm {
    private savedVolume: number = 0;
    private volumeEl?: HTMLElement;
    private bgEl?: HTMLElement;
    private volumeIcon?: HTMLElement;

    constructor(
        target: HTMLElement,
        private _volume: number,
        private icons: [string, string]
    ) {
        super(target);
        this.savedVolume = _volume;

        this.renderElem();
    }

    get volume() {
        return this._volume;
    }
    set volume(data: number) {
        this.onSlience(data === 0);
        this._volume = data;
        this.renderRange(data);
        this.dispatchFormEvent('change', data);
    }

    private slience(data: boolean) {
        if (data) {
            this.savedVolume = this.volume;
            this.volume = 0;
        } else {
            this.volume = this.savedVolume || 0.5;
        }
    }

    private renderElem() {
        const volumeGroup = this.createElement('div', ['volumeGroup']);

        const volumeSlider = this.createElement('div', ['volumeRange']);
        this.bgEl = this.createElement('div', ['rangeBackground']);
        this.volumeEl = this.createElement('div', ['currentVolume']);
        volumeSlider.appendChild(this.bgEl);
        volumeSlider.appendChild(this.volumeEl);

        this.touchEventListeners(volumeSlider);

        this.volume = this._volume;

        this.volumeIcon = this.createElement('div', ['volumeIcon']);
        this.volumeIcon.innerHTML = `<span class="material-symbols-outlined">
            ${this.volume === 0 ? this.icons[1] : this.icons[0]}
        </span>`;
        volumeGroup.appendChild(this.volumeIcon);

        volumeGroup.appendChild(volumeSlider);

        this.target.appendChild(volumeGroup);
    }


    private touchEventListeners(elem: HTMLElement) {
        let startX = 0, currentX = 0;
        elem.addEventListener('touchstart', (event) => {
            event.preventDefault();
            startX = event.touches[0].clientX;
            currentX = event.touches[0].clientX;
            if (!this.onButton(startX, elem.getBoundingClientRect())) {
                this.volume = this.calcPosition(currentX, elem.getBoundingClientRect());
            }
        }, false);

        elem.addEventListener('touchmove', (event: TouchEvent) => {
            event.preventDefault();
            currentX = event.touches[0].clientX;
            if (this.volumeEl) {
                this.volumeEl.style.transition = `transform .1s ease`;
            }
            this.volume = this.calcPosition(currentX, elem.getBoundingClientRect());
        }, false);

        elem.addEventListener('touchend', () => {
            const move = Math.abs(startX - currentX);
            if (this.onButton(startX, elem.getBoundingClientRect())) {
                if (move > 5) {
                    this.volume = this.calcPosition(currentX, elem.getBoundingClientRect());
                } else {
                    this.slience(this.volume !== 0);
                }
            } else {
                this.volume = this.calcPosition(currentX, elem.getBoundingClientRect());
            }
            this.rangeEnd();
        }, false);

        elem.addEventListener('mousedown', (event: MouseEvent) => {
            startX = event.clientX;
            currentX = event.clientX;
            if (!this.onButton(startX, elem.getBoundingClientRect())) {
                this.volume = this.calcPosition(currentX, elem.getBoundingClientRect());
            }

            const onMouseMove = (moveEvent: MouseEvent) => {
                currentX = moveEvent.clientX;
                if (this.volumeEl) {
                    this.volumeEl.style.transition = `transform .1s ease`;
                }
                this.volume = this.calcPosition(currentX, elem.getBoundingClientRect());
            };

            const onMouseUp = () => {
                const move = Math.abs(startX - currentX);
                if (this.onButton(startX, elem.getBoundingClientRect())) {
                    if (move > 5) {
                        this.volume = this.calcPosition(currentX, elem.getBoundingClientRect());
                    } else {
                        this.slience(this.volume !== 0);
                    }
                } else {
                    this.volume = this.calcPosition(currentX, elem.getBoundingClientRect());
                }
                this.rangeEnd();
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }, false);
    }

    private renderRange(data: number) {
        if (this.volumeEl) {
            const volume = OSNumber.mapRange(data, 0, 1, 100, 0);
            this.volumeEl.style.transform = `translate(${volume * -1}%, 0)`;
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
            this.volumeIcon.innerHTML = `<span class="material-symbols-outlined">${data ? this.icons[1] : this.icons[0]}</span>`;
        }
    }

    private onButton(start: number, rect: DOMRect) {
        const end = rect.left + 42;
        return start < end
    }

    private calcPosition(current: number, rect: DOMRect) {
        const start = rect.left + 10;
        const end = rect.left + rect.width - 10;
        if (current < start) return 0;
        if (current > end) return 1;
        return OSNumber.mapRange(current, start, end, 0, 1);
    }

}