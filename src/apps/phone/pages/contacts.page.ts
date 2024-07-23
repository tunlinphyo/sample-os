import { Page } from "../../../components/page";
import { PhoneController } from "../../../controllers/phone.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { ContactWithBlock } from "../../../stores/contact.store";


export class ContactsPage extends Page {
    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private phone: PhoneController,
    ) {
        super(history, { btnEnd: 'add' });
        this.init();
    }

    private init() {
        this.addEventListener('click', () => {
            this.history.pushState('/contacts/new', null);
        }, this.btnEnd, false);

        const phoneListener = (status: string) => {
            switch (status) {
                case 'CONTACT_UPDATED':
                case 'BLOCKED_CONTACT':
                case 'UNBLOCKED_CONTACT':
                case 'CONTACT_DELETED':
                    this.update('update', this.phone.getContactsWithBlock());
                    break;
            }
        };

        this.phone.addChangeListener(phoneListener);

        this.device.addEventListener('closeApp', () => {
            this.phone.removeChangeListener(phoneListener);
        });
    }

    render(data: ContactWithBlock[]) {
        if (!data.length) return this.renderNoData('Add a Contact');

        const list = this.sortByName(data);
        const scrollArea = this.createScrollArea();
        const noteList = this.createElement('ul', ['titleList', 'contactList']);
        list.forEach(item => {
            const contactName = this.createElement('li', ['titleItem', 'textLarge'], {
                'data-name': `${item.firstName[0]}${item.lastName[0]}`
            });
            if (item.isBlocked) contactName.classList.add('blocked');
            contactName.innerHTML = `
                <span class="thumbnail">${item.firstName[0]}${item.lastName[0]}</span>
                <span>${item.firstName} ${item.lastName}</span>
            `;
            this.addEventListener('click', () => {
                this.history.pushState(`/contacts/detail`, this.phone.getContact(item.id));
            }, contactName);
            noteList.appendChild(contactName);
        });
        scrollArea.appendChild(noteList);
        this.mainArea.appendChild(scrollArea);
    }

    update(_: string, data: ContactWithBlock[]) {
        this.mainArea.innerHTML = '';
        this.removeAllEventListeners();
        this.render(data);
    }

    private sortByName(contacts: ContactWithBlock[]): ContactWithBlock[] {
        return contacts.sort((a, b) => {
            if (a.firstName === b.firstName) {
                return a.lastName.localeCompare(b.lastName);
            }
            return a.firstName.localeCompare(b.firstName);
        });
    }
}