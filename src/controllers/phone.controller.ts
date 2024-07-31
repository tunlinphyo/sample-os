import { Contact, ContactsStore, ContactWithBlock } from '../stores/contact.store';
import { History, HistoryStore } from "../stores/history.store";
import { Block, BlocksStore } from '../stores/blocked.store';
import { BaseController } from './base.controller';

export type PhoneStatus = 'HISTORY_LOADED';

export class PhoneController extends BaseController {
    public histories: History[] = [];
    public contacts: Contact[] = [];
    public blockeds: Block[] = [];

    constructor (
        public historyStore: HistoryStore,
        public contactsStore: ContactsStore,
        public blocksStore: BlocksStore
    ) {
        super();
        this.setupListeners();
    }

    private setupListeners() {
        this.historyStore.listen((histories) => {
            this.histories = histories;
        });

        this.contactsStore.listen((contacts) => {
            this.contacts = contacts;
        });

        this.blocksStore.listen((blockeds) => {
            this.blockeds = blockeds;
        });
    }

    public getContact(id: string) {
        const contact = this.contacts.find(contact => contact.id === id)!;
        (contact as ContactWithBlock).isBlocked = this.blocksStore.isBlock(contact.phones.map(p => p.number));
        return contact as ContactWithBlock;
    }

    public getHistoryByNumber(number: string) {
        const contact = this.contactsStore.findContactByNumber(number);
        let numbers: string[] = [];
        if (contact) {
            numbers = contact.phones.map(phone => phone.number);
        } else {
            numbers.push(number);
        }
        return this.historyStore.getHistoryByNumbers(numbers);
    }

    public getAppData(): [ Contact[],  History[], Block[] ] {
        return [ this.contacts, this.histories, this.blockeds ];
    }

    public async updateContact(contact: Contact) {
        this.tryThis(async () => {
            let id: string | undefined;
            if (contact.id) {
                id = await this.contactsStore.update(contact.id, contact);
            } else {
                id = await this.contactsStore.add(contact);
            }
            this.notifyListeners('CONTACT_UPDATED', this.getContact(id));
        });
    }

    public deleteContact(contact: Contact) {
        this.tryThis(async () => {
            await this.contactsStore.del(contact.id);
            this.notifyListeners('CONTACT_DELETED', contact);
        });
    }

    public blockNumber(contact: Contact | string) {
        this.tryThis(async () => {
            if (typeof contact === 'object') {
                const numbers = contact.phones.map(item => ({ id: item.number, number: item.number }));
                await this.blocksStore.addList(numbers);
                this.notifyListeners('BLOCKED_CONTACT', this.getContact(contact.id));
            } else {
                await this.blocksStore.add({ id: contact, number: contact });
                this.notifyListeners('BLOCKED_NUMBER', contact);
            }
        });
    }

    public unblockNumber(contact: Contact | string) {
        this.tryThis(async () => {
            if (typeof contact === 'object') {
                const numbers = contact.phones.map(item => item.number);
                await this.blocksStore.delMany(numbers);
                this.notifyListeners('UNBLOCKED_CONTACT', this.getContact(contact.id));
            } else {
                await this.blocksStore.del(contact);
                this.notifyListeners('UNBLOCKED_NUMBER', contact);
            }
        });
    }

    public addHistory(data: Omit<History, "id">) {
        this.tryThis(async () => {
            await this.historyStore.add(data);
            this.notifyListeners('HISTORY_ADDED', data.number);
            if (!data.isViewed) {
                const status = data.type === 'from_message' ? 'MESSAGE_NOTI' : 'PHONE_NOTI';
                this.notifyListeners(status, data.number);
            }
        })
    }

    public deleteHistory(number: string) {
        this.tryThis(async () => {
            await this.historyStore.delMany(number);
            this.notifyListeners('HISTORY_DELETED', number);
        });
    }

    public getContactsWithBlock() {
        return this.contacts.map(item => {
            return this.getBlock(item)!;
        })
    }

    private getBlock(contact: Contact) {
        (contact as ContactWithBlock).isBlocked = this.blocksStore.isBlock(contact.phones.map(p => p.number));
        return contact as ContactWithBlock;
    }

    public isBlock(number: string) {
        return this.blocksStore.isBlock([number]);
    }
}