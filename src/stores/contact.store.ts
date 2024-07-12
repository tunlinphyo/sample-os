import { DB } from "./db";
import { BaseManager, ChangeListener } from "./data";
import { OSArray } from "../utils/arrays";

export interface Phone {
    type: string; // e.g., "home", "work", "mobile"
    number: string;
};

export interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    phones: Phone[]; // at least one phone number is required
    email?: string;
    socialMedia?: {
        twitter?: string;
        linkedIn?: string;
        facebook?: string;
        instagram?: string;
    };
}

export type ContactWithBlock = Contact & { isBlocked: boolean };

export interface GroupedContacts {
    letter: string;
    contacts: Contact[];
};

export class ContactsStore extends BaseManager<Contact> {
    private db: DB<Contact>;

    constructor() {
        super([])
        this.db = new DB<Contact>('contacts')
        this.init()
    }

    async init() {
        const items = await this.db.getAll()
        this.setItems(items);
        this.notifyListeners(null, 'loaded');
    }

    getId(contact: Contact): string {
        return contact.id;
    }

    setId(contact: Contact, id: string): Contact {
        return { ...contact, id };
    }

    async add(item: Contact) {
        const result = this.isDuplicate(item, this.items)
        if (result) throw new Error(result)
        const id = await this.db.post(item)
        this.addItem(id, item)
        return id
    }

    async update(id: string, item: Contact): Promise<string> {
        const result = this.isDuplicate(item, this.items.filter(i => i.id !== id))
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

    listen(callback: ChangeListener<Contact>): void {
        this.addChangeListener((items, changedItem, operation) => {
            callback(items, changedItem, operation)
        })
    }

    findContactByNumber(number: string) {
        const contact = this.items.find(item => {
            const numbers = item.phones.map(p => p.number)
            return (numbers.includes(number))
        })
        if (contact) return contact
        return null
    }

    public getRandomContact() {
        return OSArray.getRandomElement(this.items) as Contact
    }

    private isDuplicate(newContact: Contact, existingContacts: Contact[]): string {
        for (const contact of existingContacts) {
            if (contact.firstName === newContact.firstName && contact.lastName === newContact.lastName) {
                return `${contact.firstName} ${contact.lastName} exists`;
            }
            for (const newPhone of newContact.phones) {
                for (const existingPhone of contact.phones) {
                    if (newPhone.number === existingPhone.number) {
                        return `${existingPhone.number} exists`;
                    }
                }
            }
        }
        return '';
    }

    public resetStore() {
        return this.db.clear();
    }
}