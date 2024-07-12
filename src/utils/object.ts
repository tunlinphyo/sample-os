

export class OSObject {
    public static deepClone<T>(obj: T): T {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            const arrCopy: any[] = [];
            for (const item of obj) {
                arrCopy.push(OSObject.deepClone(item));
            }
            return arrCopy as any;
        }

        const objCopy: { [key: string]: any } = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                objCopy[key] = OSObject.deepClone(obj[key]);
            }
        }
        return objCopy as T;
    }
}