import { ClockController } from "../../controllers/clock.controller";
import { DeviceController } from "../../device/device";
import { HistoryState, HistoryStateManager } from "../../device/history.manager";
import { AlarmEdit } from "./pages/alarm.page";
import { StopwatchPage } from "./pages/stopwatch.page";
import { TimerPage } from "./pages/timer.page";


export class ClockAppController {
    constructor(
        private history: HistoryStateManager,
        private device: DeviceController,
        private clock: ClockController,
        private alarmEdit: AlarmEdit,
        private stopwatchPage: StopwatchPage,
        private timerPage: TimerPage
    ) {
        this.renderListeners();
    }

    private renderListeners() {
        const handleChange = (state: any, url: string) => {
            this.history.handleChange(url, [
                {
                    pattern: '/alarm',
                    callback: () => {
                        const alarm = this.clock.getAlarm(state);
                        if (alarm) {
                            this.alarmEdit.openPage('Edit Alarm', alarm);
                        } else {
                            this.alarmEdit.openPage('New Alarm');
                        }
                    }
                }, {
                    pattern: '/stopwatch',
                    callback: () => {
                        this.stopwatchPage.openPage('Stopwatch', this.clock.stopwatch);
                    }
                }, {
                    pattern: '/timer',
                    callback: () => {
                        this.timerPage.openPage('Timer', this.clock.timer);
                    }
                },
            ]);
        }

        this.history.onStateChange(handleChange);

        this.device.addEventListener('openAppFinished', () => {
            const history = parent.device.getHistory('clock');
            if (!history) return;
            // console.log('OPEN_PAGE', history);
            this.history.init(history);
            history.forEach((item: HistoryState) => {
                handleChange(item.state, item.url);
            })
        })

        this.device.addEventListener('closeApp', () => {
            // console.log('CLOSE_PAGE', JSON.stringify(this.history.history));
            this.device.setHistory('clock', this.history.history);
        });

    }
}