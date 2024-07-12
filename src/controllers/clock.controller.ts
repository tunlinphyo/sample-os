import { Alarm, ClockAlarmStore } from "../stores/alarm.store";
import { ClockStore, StopWatchData } from "../stores/clock.store";
import { BaseController } from "./base.controller";
import AlarmWorker from '../workers/alarm-worker.ts?worker&inline';
import TimerWorker from '../workers/timer-worker.ts?worker&inline';

export interface CountdownData {
    id: string;
    duration: number;
    remainingTime: number;
    timerId: number | null;
    endTime: number | null;
    running: boolean;
}

export class ClockController extends BaseController {
    private alarmWorker: Worker;
    private timerWorker: Worker;

    public stopwatchStatus: boolean = false;
    public timer: CountdownData | null = null;
    public stopwatch: StopWatchData | null = null;

    public alarms: Alarm[] = [];

    constructor(
        public clockStore: ClockStore,
        public alarmStore: ClockAlarmStore,
    ) {
        super();
        this.alarmWorker = new AlarmWorker();
        this.timerWorker = new TimerWorker();
        this.setupListeners();
    }

    get timerRunning(): boolean {
        return !!this.timer?.running;
    }

    get stopwatchRunning(): boolean {
        return !!this.stopwatch?.running;
    }

    get remaining() {
        return this.timer?.remainingTime || 0;
    }

    get duration() {
        return this.timer?.duration || 0;
    }
    set duration(duration: number) {
        if (this.timer) {
            this.timer.duration = duration;
        }
    }

    private setupListeners() {
        this.clockStore.listen((_, item, operation) => {
            if (operation === 'loaded') {
                const countdownData = this.clockStore.get('countdown') as CountdownData;
                this.timer = countdownData;
                this.timerWorker.postMessage({
                    command: 'init',
                    data: countdownData
                });

                this.stopwatch = this.clockStore.get('stopwatch') as StopWatchData;
                if (this.stopwatch) {
                    // this.stopwatchStatus = stopwatch.running;
                    if (!this.timerRunning) {
                        this.notifyListeners('UPDATE_CLOCK', {
                            timer: this.timerRunning,
                            stopwatch: this.stopwatchStatus,
                        });
                    }
                }
            }

            if (item && item.id === 'stopwatch') {
                this.stopwatchStatus = item.running;
                if (!this.timer?.running) {
                    this.notifyListeners('UPDATE_CLOCK', {
                        timer: !!this.timer?.running,
                        stopwatch: this.stopwatchStatus,
                    });
                }
            }
        });

        this.alarmStore.listen((list, item, operation) => {
            this.alarms = list;
            if (operation === 'loaded' && list) {
                this.alarmWorker.postMessage({
                    command: 'init',
                    data: list
                });
                this.notifyListeners('ALARM_LOADED', list);
            }
            if (item) {
                this.alarmWorker.postMessage({ command: operation, data: item });
                this.notifyListeners('UPDATE_ALARM', list);
            }
        });

        this.alarmWorker.addEventListener('message', (event) => {
            const { status, data } = event.data;

            if (status === 'updateClock') {
                if (!this.timer?.running) {
                    this.notifyListeners('UPDATE_CLOCK', {
                        timer: !!this.timer?.running,
                        stopwatch: this.stopwatchStatus,
                    });
                }
            }
            if (status === 'showAlarm') {
                this.alarmStore.update(data.id, data);
                this.notifyListeners('SHOW_ALARM', data);
            }
            if (status === 'updateAlarm') {
                this.alarmStore.update(data.id, data);
                this.notifyListeners('ALARM_UPDATE', data);
            }
        });

        this.timerWorker.addEventListener('message', (event) => {
            const { status, remainingTime, timer } = event.data;

            if (this.timer){
                this.timer.remainingTime = remainingTime;
            }

            if (timer) {
                this.timer = timer;
                this.updateTimer(timer);
                this.notifyListeners('TIMER_UPDATE', this.timer);
            } else {
                this.notifyListeners('TIMER_UPDATE', this.timer);
            }


            if (status === 'finished') {
                this.notifyListeners('TIMER_ALERT', {
                    timer: !!this.timer?.running,
                    stopwatch: this.stopwatchStatus,
                });
            }
        });
    }

    public updateStopwatch(data: StopWatchData) {
        this.tryThis(async () => {
            if (!data.id) await this.clockStore.add(data, 'stopwatch');
            else await this.clockStore.update('stopwatch', data);
        });
    }

    public updateTimer(data: CountdownData) {
        this.tryThis(async () => {
            if (!data.id) await this.clockStore.add(data, 'countdown');
            else await this.clockStore.update('countdown', data);
        });
    }

    public updateAlarm(data: Alarm) {
        this.tryThis(async () => {
            if (data.id) await this.alarmStore.update(data.id, data)
            else await this.alarmStore.add(data)
        });
    }

    public deleteAlarm(data: Alarm) {
        this.tryThis(async () => {
            await this.alarmStore.del(data.id);
        });
    }

    public timerStart() {
        this.timerWorker.postMessage({ command: 'start' });
    }

    public timerStop() {
        this.timerWorker.postMessage({ command: 'stop' });
    }

    public timerReset(duration?: number) {
        this.timerWorker.postMessage({ command: 'reset', data: duration });
    }

}