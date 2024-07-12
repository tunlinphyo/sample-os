type Listener<T> = (newValue: T, oldValue: T) => void;

export class ObservableParameter<T> {
    private _value: T;
    private listeners: Listener<T>[] = [];

    constructor(initialValue: T) {
        this._value = initialValue;
    }

    get value(): T {
        return this._value;
    }

    set value(newValue: T) {
        if (newValue !== this._value) {
            const oldValue = this._value;
            this._value = newValue;
            this.notifyListeners(newValue, oldValue);
        }
    }

    addListener(listener: Listener<T>): void {
        this.listeners.push(listener);
    }

    private notifyListeners(newValue: T, oldValue: T): void {
        for (const listener of this.listeners) {
            listener(newValue, oldValue);
        }
    }
}

export function createObservableParameters<T extends {}>(initialValues: T): { [K in keyof T]: ObservableParameter<T[K]> } {
    const observableParameters: Partial<{ [K in keyof T]: ObservableParameter<T[K]> }> = {};

    for (const key in initialValues) {
        if (initialValues.hasOwnProperty(key)) {
            observableParameters[key] = new ObservableParameter(initialValues[key]);
        }
    }

    return observableParameters as { [K in keyof T]: ObservableParameter<T[K]> };
}


// Example usage for string, number, and date

const observableString = new ObservableParameter<string>("initial");
const observableNumber = new ObservableParameter<number>(0);
const observableDate = new ObservableParameter<Date>(new Date());

// Adding listeners
observableString.addListener((newValue, oldValue) => {
    console.log(`String changed from "${oldValue}" to "${newValue}"`);
});

observableNumber.addListener((newValue, oldValue) => {
    console.log(`Number changed from ${oldValue} to ${newValue}`);
});

observableDate.addListener((newValue, oldValue) => {
    console.log(`Date changed from ${oldValue.toISOString()} to ${newValue.toISOString()}`);
});

// Changing values
observableString.value = "changed"; // Logs: String changed from "initial" to "changed"
observableNumber.value = 42; // Logs: Number changed from 0 to 42
observableDate.value = new Date(2025, 0, 1); // Logs: Date changed from <initial date> to 2025-01-01T00:00:00.000Z