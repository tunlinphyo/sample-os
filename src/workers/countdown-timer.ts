export interface CountdownData {
    id: string;
    duration: number;
    remainingTime: number;
    timerId: number | null;
    endTime: number | null;
    running: boolean;
}

export class CountdownTimer {
    private id: string = '';
    private duration: number = 0;
    private remainingTime: number = 0;
    private timerId: number | null = null;
    private endTime: number | null = null;
    private running: boolean = false;

    constructor() {}

    public init(data: CountdownData) {
        if (data) {
            this.id = data.id;
            this.duration = data.duration;
            this.remainingTime = data.running ? Math.max(data.endTime! - Date.now(), 0) : data.remainingTime;
            this.timerId = data.timerId;
            this.endTime = data.running ? data.endTime : Date.now() + data.remainingTime;
            this.running = data.running;
        } else {
            this.id = '';
            this.duration = 3 * 60 * 1000;
            this.remainingTime = this.duration;
            this.timerId = null;
            this.endTime = Date.now() + this.remainingTime;
            this.running = false;
        }

        if (this.running) {
            this.start();
        }
    }

    private getData(): CountdownData {
        return {
            id: this.id,
            duration: this.duration,
            remainingTime: this.remainingTime,
            timerId: this.timerId,
            endTime: this.endTime,
            running: this.running
        }
    }

    public start(): void {
        if (!this.running) {
            this.endTime = Date.now() + this.remainingTime;
        }
        this.running = true;
        this.remainingTime = Math.max(this.endTime! - Date.now(), 0);
        postMessage({ status: 'start', remainingTime: this.remainingTime, timerData: this.getData() });

        if (this.timerId) {
            clearInterval(this.timerId);
        }
        if (this.timerId === null) {
            this.endTime = Date.now() + this.remainingTime;

            this.timerId = setInterval(() => {
                this.remainingTime = Math.max(this.endTime! - Date.now(), 0);
                postMessage({ status: 'running', remainingTime: this.remainingTime });

                if (this.remainingTime === 0) {
                    postMessage({ status: 'finished', remainingTime: this.remainingTime });
                    this.reset();
                }
            }, 1000);
        }
    }

    public stop(post: boolean = true): void {
        if (this.timerId !== null) {
            clearInterval(this.timerId);
            this.timerId = null;
            this.remainingTime = Math.max(this.endTime! - Date.now(), 0);
            this.running = false;
            if (post) postMessage({ status: 'stop', remainingTime: this.remainingTime, timerData: this.getData() });
        }
    }

    public reset(duration?: number): void {
        console.log('RESET', duration);
        this.stop(false);
        if (duration) {
            this.duration = duration;
        }
        this.remainingTime = duration || this.duration;
        this.running = false;
        postMessage({ status: 'reset', remainingTime: this.remainingTime, timerData: this.getData() });
    }

    public getRemainingTime(): number {
        if (this.timerId !== null) {
            return Math.max(this.endTime! - Date.now(), 0);
        } else {
            return this.remainingTime;
        }
    }
}