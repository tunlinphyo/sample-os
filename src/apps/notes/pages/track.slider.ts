import { CustomForm } from "../../../components/form/form-elem";
import { OSNumber } from "../../../utils/number";


export class TrackSlider extends CustomForm {
    private totalTime?: HTMLElement;
    private bgEl?: HTMLElement;
    private currentTime?: HTMLElement;

    constructor(
        target: HTMLElement,
        private _volume: number,
        private max: number
    ) {
        super(target);

        this.renderElem();
    }

    get volume() {
        return this._volume;
    }
    set volume(data: number) {
        this._volume = data;
        this.renderRange(data);
        this.dispatchFormEvent('change', data);
    }

    private renderElem() {
        const volumeGroup = this.createElement('div', ['trackGroup']);

        const volumeSlider = this.createElement('div', ['trackRange']);
        this.bgEl = this.createElement('div', ['rangeBackground']);
        this.bgEl.textContent = this.getTimeString(this.max);
        this.totalTime = this.createElement('div', ['totalTime']);
        volumeSlider.appendChild(this.bgEl);
        volumeSlider.appendChild(this.totalTime);

        this.touchEventListeners(volumeSlider);

        this.volume = this._volume;

        this.currentTime = this.createElement('div', ['currentTime']);
        this.currentTime.textContent = `${this.volume}`;
        volumeGroup.appendChild(this.currentTime);

        volumeGroup.appendChild(volumeSlider);

        this.target.appendChild(volumeGroup);
    }


    private touchEventListeners(elem: HTMLElement) {
        let startX = 0, currentX = 0;
        elem.addEventListener('touchstart', (event) => {
            event.preventDefault();
            startX = event.touches[0].clientX;
            currentX = event.touches[0].clientX;
        }, false);

        elem.addEventListener('touchmove', (event: TouchEvent) => {
            event.preventDefault();
            currentX = event.touches[0].clientX;
            if (this.totalTime) {
                this.totalTime.style.transition = `transform .1s ease`;
            }
            this.volume = this.calcPosition(currentX, elem.getBoundingClientRect());
        }, false);

        elem.addEventListener('touchend', () => {
            this.volume = this.calcPosition(currentX, elem.getBoundingClientRect());
            this.rangeEnd();
        }, false);

        elem.addEventListener('mousedown', (event: MouseEvent) => {
            startX = event.clientX;
            currentX = event.clientX;
            this.volume = this.calcPosition(currentX, elem.getBoundingClientRect());

            const onMouseMove = (moveEvent: MouseEvent) => {
                currentX = moveEvent.clientX;
                if (this.totalTime) {
                    this.totalTime.style.transition = `transform .1s ease`;
                }
                this.volume = this.calcPosition(currentX, elem.getBoundingClientRect());
            };

            const onMouseUp = () => {
                this.volume = this.calcPosition(currentX, elem.getBoundingClientRect());
                this.rangeEnd();
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }, false);
    }

    private renderRange(data: number) {
        if (this.totalTime) {
            const volume = OSNumber.mapRange(data, 0, this.max, 100, 0);
            this.totalTime.style.transform = `translate(${volume * -1}%, 0)`;
            this.totalTime.textContent = this.getTimeString(this.volume);
        }
    }
    private rangeEnd() {
        if (this.totalTime) {
            this.totalTime.style.transition = `transform .5s ease`;
        }
    }

    private calcPosition(current: number, rect: DOMRect) {
        const start = rect.left;
        const end = rect.left + rect.width;
        if (current < start) return 0;
        if (current > end) return this.max;
        return OSNumber.mapRange(current, start, end, 0, this.max);
    }

    private getTimeString(time: number) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(1, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}