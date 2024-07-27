import { FormComponent } from "../../../components/form";
import { CustomInputForm, CustomPhoneForm } from "../../../components/form/form-elem";
import { emailAddresses, englishNames } from "../../../components/keyboard/consts";
import { Modal } from "../../../components/modal";
import { PhoneController } from "../../../controllers/phone.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Contact } from "../../../stores/contact.store";

class ContactForm extends FormComponent {
    private contact: Contact | undefined;
    private firstName: CustomInputForm | undefined;
    private lastName: CustomInputForm | undefined;
    private email: CustomInputForm | undefined;
    private phone: CustomPhoneForm | undefined;

    constructor(device: DeviceController, parent: HTMLElement) {
        super(device, 'contactForm', parent);
        this.init();
    }

    private init() { }

    render(contact?: Contact | string) {
        this.cleanup();

        if (!contact || typeof contact === 'string') {
            this.contact = {
                id: '',
                firstName: '',
                lastName: '',
                phones: typeof contact === 'string' ? [{ type: 'Mobile', number: contact }] : [],
                email: ''
            };
        } else {
            this.contact = contact;
        }

        const nameGroup = this.createGroup();

        this.firstName = this.input({
            label: 'First Name',
            type: 'text',
            defaultValue: this.contact.firstName,
            keys: englishNames
        }, nameGroup);
        this.lastName = this.input({
            label: 'Last Name',
            type: 'text',
            defaultValue: this.contact.lastName,
            keys: englishNames
        }, nameGroup);

        this.appendElement(nameGroup);
        this.phone = this.phones(this.contact.phones);
        this.email = this.input({
            label: 'Email',
            type: 'text',
            defaultValue: this.contact.email || '',
            keys: emailAddresses
        });
    }

    getData() {
        const contact = this.getCurrentData();

        if (!(contact.firstName && contact.lastName && contact.phones.length)) return;
        return contact;
    }

    getCurrentData() {
        const contact: Contact = {
            id: this.contact?.id || '',
            firstName: this.firstName?.value || '',
            lastName: this.lastName?.value || '',
            phones: this.phone?.value || [],
            email: this.email?.value || ''
        };

        return contact;
    }
}

export class ContactEditPage extends Modal {
    private form: ContactForm | undefined;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private phone: PhoneController
    ) {
        super(history, { btnEnd: 'check' });
        this.component.classList.add('contactEditPage');
        this.init();
    }

    private init() {
        this.addEventListener('click', () => {
            const data = this.form?.getData();
            if (data) {
                data.phones = data.phones.filter(item => !!item.number);
                this.phone.updateContact(data);
            }
        }, this.btnEnd, false);

        const phoneListener = (status: string) => {
            switch (status) {
                case 'CONTACT_UPDATED':
                case 'CONTACT_DELETED':
                    this.closePage();
                    break;
            }
        };

        this.phone.addChangeListener(phoneListener);

        this.device.addEventListener('closeApp', () => {
            const data = this.form?.getCurrentData();
            if (data) {
                if (data.id) this.history.updateState(`/contacts/edit`, data);
                else this.history.updateState(`/contacts/new`, data);
            }
            this.phone.removeChangeListener(phoneListener);
        });

    }

    render(data: Contact) {
        this.form = new ContactForm(this.device, this.mainArea);
        this.form.render(data);
    }

    update() {}
}