import { FormComponent } from "../../../components/form";
import { CustomInputForm, CustomPhoneForm } from "../../../components/form/form-elem";
import { Modal } from "../../../components/modal";
import { PhoneController } from "../../../controllers/phone.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Contact } from "../../../stores/contact.store";


const englishNames: { [key: string]: string } = {
    a: "Andrew",
    b: "Brenda",
    c: "Christopher",
    d: "Diana",
    e: "Edward",
    f: "Fiona",
    g: "George",
    h: "Hannah",
    i: "Ian",
    j: "Julia",
    k: "Kevin",
    l: "Laura",
    m: "Matthew",
    n: "Natalie",
    o: "Oliver",
    p: "Pamela",
    q: "Quentin",
    r: "Rachel",
    s: "Steven",
    t: "Theresa",
    u: "Ursula",
    v: "Victor",
    w: "Wendy",
    x: "Xavier",
    y: "Yvonne",
    z: "Zachary",
    A: "Alice",
    B: "Brian",
    C: "Catherine",
    D: "Daniel",
    E: "Emily",
    F: "Frank",
    G: "Grace",
    H: "Harry",
    I: "Isabella",
    J: "James",
    K: "Katherine",
    L: "Liam",
    M: "Megan",
    N: "Noah",
    O: "Olivia",
    P: "Patrick",
    Q: "Quinn",
    R: "Robert",
    S: "Sophia",
    T: "Thomas",
    U: "Una",
    V: "Victoria",
    W: "William",
    X: "Xander",
    Y: "Yara",
    Z: "Zane"
};

const emailAddresses: { [key: string]: string } = {
    a: "andrew@example.com",
    b: "brenda@example.com",
    c: "christopher@example.com",
    d: "diana@example.com",
    e: "edward@example.com",
    f: "fiona@example.com",
    g: "george@example.com",
    h: "hannah@example.com",
    i: "ian@example.com",
    j: "julia@example.com",
    k: "kevin@example.com",
    l: "laura@example.com",
    m: "matthew@example.com",
    n: "natalie@example.com",
    o: "oliver@example.com",
    p: "pamela@example.com",
    q: "quentin@example.com",
    r: "rachel@example.com",
    s: "steven@example.com",
    t: "theresa@example.com",
    u: "ursula@example.com",
    v: "victor@example.com",
    w: "wendy@example.com",
    x: "xavier@example.com",
    y: "yvonne@example.com",
    z: "zachary@example.com",
    A: "alice@example.com",
    B: "brian@example.com",
    C: "catherine@example.com",
    D: "daniel@example.com",
    E: "emily@example.com",
    F: "frank@example.com",
    G: "grace@example.com",
    H: "harry@example.com",
    I: "isabella@example.com",
    J: "james@example.com",
    K: "katherine@example.com",
    L: "liam@example.com",
    M: "megan@example.com",
    N: "noah@example.com",
    O: "olivia@example.com",
    P: "patrick@example.com",
    Q: "quinn@example.com",
    R: "robert@example.com",
    S: "sophia@example.com",
    T: "thomas@example.com",
    U: "una@example.com",
    V: "victoria@example.com",
    W: "william@example.com",
    X: "xander@example.com",
    Y: "yara@example.com",
    Z: "zane@example.com"
};

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