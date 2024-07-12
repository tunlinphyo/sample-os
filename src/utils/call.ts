export class CallTime {
    private startTime: number | null = null;
    private elapsedTime: number = 0;
    private intervalId: number | null = null;
    private displayElement?: HTMLElement;

    constructor(displayElement?: HTMLElement) {
        if (displayElement) this.displayElement = displayElement;
    }

    setDisplay(displayElement: HTMLElement) {
        this.displayElement = displayElement
    }

    public start(): void {
        if (this.intervalId !== null) {
            return; // Already running
        }
        this.startTime = Date.now() - this.elapsedTime;
        this.intervalId = window.setInterval(() => this.update(), 1000);
    }

    public stop(): void {
        if (this.intervalId === null) {
            return; // Already stopped
        }
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.elapsedTime = Date.now() - (this.startTime || 0);
    }

    public reset(): void {
        this.stop();
        this.elapsedTime = 0;
        this.updateDisplay(0);
    }

    private update(): void {
        if (this.startTime === null) {
            return;
        }
        const elapsedTime = Date.now() - this.startTime;
        this.updateDisplay(elapsedTime);
    }

    private updateDisplay(time: number): void {
        const totalSeconds = Math.floor(time / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (this.displayElement) this.displayElement.textContent = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
    }

    private pad(num: number): string {
        return num.toString().padStart(2, '0');
    }

    public getCurrentTime() {
        const elapsedTime = Date.now() - (this.startTime || 0);
        const totalSeconds = Math.floor(elapsedTime / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`
    }
}
