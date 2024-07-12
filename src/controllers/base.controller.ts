export type ChangeListener = (type: string, data: any) => void;

export abstract class BaseController {
    private listeners: ChangeListener[] = [];

    public addChangeListener(listener: ChangeListener): void {
        this.listeners.push(listener as ChangeListener);
    }

    public removeChangeListener(listener: ChangeListener): void {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    protected notifyListeners(type: string, data: any): void {
        this.listeners.forEach(listener => listener(type, data));
    }

    protected async tryThis(callback: () => Promise<void>) {
        try {
            await callback();
        } catch (error) {
            let message = 'Unknown error';
            if (error instanceof Error) {
                message = error.message;
            }
            this.notifyListeners('ERROR', message);
        }
    }
}