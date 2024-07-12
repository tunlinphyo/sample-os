import { DB } from "./db";
import { BaseManager, ChangeListener } from "./data";

export interface SettingValue {
    value: any;
}

export interface Setting {
    id: string;
    title: string;
    order: number;
    value: string;
    inList: boolean;
    data?: any;
}

export interface HomeApp {
    id: string;
    name: string;
    order: number;
    isShow: boolean;
    isSystem: boolean;
}

export interface StoreInfo {
    id: string;
    name: string;
    stores: string[];
    order: number;
}

export interface DateTimeInfo {
    autoTimeZone: boolean;
    timeZone: string;
    hour12: boolean;
}

const appList: HomeApp[] = [
    {
        id: 'phone',
        name: 'Phone',
        order: 1,
        isShow: true,
        isSystem: true,
    },
    {
        id: 'calendar',
        name: 'Calendar',
        order: 2,
        isShow: true,
        isSystem: true,
    },
    {
        id: 'calculator',
        name: 'Calculator',
        order: 3,
        isShow: true,
        isSystem: false,
    },
    {
        id: 'clock',
        name: 'Clock',
        order: 4,
        isShow: true,
        isSystem: true,
    },
    {
        id: 'music',
        name: 'Music',
        order: 5,
        isShow: false,
        isSystem: false,
    },
    {
        id: 'notes',
        name: 'Notes',
        order: 6,
        isShow: true,
        isSystem: false,
    },
    {
        id: 'maps',
        name: 'Maps',
        order: 7,
        isShow: true,
        isSystem: false,
    },
    {
        id: 'journal',
        name: 'Journal',
        order: 8,
        isShow: true,
        isSystem: false,
    },
    {
        id: 'settings',
        name: 'Settings',
        order: 9,
        isShow: true,
        isSystem: true,
    },
    {
        id: 'weather',
        name: 'Weather',
        order: 10,
        isShow: true,
        isSystem: true,
    },
    {
        id: 'wallet',
        name: 'Wallet',
        order: 11,
        isShow: false,
        isSystem: false,
    },
];

const stores: StoreInfo[] = [
    {
        id: 'phone',
        name: 'Phone',
        order: 1,
        stores: ['histories', 'contacts']
    },
    {
        id: 'calendar',
        name: 'Calendar',
        order: 2,
        stores: ['events']
    },
    {
        id: 'clock',
        name: 'Clock',
        order: 4,
        stores: ['clock', 'alarms'],
    },
    {
        id: 'notes',
        name: 'Notes',
        order: 6,
        stores: ['notes']
    },
    {
        id: 'maps',
        name: 'Maps',
        order: 7,
        stores: ['places'],
    },
    {
        id: 'journal',
        name: 'Journal',
        order: 8,
        stores: ['journal']
    },
    {
        id: 'weather',
        name: 'Weather',
        order: 10,
        stores: ['weather'],
    },
    {
        id: 'settings',
        name: 'System',
        order: 9,
        stores: ['settings']
    },
];

const defaultSettings: Setting[] = [
    {
        id: 'wifi',
        title: 'Wi-Fi',
        order: 1,
        value: 'on',
        inList: true,
    },
    {
        id: 'bluetooth',
        title: 'Bluetooth',
        order: 2,
        value: 'off',
        inList: true,
    },
    {
        id: 'cellular',
        title: 'Cellular',
        order: 3,
        value: 'on',
        inList: true,
    },
    {
        id: 'display',
        title: 'Display',
        order: 4,
        value: 'auto',
        inList: true,
    },
    {
        id: 'storage',
        title: 'Storage',
        order: 5,
        value: '',
        inList: true,
        data: stores,
    },
    {
        id: 'battery',
        title: 'Battery',
        order: 6,
        value: '',
        inList: true,
        data: stores,
    },
    {
        id: 'apps',
        title: 'Applications',
        order: 7,
        value: '',
        inList: true,
        data: appList,
    },
    {
        id: 'system',
        title: 'System',
        order: 8,
        value: '',
        inList: true,
        data: [
            {
                id: 'software-update',
                title: 'Software Update',
                version: 0.02
            },
            {
                id: 'date-time',
                title: 'Date & Time',
            }
        ],
    },
    {
        id: 'date-time',
        title: 'Date & Time',
        order: 9,
        value: '',
        inList: false,
        data: {
            autoTimeZone: false,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            hour12: true
        }
    },
]

export class SettingStore extends BaseManager<Setting> {
    private db: DB<Setting>;
    public version: number = 0.02;
    public message: string = 'Add Date & Time';

    constructor() {
        super([]);
        this.db = new DB<Setting>('settings');
        this.init();
    }

    async init() {
        let items = await this.db.getAll();
        if (!items.length) {
            items = await this.db.postMany(defaultSettings);
        }
        this.setItems(items.sort((a, b) => a.order - b.order));
        this.notifyListeners(null, 'loaded');
    }

    getId(contact: Setting): string {
        return contact.id;
    }

    setId(contact: Setting, id: string): Setting {
        return { ...contact, id };
    }

    async add(item: Setting, uuid: string) {
        const id = await this.db.post(item, uuid);
        this.addItem(id, item);
        return id;
    }

    async update(id: string, item: Setting): Promise<string> {
        await this.db.put(id, item);
        this.editItem(id, item);
        return id;
    }

    async del(id: string): Promise<string> {
        await this.db.del(id);
        this.deleteItem(id);
        return id;
    }

    listen(callback: ChangeListener<Setting>): void {
        this.addChangeListener((items, changedItem, operation) => {
            callback(items, changedItem, operation);
        })
    }

    public async resetStore() {
        this.updateValue('wifi');
        this.updateValue('bluetooth');
        this.updateValue('cellular');
        this.updateValue('display');
        this.updateApplications();
        await this.db.clear();
        const items = await this.db.postMany(defaultSettings);
        this.setItems(items.sort((a, b) => a.order - b.order));
        this.notifyListeners(null, 'updated');
    }

    toggleValue(id: string) {
        const data = this.items.find(item => item.id === id);
        if (!data) return;
        data.value = data.value === 'on' ? 'off' : 'on';
        this.update(id, data);
    }

    private updateValue(id: string) {
        const currentItem = this.items.find(i => i.id === id);
        const dataItem = defaultSettings.find(i => i.id === id);
        if (!(currentItem && dataItem)) return;
        dataItem.value = currentItem.value;
    }

    private updateApplications() {
        const currentItem = this.items.find(i => i.id === 'apps');
        const dataItem = defaultSettings.find(i => i.id === 'apps');
        if (!(currentItem && dataItem)) return;
        dataItem.data = dataItem.data.map((item: HomeApp) => {
            const is = (currentItem.data as HomeApp[]).find((i: HomeApp) => i.id == item.id);
            if (is) {
                return {
                    ...item,
                    order: is.order,
                    isShow: is.isShow
                }
            } else {
                return item
            }
        });
    }
}