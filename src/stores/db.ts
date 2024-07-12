import { get, set, createStore, entries, del, delMany, setMany, clear } from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';

export class DB<T extends { id?: string }> {
    private store: any = null;

    constructor(private readonly name: string) {
        this.contactsStore();
    }

    contactsStore() {
        if (!this.store) {
            this.store = createStore(`${this.name}-store`, this.name);
        }
    }

    public async getAll() {
        try {
            const list = await entries(this.store)
            return list.map(([id, value]) => ({ ...value, id })) as T[]
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("Unknown error");
            }
        }
    }

    public async getAllBy(key: string, value: any) {
        try {
            const list = await entries(this.store)
            const items = list.filter(item => item[1][key] === value)
            return items.map(([id, value]) => ({ ...value, id })) as T[]
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("Unknown error");
            }
        }
    }

    public async get(uuid: string) {
        try {
            return (await get(uuid, this.store)) as T
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("Unknown error");
            }
        }
    }

    public async post(value: Omit<T, 'id'>, id?: string) {
        try {
            const uuid = id || uuidv4()
            await set(uuid, value, this.store)
            return uuid
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("Unknown error");
            }
        }
    }

    public async postMany(values: T[]): Promise<T[]> {
        try {
            const list = this.formatData(values);
            await setMany(list, this.store)
            return list.map(([id, value]) => ({ ...value, id }));
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("Unknown error");
            }
        }
    }

    public async put(uuid: string, value: Partial<T>) {
        try {
            const newData = { ...value }
            if (newData.id) delete newData.id
            await set(uuid, newData, this.store)
            return uuid
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("Unknown error");
            }
        }
    }

    public async patch(uuid: string, value: Partial<T>) {
        try {
            const data = await this.get(uuid)
            if (!data) return null
            const newValue = Object.assign(data, value)
            if (newValue.id) delete newValue.id
            await set(uuid, newValue, this.store)
            return uuid
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("Unknown error");
            }
        }
    }

    public async del(uuid: string) {
        try {
            return del(uuid, this.store)
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("Unknown error");
            }
        }
    }

    public async delMany(uuids: string[]) {
        try {
            return delMany(uuids, this.store)
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("Unknown error");
            }
        }
    }

    public async clear() {
        return clear(this.store);
    }

    private formatData(dataList: T[]) {
        const list: [string, T][] = [];
        for (const data of dataList) {
            list.push([data.id || uuidv4(), data]);
        }
        return list;
    }
}