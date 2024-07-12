export class OSDate {
    private date: Date;

    constructor(date?: Date) {
        this.date = new Date(date || new Date());
    }

    public getYearMonthDay(): { year: number, month: number, day: number } {
        return {
            year: this.date.getFullYear(),
            month: this.date.getMonth(),
            day: this.date.getDate()
        }
    }

    public get12Hour() {
        const hours = this.date.getHours();
        const isAm = hours < 12 ? 'AM' : 'PM';

        const hour = String(hours % 12 || 12).padStart(2, '0')

        return `${hour} ${isAm}`
    }

    public getHourMinus() {
        return {
            hours: this.date.getHours(),
            minutes: this.date.getMinutes()
        }
    }

    public getHour() {
        const hours = this.date.getHours();
        const isAm = hours < 12 ? 'AM' : 'PM';

        const hour = String(hours % 12 || 12).padStart(2, '0')

        return `${hour} ${isAm}`
    }

    public timeObject(rounded?: boolean): { hour: number, minute: number, isAm: boolean } {
        const minutes = this.date.getMinutes();
        if (rounded) {
            const roundedMinutes = Math.round(minutes / 5) * 5;
            this.date.setMinutes(roundedMinutes);
        } else {
            this.date.setMinutes(minutes);
        }
        this.date.setSeconds(0);
        this.date.setMilliseconds(0);

        const hours = this.date.getHours();
        const minute = this.date.getMinutes();
        const isAm = hours < 12 ? true : false;

        return {
            hour: hours,
            minute: minute,
            isAm
        }
    }

    public isOlderThan(date: Date): boolean {
        const date1Year = date.getFullYear();
        const date1Month = date.getMonth();
        const date1Date = date.getDate();

        const date2Year = this.date.getFullYear();
        const date2Month = this.date.getMonth();
        const date2Date = this.date.getDate();

        if (date1Year < date2Year) {
            return true;
        } else if (date1Year === date2Year) {
            if (date1Month < date2Month) {
                return true;
            } else if (date1Month === date2Month) {
                if (date1Date < date2Date) {
                    return true;
                }
            }
        }
        return false;
    }

    public isSameDay(date: Date): boolean {
        return date.getFullYear() === this.date.getFullYear() &&
               date.getMonth() === this.date.getMonth() &&
               date.getDate() === this.date.getDate();
    }

    public getDateByTimeZone(timeZone?: string): Date {
        return getDateByTimeZone(this.date, timeZone);
    }

    public static formatDate(date: Date, timeZone: string, addYear?: boolean, addWeek?: boolean) {
        const today = getDateByTimeZone(new Date(), timeZone);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else if (date >= startOfWeek && date <= endOfWeek) {
            return dayOfWeek;
        } else {
            const options: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit' };
            if (addYear) options.year = 'numeric';
            if (addWeek) options.weekday = 'short';
            return date.toLocaleDateString('en-US', options);
        }
    }

    public static formatShortDate(date: Date): string {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    }

    public static formatFullDate(date: Date, weekDays?: boolean) {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: '2-digit'
        };
        if (weekDays) {
            options.weekday = 'long';
        }
        return new Intl.DateTimeFormat('en-US', options).format(date);
    }

    public static formatTime(date: Date, timeZone?: string): string {
        const dateUTC = getDateByTimeZone(date, timeZone);
        const options: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        };
        return new Intl.DateTimeFormat('en-US', options).format(dateUTC);
    }

    public static get24Hour(hour: number, isAm: boolean): number {
        if (hour < 1 || hour > 12) {
            throw new Error("Invalid hour. Hour must be between 1 and 12.");
        }

        if (!isAm && hour !== 12) {
            return hour + 12;
        } else if (isAm && hour === 12) {
            return 0;
        } else {
            return hour;
        }
    }

    public static addHour(date: Date, hour: number = 1) {
        const miliseconds = (60 * 60 * 1000) * hour;
        const newDate = new Date(date.getTime() + miliseconds);
        return newDate;
    }

    public static addMinutes(date: Date, minutes: number = 10) {
        const miliseconds = (60 * 1000) * minutes;
        const newDate = new Date(date.getTime() + miliseconds);
        return newDate;
    }

    public static isSameDay(date1: Date, date2: Date): boolean {
        return (
            date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear()
        );
    }

    public static secondsToHoursMinutes(seconds: number) {
        let totalHours = seconds / 3600;
        let hours = Math.floor(totalHours);
        let remainingSeconds = seconds % 3600;
        let minutes = Math.floor(remainingSeconds / 60);

        return {
            hours: hours,
            minutes: minutes
        };
    }
}

function getDateByTimeZone(date: Date, timeZone?: string): Date {
    const options: Intl.DateTimeFormatOptions = {
        timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };

    const dateUTC = new Date(date.toISOString());

    const dateString = new Intl.DateTimeFormat('en-US', options).format(dateUTC);

    const [month, day, year, hour, minute, second] = dateString.match(/\d+/g)!;

    return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
}