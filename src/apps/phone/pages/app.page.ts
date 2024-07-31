import { App } from "../../../components/app";
import { PhoneController } from "../../../controllers/phone.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Block } from "../../../stores/blocked.store";
import { Contact } from "../../../stores/contact.store";
import { History, HistoryType } from "../../../stores/history.store";

export interface PhoneAppData {
    contacts: Contact[];
    histories: History[];
    blockeds: Block[];
}

type HistoryWithBlock = History & { isBlocked: boolean; };

export class PhoneApp extends App {
    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private phone: PhoneController,
    ) {
        super(history, { btnStart: 'apps', btnEnd: 'person' });
        this.component.classList.add('historiesPage');
        this.init();
        this.render({
            contacts: this.phone.contacts,
            histories: this.phone.histories,
            blockeds: this.phone.blockeds,
        });
    }

    private init() {
        this.addEventListener('click', () => {
            this.history.pushState('/contacts', null);
        }, this.btnEnd, false);

        this.addEventListener('click', () => {
            this.history.pushState('/dialpad', null);
        }, this.btnStart, false);

        const phoneListener = () => {
            this.update('update', {
                contacts: this.phone.contacts,
                histories: this.phone.histories,
                blockeds: this.phone.blockeds,
            });
        };

        this.phone.addChangeListener(phoneListener);

        this.device.addEventListener('closeApp', () => {
            this.phone.removeChangeListener(phoneListener);
        });
    }

    render(data: PhoneAppData) {
        if (!data.histories.length) return this.renderNoData('Make a Call');

        const sortedList = this.sortByDate(data);
        const scrollArea = this.createScrollArea();
        const noteList = this.createElement('ul', ['titleList']);
        sortedList.forEach(item => {
            const noteTitle = this.createElement('li', ['titleItem', 'textLarge']);
            if (item.isBlocked) noteTitle.classList.add('blocked');
            noteTitle.innerHTML = `
                <span class="iconContainer">
                    <span class="material-symbols-outlined">${this.getIcon(item.type)}</span>
                </span>
                <span class="contactName">${item.contact ? `${item.contact.firstName} ${item.contact.lastName}` : item.number}${item.isViewed ? "" : '*'}</span>
            `;
            this.addEventListener('click', () => {
                this.history.pushState('/history', item.number);
                noteTitle.innerHTML = `
                    <span class="iconContainer">
                        <span class="material-symbols-outlined">${this.getIcon(item.type)}</span>
                    </span>
                    <span class="contactName">${item.contact ? `${item.contact.firstName} ${item.contact.lastName}` : item.number}</span>
                `;
            }, noteTitle);
            noteList.appendChild(noteTitle);
        });
        scrollArea.appendChild(noteList);
        this.mainArea.appendChild(scrollArea);
    }

    update(_: string, data: PhoneAppData) {
        this.mainArea.innerHTML = '';
        this.removeAllEventListeners();
        this.render(data);
    }

    private getIcon(type: HistoryType) {
        const iconObj: Record<HistoryType, string> = {
            'outgoing_call': 'call_made',
            'incoming_call': 'call_received',
            'from_miss_call': 'call_missed',
            'to_miss_call': 'call_missed_outgoing',
            'from_message': 'chat_bubble',
            'to_message': 'mode_comment'
        }

        return iconObj[type];
    }

    private sortByDate(data: PhoneAppData): HistoryWithBlock[] {
        return this.removeDuplicatesAndGetLatestDate(data).sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
    }

    private removeDuplicatesAndGetLatestDate(data: PhoneAppData): Array<History & { isBlocked: boolean; }> {
        const uniqueContacts: { [id: string]: HistoryWithBlock } = {};

        data.histories.forEach(item => {
            let id: string;
            const contact = data.contacts.find(c => c.phones.some(p => p.number === item.number));

            let isBlocked = false;

            if (contact) {
                item.contact = contact;
                id = contact.id;
                isBlocked = this.isBlock(contact.phones.map(p => p.number), data.blockeds);
            } else {
                id = item.number;
                item.contact = undefined;
                isBlocked = this.isBlock([item.number], data.blockeds);
            }

            if (!uniqueContacts[id] || new Date(item.date) > new Date(uniqueContacts[id].date)) {
                uniqueContacts[id] = { ...item, isBlocked };
            }
        });

        return Object.values(uniqueContacts);
    }

    private isBlock(numbers: string[], blockeds: Block[]) {
        const blocked = blockeds.find(item => numbers.includes(item.number));
        return !!blocked;
    }
}