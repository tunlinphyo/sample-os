export class OSArray {
    constructor() {}

    public static isEqualItems(arr1: string[], arr2: string[]): boolean {
        if (arr1.length !== arr2.length) {
            return false;
        }

        const sortedArr1 = arr1.slice().sort();
        const sortedArr2 = arr2.slice().sort();

        for (let i = 0; i < sortedArr1.length; i++) {
            if (sortedArr1[i] !== sortedArr2[i]) {
                return false;
            }
        }

        return true;
    }

    public static getRandomElement<T>(array: T[]): T {
        if (array.length === 0) {
            throw new Error("Array cannot be empty");
        }
        const randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    }

    public static pickFirst<T>(A: T[], B: T[]) {
        for (let i = 0; i < A.length; i++) {
            if (!B.includes(A[i])) {
                return A[i]
            }
        }
    }

}