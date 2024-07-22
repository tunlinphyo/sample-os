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

    public getHourMinutes() {
        const hours = this.date.getHours();
        const minutes = this.date.getMinutes();
        return (hours * 60) + minutes;
    }

    public getHour(hour12: boolean) {
        const hours = this.date.getHours();

        if (!hour12) return String(hours).padStart(2, '0');

        const isAm = hours < 12 ? 'AM' : 'PM';

        const hour = String(hours % 12 || 12).padStart(2, '0')

        return `${hour} ${isAm}`
    }

    public timeObject(rounded?: boolean, timeZone?: string): { hour: number, minute: number, isAm: boolean } {
        const dateUTC = getDateByTimeZone(this.date, timeZone);
        const minutes = dateUTC.getMinutes();
        if (rounded) {
            const roundedMinutes = Math.round(minutes / 5) * 5;
            dateUTC.setMinutes(roundedMinutes);
        } else {
            dateUTC.setMinutes(minutes);
        }
        dateUTC.setSeconds(0);
        dateUTC.setMilliseconds(0);

        const hours = dateUTC.getHours();
        const minute = dateUTC.getMinutes();
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

    public static formatShortDate(date: Date, timeZone?: string): string {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        };
        const dateUTC = getDateByTimeZone(date, timeZone);
        return new Intl.DateTimeFormat('en-US', options).format(dateUTC);
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

    public static formatTime(date: Date, hour12: boolean, timeZone?: string): string {
        const dateUTC = getDateByTimeZone(date, timeZone);
        const options: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12,
        };
        return new Intl.DateTimeFormat('en-US', options).format(dateUTC);
    }

    public static getFormatTime(date: Date, hour12: boolean, timeZone?: string): string {
        const options: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12,
        };
        const dateUTC = getDateByTimeZone(date, timeZone);
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

    public static getNextIncrementTime(date: Date, rounded: number = 10, timeZone?: string): Date {
        const now = getDateByTimeZone(new Date(), timeZone);
        const minutes = now.getMinutes();
        const roundedMinutes = Math.floor(minutes / rounded) * rounded;

        const newDate = new Date(date);
        newDate.setHours(now.getHours());
        newDate.setMinutes(roundedMinutes + rounded);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);

        return newDate;
    }

    public static oldestDate() {
        return new Date(-8640000000000000);
    }

    public static getUniqueIdFromDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}${month}${day}`;
    }

    public static getHMinM(date: Date) {
        const hours = date.getHours();
        const minutes = date.getMinutes();

        return (hours * 60) + minutes;
    }

    public static getMinutesDifference(date1: Date, date2: Date): number {
        const time1 = date1.getTime();
        const time2 = date2.getTime();

        const differenceInMilliseconds = Math.abs(time2 - time1);
        const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));

        return differenceInMinutes;
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