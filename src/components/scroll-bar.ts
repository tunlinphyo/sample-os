import { debounce } from "../utils/debounce";
import { Global } from "../utils/global";
import { OSNumber } from "../utils/number";


export class ScrollBar {
    private scrollArea?: HTMLElement;
    private scrollContainer: HTMLElement;
    private scrollBar: HTMLElement;
    private debouncedHandler: () => void;
    private parentHeight: number = 0;
    private childHeight: number = 0;

    constructor(private component: HTMLElement, private reverse: boolean = false) {
        this.calcScroll = this.calcScroll.bind(this);
        this.scrollArea = component.querySelector('.scrollArea')!;
        [ this.scrollContainer, this.scrollBar ] = this.init();
        this.eventListener();
        this.debouncedHandler = debounce(this.hideScrollbar.bind(this), 300);
    }

    public reCalculate() {
        this.scrollArea = this.component.querySelector('.scrollArea')!;
        [this.parentHeight, this.childHeight] = this.getHeights();
        this.eventListener();
    }

    private init() {
        const isContainer = this.component.querySelector('.scrollBarContainer') as HTMLElement;
        if (isContainer) {
            isContainer.remove();
        }
        const scrollContainer = document.createElement("div");
        scrollContainer.classList.add("scrollBarContainer");
        const scrollBar = document.createElement("div");
        scrollBar.classList.add("scrollBar");

        scrollContainer.appendChild(scrollBar);
        this.component.appendChild(scrollContainer);
        [this.parentHeight, this.childHeight] = this.getHeights();
        return [scrollContainer, scrollBar];
    }

    private eventListener() {
        this.setHeight();
        if (this.scrollArea) {
            this.addAutoUnsubscribeListener(this.scrollArea, 'scroll', () => {
                const y = (this.scrollArea?.scrollTop || 0) * (this.reverse ? -1 : 1);
                this.calcScroll(y);
            });
        }
    }

    private addAutoUnsubscribeListener<K extends keyof HTMLElementEventMap>(
        element: HTMLElement,
        eventType: K,
        callback: (event: HTMLElementEventMap[K]) => void
    ): void {
        element.addEventListener(eventType, callback);

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.removedNodes.forEach((removedNode) => {
                    if (removedNode === element) {
                        element.removeEventListener(eventType, callback);
                        observer.disconnect();
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }


    private calcScroll(scrollTop: number) {
        const maxScroll = Math.abs(this.parentHeight - this.childHeight);
        const scrollPercentage = OSNumber.getPercentage(scrollTop, maxScroll, false);
        this.updateScrollbar(scrollPercentage);
    }

    private getHeights() {
        const parentHeight = this.scrollArea?.clientHeight || 0;
        const scrollHeight = this.scrollArea?.scrollHeight || 0;

        return [parentHeight, scrollHeight];
    }

    private setHeight() {
        const heightPercentage = OSNumber.getPercentage(this.parentHeight, this.childHeight);
        this.scrollBar.style.height = `${heightPercentage}%`;
    }

    private updateScrollbar(scrollPercentage: number) {
        this.showScrollbar();
        this.debouncedHandler();
        const maxMove = (Global.GRID * 3.5) - this.scrollBar.clientHeight;
        let num = 0;
        if (this.reverse) {
            num = OSNumber.mapRange(scrollPercentage, 0, 100, maxMove, 0);
        } else {
            num = OSNumber.mapRange(scrollPercentage, 0, 100, 0, maxMove);
        }
        this.scrollBar.style.translate = `0 ${num}px`;
    }

    private showScrollbar() {
        this.scrollContainer.classList.add('show');
    }
    private hideScrollbar() {
        this.scrollContainer.classList.remove('show');
    }
}