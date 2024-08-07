import { PhoneLabelHandler } from "../../../components/form/form-elem";
import { Keyboard } from "../../../components/keyboard";
import { Page } from "../../../components/page";
import { ScrollBar } from "../../../components/scroll-bar";
import { SelectItem } from "../../../components/select";
import { PhoneController } from "../../../controllers/phone.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { PhoneService } from "../../../services/phone.service";
import { Contact } from "../../../stores/contact.store";
import { History, HistoryType, randomMessages } from "../../../stores/history.store";
import { OSDate } from "../../../utils/date";
import { OSObject } from "../../../utils/object";

export class HistoryPage extends Page {
    private chatHistory?: History;
    private phoneService: PhoneService;
    private scrollBar?: ScrollBar;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private phone: PhoneController
    ) {
        super(history, { btnStart: 'phone', btnEnd: 'mode_comment' });
        this.component.classList.add('historyPage');
        this.phoneService = new PhoneService(this.device, this.phone);
        this.init();
    }

    get number() {
        if (!this.chatHistory) return '';
        return this.chatHistory.number;
    }

    private init() {
        this.addEventListener('click', async () => {
            this.makeACall(this.chatHistory);
        }, this.btnStart, false);

        this.addEventListener('click', async () => {
            this.textAMessage(this.chatHistory);
        }, this.btnEnd, false);

        const phoneListener = (status: string, data: any) => {
            switch (status) {
                case 'BLOCKED_CONTACT':
                case 'BLOCKED_NUMBER':
                    this.toggleActions(true);
                    break;
                case 'UNBLOCKED_CONTACT':
                case 'UNBLOCKED_NUMBER':
                    this.toggleActions();
                    break;
                case 'CONTACT_UPDATED':
                case 'CONTACT_DELETED':
                    if (data.phones[0].number === this.number) {
                        const listA = this.phone.getHistoryByNumber(data.phones[0].number);
                        this.update('update', listA);
                    }
                    break;
                case 'HISTORY_ADDED':
                    if (data == this.number) {
                        const list = this.phone.getHistoryByNumber(data);
                        this.update('update', list);
                    }
                    break;
                case 'HISTORY_DELETED':
                    this.closePage();
                    break;
            }
        };

        this.phone.addChangeListener(phoneListener);

        this.device.addEventListener('closePage', () => {
            this.phone.removeChangeListener(phoneListener);
        });
    }

    render(data: History[]) {
        this.chatHistory = data[0];

        const title = this.chatHistory.contact
            ? `${this.chatHistory.contact.firstName} ${this.chatHistory.contact.lastName}`
            : this.chatHistory.number;

        const titleEl = this.getElement('.statusBar-title');
        const buttonTitle = this.createElement('button', ['statusBar-title'], { type: 'button' });
        buttonTitle.innerHTML = `
            ${title}
            <span class="material-symbols-outlined" style="translate: 0 1px;">arrow_right</span>`;

        this.addEventListener('click', () => {
            if (!this.chatHistory) return;
            this.showOptions({
                contact: this.chatHistory.contact,
                number: this.chatHistory.number,
            });
        }, buttonTitle);

        this.replaceElement(titleEl, buttonTitle);

        const orderedList = this.orderByDate(data);
        const scrollArea = this.createScrollArea();
        scrollArea.classList.add('reverse');
        const chatHistoryList = this.createList(['chatHistoryList']);
        orderedList.forEach(item => {
            const chatItem = this.createElement('div', ['chatItem', this.getClass(item.type)]);
            const dateTime = this.createElement('div', ['dateTime']);
            dateTime.innerText = `
                ${OSDate.formatDate(item.date, {
                    month: 'short',
                    day: "2-digit"
                }, this.device.timeZone)} ${OSDate.formatTime(item.date, this.device.hour12, this.device.timeZone)}
            `;
            const message = this.createElement('div', ['message']);
            message.innerText = this.getText(item);
            chatItem.appendChild(dateTime);
            chatItem.appendChild(message);
            chatHistoryList.appendChild(chatItem);
        });
        scrollArea.appendChild(chatHistoryList);
        this.mainArea.appendChild(scrollArea);

        if (!this.scrollBar) {
            this.scrollBar = new ScrollBar(this.component, true);
        } else {
            this.scrollBar?.reCalculate();
        }

        const isBlock = this.phone.isBlock(this.number);
        this.toggleActions(isBlock);
    }

    update(_: string, data: History[]) {
        if (!this.isActive) return;
        this.mainArea.innerHTML = '';
        this.removeAllEventListeners();
        this.render(data);
    }

    typeMessage(number: string, callback: (value: string) => void, name?: string) {
        const keyboard: Keyboard = {
            label: name || number,
            defaultValue: '',
            type: 'textarea',
            keys: randomMessages,
            btnEnd: 'send',
        };
        this.device.keyboard.open(keyboard).then(callback);
    }

    toggleActions(hide: boolean = false) {
        try {
            const btnStart = this.getElement('.actionButton.start', this.component);
            const btnEnd = this.getElement('.actionButton.end', this.component);
            if (hide) {
                btnStart.classList.add('hide');
                btnEnd.classList.add('hide');
            } else {
                btnStart.classList.remove('hide');
                btnEnd.classList.remove('hide');
            }
        } catch (error) {}
    }

    private orderByDate(history: History[]) {
        return history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    private getClass(type: HistoryType) {
        switch (type) {
            case 'incoming_call':
            case 'from_miss_call':
            case 'from_message':
                return 'from';
            default:
                return 'to';
        }
    }

    private getText({ type, data }: History) {
        if (type.includes('message')) return data as string;
        if (type === 'incoming_call') return `Incoming Call - ${data}`;
        if (type === 'outgoing_call') return `Outgoing Call - ${data}`;
        if (type.includes('miss_call')) return 'Missed Call';
        return '';
    }

    private async showOptions(data: { contact: Contact | undefined, number: string }) {
        const isBlock = this.phone.isBlock(data.number);
        if (data.contact) {
            const contact = data.contact;
            const list: SelectItem[] = [
                { title: 'Open', value: 'open', icon: 'person' },
                {
                    title: isBlock ? 'Unblock' : 'Block',
                    value: isBlock ? 'unblock' : 'block',
                    icon: 'block'
                },
                { title: 'Delete', value: 'delete', icon: 'delete' }
            ];
            const selected = await this.device.selectList.openPage('History', list);
            if (selected === 'open') {
                // this.contactPage.openPage('Contact', contact);
                this.history.pushState(`/contacts/detail`, this.phone.getContact(contact.id));
            } else if (selected === 'delete') {
                const result = await this.device.confirmPopup.openPage('Delete History', 'Are you sure to delete?');
                if (result) this.phone.deleteHistory(data.number);
            } else if (selected === 'block') {
                this.phone.blockNumber(data.contact);
            } else if (selected === 'unblock') {
                this.phone.unblockNumber(data.contact);
            }
        } else {
            let list: SelectItem[] = [];
            if (isBlock) {
                list = [
                    { title: 'Unblock', value: 'unblock', icon: 'block' },
                    { title: 'Delete', value: 'delete', icon: 'delete' },
                ];
            } else {
                list = [
                    { title: 'Create', value: 'add', icon: 'add' },
                    { title: 'Add to', value: 'addto', icon: 'person_add' },
                    { title: 'Block', value: 'block', icon: 'block' },
                    { title: 'Delete', value: 'delete', icon: 'delete' },
                ];
            }
            const selected = await this.device.selectList.openPage('History', list);
            if (selected === 'add') {
                this.history.pushState(`/contacts/new`, data.number);
            } else if (selected === 'addto') {
                const contact = await this.contactSelect();
                if (contact) {
                    const newPhone = PhoneLabelHandler.addPhone(contact.phones, data.number);
                    const clonedContact = OSObject.deepClone(contact);
                    clonedContact.phones.push(newPhone);
                    this.history.pushState(`/contacts/edit`, clonedContact);
                }
            } else if (selected === 'delete') {
                const result = await this.device.confirmPopup.openPage('Delete History', 'Are you sure to delete?');
                if (result) this.phone.deleteHistory(data.number);
            } else if (selected === 'block') {
                this.phone.blockNumber(data.number);
            } else if (selected === 'unblock') {
                this.phone.unblockNumber(data.number);
            }
        }
    }

    private async makeACall(history?: History) {
        console.log('HISTORY:::MAKE_A_CALL', history);
        if (history) {
            const contact = history.contact;
            const phones = contact?.phones;
            let list: SelectItem[] = [];
            if (phones) {
                list = phones.map(phone => ({
                   title: phone.number,
                   value: phone.number,
                   icon: 'phone'
                }));
            } else {
                list = [
                    {
                        title: history.number,
                        value: history.number,
                        icon: 'phone'
                    }
                ]
            }
            const number = await this.device.selectList.openPage<string>('Phone', list);
            if (number && typeof number === 'string') {
                this.phoneService.makeACall(number);
            }
        }
    }

    private async textAMessage(history?: History) {
        if (history) {
            const typeMessage = (number: string) => {
                this.phoneService.textAMessage(number);
            };
            const contact = history.contact;
            if (contact) {
                const phones = contact.phones;
                if (phones.length == 1) {
                    typeMessage(phones[0].number);
                } else {
                    let list: SelectItem[] = [];
                    if (phones) {
                        list = phones.map(phone => ({
                           title: phone.number,
                           value: phone.number,
                           icon: 'mode_comment'
                        }));
                    } else {
                        list = [
                            {
                                title: history.number,
                                value: history.number,
                                icon: 'mode_comment'
                            }
                        ]
                    }
                    const result = await this.device.selectList.openPage<string>('Message', list);
                    if (result && typeof result === 'string') typeMessage(result);
                }
            } else {
                typeMessage(history.number);
            }
        }
    }

    private async contactSelect() {
        const list: SelectItem[] = [];
        for(const contact of this.sortByName(this.phone.contacts)) {
            list.push({ title: `${contact.firstName} ${contact.lastName}`, value: contact.id });
        }
        const selected = await this.device.selectList.openPage<string>('Contacts', list);
        if (selected && typeof selected === 'string') {
            return this.phone.contacts.find(item => item.id === selected);
        }
        return null;
    }

    private sortByName(contacts: Contact[]): Contact[] {
        return contacts.sort((a, b) => {
            if (a.firstName === b.firstName) {
                return a.lastName.localeCompare(b.lastName);
            }
            return a.firstName.localeCompare(b.firstName);
        });
    }
}