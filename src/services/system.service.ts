export type SystemName = 'phone' | 'alarm' | 'timer' | 'update';

export interface SystemInterface {
    name: SystemName;
    status: boolean;
}

export class SystemService {
    private _system: Record<string, boolean> = {};

    constructor() {}

    get system(): Record<SystemName, boolean> {
        return this._system;
    }
    get isSystem(): boolean {
        let is: boolean = false;
        for(const value of Object.values(this._system)) {
            if (value) is = true;
        }
        return is;
    }
    get isPhone(): boolean {
        return this._system.phone ?? false;
    }
    get isUpdate(): boolean {
        return this._system.update ?? false;
    }

    set system(data: SystemInterface) {
        this._system[data.name] = data.status;
    }
}