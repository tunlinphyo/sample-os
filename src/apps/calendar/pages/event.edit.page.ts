import { FormComponent } from "../../../components/form";
import { CustomDateTimeForm, CustomInputForm, CustomSelectForm, CustomToggleForm } from "../../../components/form/form-elem";
import { calendarEventDescriptions, calendarEvents } from "../../../components/keyboard/consts";
import { Modal } from "../../../components/modal";
import { SelectItem } from "../../../components/select";
import { CalendarController } from "../../../controllers/calendar.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { CalendarEvent, EndRepeatType, RepeatType } from "../../../stores/event.store";
import { OSDate } from "../../../utils/date";

class EventForm extends FormComponent {
    private event: CalendarEvent | undefined;

    private frequency: SelectItem[] = [
        {
            title: 'Never',
            value: 'never',
        },
        {
            title: 'Every Day',
            value: 'daily',
        },
        {
            title: 'Every Week',
            value: 'weekly',
        },
        {
            title: 'Every Month',
            value: 'monthly',
        },
        {
            title: 'Every Year',
            value: 'yearly',
        },
    ];
    private until: SelectItem[] = [
        {
            title: 'Never',
            value: 'never',
        },
        {
            title: 'On Date',
            value: 'date',
        }
    ];

    private title: CustomInputForm | undefined;
    private allDay: CustomToggleForm | undefined;
    private startTime: CustomDateTimeForm | undefined;
    private endTime: CustomDateTimeForm | undefined;
    private description: CustomInputForm | undefined;
    private repeat: CustomSelectForm | undefined;
    private endRepeat: CustomSelectForm | undefined;
    private endDate: CustomDateTimeForm | undefined;

    constructor(device: DeviceController, parent: HTMLElement) {
        super(device, 'eventForm', parent)
        this.init()
    }

    private init() { }

    render(event?: CalendarEvent, date?: Date) {
        if (!event) {
            const d = date || new Date()
            this.event = {
                id: '',
                title: '',
                description: '',
                startTime: new Date(d),
                endTime: OSDate.addHour(d),
                allDay: false,
                repeat: 'never',
                endRepeat: "never",
                until: new Date(d)
            };
        } else {
            this.event = event
        }

        this.title = this.input({
            label: 'Event Name',
            type: 'text',
            defaultValue: this.event.title,
            keys: calendarEvents,
        })

        const dateTimeGroup = this.createGroup()

        this.allDay = this.toggle({
            label: 'All-day',
            defaultValue: this.event.allDay || false
        }, dateTimeGroup)
        this.startTime = this.dateTime({
            label: 'Starts',
            type: 'date-time',
            defaultValue: this.event.startTime
        }, dateTimeGroup)
        this.endTime = this.dateTime({
            label: 'Ends',
            type: 'date-time',
            defaultValue: this.event.endTime
        }, dateTimeGroup)

        if (this.event.allDay) {
            this.startTime.toggleTime(false)
            this.endTime.toggle(false)
        }

        this.appendElement(dateTimeGroup);

        const repeatGroup = this.createGroup()

        this.repeat = this.select({
            label: 'Repeat',
            defautValue: this.event.repeat,
            list: this.frequency
        }, repeatGroup)
        this.endRepeat = this.select({
            label: 'End Repeat',
            defautValue: this.event.endRepeat,
            list: this.until
        }, repeatGroup)
        this.endDate = this.dateTime({
            label: 'End Date',
            type: 'date',
            defaultValue: this.event.until || new Date()
        }, repeatGroup)

        let repeat = this.event.repeat,
            endRepeat = this.event.endRepeat;
        const renderRepeat = (repeat: string, endRepeat: string) => {
            const isEndRepeat = repeat != 'never';
            const isEndDate = repeat != 'never' && endRepeat != 'never'

            this.endRepeat?.toggle(isEndRepeat);
            this.endDate?.toggle(isEndDate);
        }

        renderRepeat(repeat, endRepeat)

        this.appendElement(repeatGroup);

        this.description = this.input({
            label: 'Description',
            type: 'textarea',
            defaultValue: this.event.description || '',
            keys: calendarEventDescriptions,
        })

        this.allDay.addEventListener<boolean>('change', (data) => {
            this.startTime?.toggleTime(!data)
            this.endTime?.toggle(!data)
        })
        this.startTime.addEventListener<Date>('change', (data) => {
            this.endTime!.value = OSDate.addHour(data)
        })
        this.repeat.addEventListener<RepeatType>('change', (data) => {
            repeat = data
            renderRepeat(data, endRepeat)
        })
        this.endRepeat.addEventListener<EndRepeatType>('change', (data) => {
            endRepeat = data
            renderRepeat(repeat, data)
        })
    }

    getData(): CalendarEvent[] {
        const allDay = this.allDay?.value;
        const startTime = new Date(this.startTime!.value);
        const endTime = new Date(this.endTime!.value);

        if (!this.title!.value) return [];
        if (startTime > endTime) return [];

        if (allDay) {
            startTime.setHours(0, 0, 0, 0);
            endTime.setHours(23, 59, 59, 999);
        }

        const events: CalendarEvent[] = [];
        let currentStart = new Date(startTime);

        while (currentStart < endTime) {
            const currentEnd = new Date(currentStart);
            currentEnd.setHours(23, 59, 59, 999);

            if (currentEnd > endTime) {
                currentEnd.setTime(endTime.getTime());
            }

            events.push({
                id: this.event?.id || "",
                title: this.title!.value,
                description: this.description!.value,
                startTime: new Date(currentStart),
                endTime: new Date(currentEnd),
                allDay,
                repeat: this.repeat!.value as RepeatType,
                endRepeat: this.endRepeat!.value as EndRepeatType,
                until: this.endDate!.value,
            });

            // Move to the next day
            currentStart.setDate(currentStart.getDate() + 1);
            currentStart.setHours(0, 0, 0, 0);
        }

        return events;
    }
}

export class EventEditPage extends Modal {
    private form: EventForm | undefined;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private calendar: CalendarController
    ) {
        super(history, { btnEnd: 'check' });
        this.init();
    }

    private init() {
        this.addEventListener('click', () => {
            const events = this.form!.getData();
            events.forEach(event => {
                this.calendar.updateEvent(event);
            });
        }, this.btnEnd, false);

        const calendarListener = (status: string) => {
            switch (status) {
                case 'EVENT_UPDATED':
                    this.closePage();
                    break;
            }
        };

        this.calendar.addChangeListener(calendarListener);

        this.device.addEventListener('closeApp', () => {
            this.calendar.removeChangeListener(calendarListener);
        });
    }

    render(data: CalendarEvent | Date) {
        this.form = new EventForm(this.device, this.mainArea)
        if (data instanceof Date) this.form.render(undefined, data)
        else this.form.render(data)
    }

    update() {}
}