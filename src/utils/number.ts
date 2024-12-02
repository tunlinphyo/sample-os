

export class OSNumber {
    constructor() {

    }

    public static inRange(num: number, range: [number, number]) {
        const min = Math.min(num, range[1]);
        return Math.max(min, range[0]);
    }

    public static isInRange(num: number, range: [number, number]) {
        return num >= range[0] && num <= range[1];
    }

    public static mapRange(num: number, value1: number, value2: number, range1: number, range2: number): number {
        const proportion = (num - value1) / (value2 - value1);
        const mappedValue = range1 + (proportion * (range2 - range1));
        return mappedValue;
    }

    public static getPercentage(value: number, total: number, limit: boolean = true) {
        if (limit) {
            return Math.max(Math.min(value / total * 100, 100), 0);
        }
        return value / total * 100;
    }

    public static clamp(value: number, minmax: [number, number]) {
        return Math.min(Math.max(value, minmax[0]), minmax[1]);
    }
}