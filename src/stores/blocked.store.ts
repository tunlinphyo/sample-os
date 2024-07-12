import { DB } from "./db";
import { BaseManager, ChangeListener } from "./data";

export interface Block {
    id: string;
    number: string;
}

export class BlocksStore extends BaseManager<Block> {
    private db: DB<Block>;

    constructor() {
        super([])
        this.db = new DB<Block>('blocks')
        this.init()
    }

    async init() {
        const items = await this.db.getAll()
        this.setItems(items);
        this.notifyListeners(null, 'loaded');
    }

    getId(contact: Block): string {
        return contact.id;
    }

    setId(contact: Block, id: string): Block {
        return { ...contact, id };
    }

    async add(item: Block) {
        const result = this.isDuplicate(item.number, this.items)
        if (result) throw new Error(result)
        const id = await this.db.post(item, item.number)
        this.addItem(id, item)
        return id
    }

    async addList(items: Block[]) {
        const blockeds = this.removeDuplicate(items as Block[], this.items);
        const result = await this.db.postMany(blockeds);
        this.addMany(result);
        return result;
    }

    async update(id: string, item: Block): Promise<string> {
        const result = this.isDuplicate(item.number, this.items.filter(i => i.id !== id))
        if (result) throw new Error(result)
        await this.db.put(id, item)
        this.editItem(id, item)
        return id
    }

    async del(id: string): Promise<string> {
        await this.db.del(id)
        this.deleteItem(id)
        return id
    }

    async delMany(ids: string[]) {
        await this.db.delMany(ids);
        this.deleteMany(ids);
        return ids;
    }

    listen(callback: ChangeListener<Block>): void {
        this.addChangeListener((items, changedItem, operation) => {
            callback(items, changedItem, operation)
        })
    }

    public resetStore() {
        return this.db.clear();
    }

    public isBlock(numbers: string[]) {
        const result = this.items.filter(item => numbers.includes(item.number));
        return !!result.length;
    }

    private isDuplicate(number: string, items: Block[]) {
        const is = items.find(item => number === item.number);
        return is?.number || '';
    }

    private removeDuplicate(blocks: Block[], items: Block[]) {
        const newBlocks: Block[] = [];
        blocks.forEach(item => {
            if (!this.isDuplicate(item.number, items)) {
                newBlocks.push(item);
            }
        });

        return newBlocks;
    }
}