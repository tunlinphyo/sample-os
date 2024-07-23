import { PhoneLabelHandler } from "../../../components/form/form-elem";
import { Page } from "../../../components/page";
import { SelectItem } from "../../../components/select";
import { PhoneController } from "../../../controllers/phone.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { PhoneService } from "../../../services/phone.service";
import { Contact, ContactWithBlock } from "../../../stores/contact.store";
import { phoneNumbers } from "../../../stores/history.store";
import { OSObject } from "../../../utils/object";


export class DialpadPage extends Page {
    public dialNumber: string = '';
    private _contact: ContactWithBlock | null | undefined;
    private phoneService: PhoneService;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private phone: PhoneController
    ) {
        super(history, { btnStart: 'phone', btnEnd: 'chat_bubble' });

        this.phoneService = new PhoneService(this.device, this.phone);

        this.init();
    }

    private init() {
        this.addEventListener('click', () => {
            this.phoneService.makeACall(this.dialNumber);
        }, this.btnStart, false);

        this.addEventListener('click', () => {
            this.phoneService.textAMessage(this.dialNumber);
        }, this.btnEnd, false);

        const phoneListener = (status: string) => {
            switch (status) {
                case 'CONTACT_UPDATED':
                case 'BLOCKED_CONTACT':
                case 'UNBLOCKED_CONTACT':
                case 'CONTACT_DELETED':
                    this.checkNumber(this.dialNumber);
                    break;
            }
        };

        this.phone.addChangeListener(phoneListener);

        this.device.addEventListener('closeApp', () => {
            this.history.updateState(`/dialpad`, this.dialNumber || '');
            this.phone.removeChangeListener(phoneListener);
        });
    }

    get contact() {
        return this._contact;
    }

    set contact(data: ContactWithBlock | null | undefined) {
        this._contact = data;
        this.updateContactButton(!!data);
    }

    render(number?: string) {
        if (number) this.dialNumber = number;
        const keypadArea = this.cloneTemplate('keypadTemplate');

        const keys = this.getAllElement<HTMLButtonElement>('.key', keypadArea);
        const phoneNumberInput = this.getElement<HTMLInputElement>('#phoneNumber', keypadArea);
        const clearButton = this.getElement<HTMLButtonElement>('#clear', keypadArea);

        phoneNumberInput.value = this.dialNumber;

        keys.forEach(key => {
            this.addEventListener('click', () => {
                const keyValue = key.dataset.key;
                if (keyValue) {
                    if (phoneNumberInput.value.length > 1) {
                        phoneNumberInput.value = keyValue;
                    } else {
                        phoneNumberInput.value += keyValue;
                        const index = phoneNumberInput.value;

                        if (phoneNumbers[index]) {
                            phoneNumberInput.value = phoneNumbers[index];
                        }
                    }
                }

                this.dialNumber = phoneNumberInput.value;
                this.checkNumber(this.dialNumber);
            }, key);
        });

        this.addEventListener('click', () => {
            phoneNumberInput.value = '';
            this.dialNumber = phoneNumberInput.value;
            this.checkNumber(this.dialNumber);
        }, clearButton);


        this.addEventListener('click', () => {
            if (this.dialNumber.length <= 2) return;
            if (this.contact) {
                this.history.pushState(`/contacts/detail`, this.phone.getContact(this.contact.id));
            } else {
                this.createOrAddNumber(this.dialNumber);
            }
        }, this.getElement('.addEdit', keypadArea));

        this.mainArea.appendChild(keypadArea);
        this.checkNumber(this.dialNumber);
    }

    update(_: string, number?: string) {
        this.removeAllEventListeners();
        this.mainArea.innerHTML = '';
        this.render(number);
    }

    private updateContactButton(isContact: boolean = false) {
        // if (!this.isActive) return;
        try {
            const iconEl = this.getElement('.addEdit .icon');
            if (isContact) iconEl.textContent = 'person';
            else iconEl.textContent = 'add_circle';
        } catch(error) {}
    }

    private async createOrAddNumber(number?: string) {
        if (!number) return;
        const isBlock = this.phone.isBlock(number);
        let list: SelectItem[] = [
            { title: 'Create', value: 'create', icon: 'add' },
            { title: 'Add to', value: 'add', icon: 'person_add' }
        ];
        if (isBlock) {
            list = [
                { title: 'Unblock', value: 'unblock', icon: 'block' }
            ];
        } else {
            list = [
                { title: 'Create', value: 'create', icon: 'add' },
                { title: 'Add to', value: 'add', icon: 'person_add' }
            ];
        }
        const selected = await this.device.selectList.openPage('Contact', list);
        if (selected == 'create') {
            this.history.pushState(`/contacts/new`, number);
        } else if (selected == 'add') {
            const contact = await this.contactSelect();
            if (contact) {
                const newPhone = PhoneLabelHandler.addPhone(contact.phones, number);
                const clonedContact = OSObject.deepClone(contact);
                clonedContact.phones.push(newPhone);
                this.history.pushState(`/contacts/edit`, clonedContact);
            }
        } else if (selected === 'unblock') {
            this.phone.unblockNumber(number);
        }
    }

    private async contactSelect() {
        const list: SelectItem[] = [];
        for(const contact of this.sortByName(this.phone.contacts)) {
            list.push({ title: `${contact.firstName} ${contact.lastName}`, value: contact.id });
        }
        const selected = await this.device.selectList.openPage('Contacts', list, 'contacts');
        if (selected) {
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

    private checkNumber(number?: string) {
        if (!number || number.length < 2) {
            return this.contact = null;
        }
        const contact = this.phone.contactsStore.findContactByNumber(number);
        if (contact) {
            const isBlocked = this.phone.isBlock(number);
            this.contact = { ...contact, isBlocked };
        } else {
            this.contact = null;
        }
    }
}