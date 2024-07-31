export type ChangeListener<T> = (items: T[], changedItem: T | null, operation: string) => void;

export abstract class BaseManager<T extends { id: string; }> {
    protected items: T[] = [];
    protected listeners: ChangeListener<T>[] = [];

    constructor(initialItems: T[] = []) {
        this.items = initialItems;
    }

    abstract getId(item: T): string;
    abstract setId(item: T, id: string): T;

    abstract add(item: Omit<T, 'id'>, id?: string): Promise<string>;
    abstract update(id: string, item: Partial<Omit<T, 'id'>>): Promise<string>;
    abstract del(id: string): Promise<string>;
    abstract resetStore(): Promise<any>;
    abstract listen(callback: ChangeListener<T>): void;

    public getAll(): T[] {
        return this.items
    }

    public get(id: string): T|null {
        const item = this.items.find(item => item.id === id)
        return item || null
    }

    protected addItem(id: string, item: Omit<T, 'id'>): void {
        const newItem = this.setId(item as T, id);
        this.items.push(newItem);
        this.notifyListeners(newItem, 'add');
    }

    protected addMany(items: T[]) {
        items.forEach(item => {
            const newItem = this.setId(item as T, item.id);
            this.items.push(newItem);
        });
        this.notifyListeners(null, 'add');
    }

    protected editItem(id: string, updatedItem: Partial<Omit<T, 'id'>>): void {
        const itemIndex = this.items.findIndex(item => this.getId(item) === id);
        if (itemIndex !== -1) {
            this.items[itemIndex] = { ...this.items[itemIndex], ...updatedItem };
            this.notifyListeners(this.items[itemIndex], 'edit');
        } else {
            throw new Error(`Item with id ${id} not found.`);
        }
    }

    protected updateMany(edited: T[]) {
        for (const data of edited) {
            const itemIndex = this.items.findIndex(item => this.getId(item) === this.getId(data));
            if (itemIndex !== -1) {
                this.items[itemIndex] = { ...this.items[itemIndex], ...data };
            }
        }
        this.notifyListeners(null, 'edit');
    }

    protected deleteItem(id: string): void {
        const itemIndex = this.items.findIndex(item => this.getId(item) === id);
        if (itemIndex !== -1) {
            const deletedItem = this.items.splice(itemIndex, 1)[0];
            this.notifyListeners(deletedItem, 'delete');
        } else {
            throw new Error(`Item with id ${id} not found.`);
        }
    }

    protected deleteMany(ids: string[]): void {
        this.items = this.items.filter(item => !ids.includes(item.id))
        this.notifyListeners(null, 'delete');
    }

    protected getItems(): T[] {
        return [...this.items];
    }
    protected setItems(items: T[]) {
        this.items = items
    }

    protected addChangeListener(listener: ChangeListener<T>): void {
        this.listeners.push(listener);
    }

    protected removeChangeListener(listener: ChangeListener<T>): void {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    protected notifyListeners(changedItem: T | null, operation: string): void {
        this.listeners.forEach(listener => listener(this.getItems(), changedItem, operation));
    }
}