import { DeviceController } from "../device/device";
import { History, randomMessages } from "../stores/history.store";
import { OSArray } from "../utils/arrays";
import { PhoneController } from "./phone.controller";

export class PhoneDummyController {
    constructor(
        private device: DeviceController,
        private phone: PhoneController,
    ) {
        this.setupListeners();
    }

    private setupListeners() {
        document.getElementById('rendomCall')?.addEventListener('click', async () => {
            const number = this.phone.historyStore.getRandomNumber();
            if (this.phone.isBlock(number)) return;
            let contact = this.phone.contactsStore.findContactByNumber(number);
            const result = await this.device.incomingCall.openPage('Incoming Call', { contact, number });
            if (result && typeof result === 'object') {
                this.device.callScreen.openPage('Phone', { contact: result.contact, number: result.number, status: 'incoming_call' });
            } else {
                let history: Omit<History, 'id'>;
                if (contact) {
                    history = this.phone.historyStore.generateMissCall(number, contact);
                } else {
                    history = this.phone.historyStore.generateMissCall(number);
                }
                this.phone.addHistory(history);
            }
        });

        document.getElementById('contactCall')?.addEventListener('click', async () => {
            let contact = this.phone.contactsStore.getRandomContact();
            const number = OSArray.getRandomElement(contact.phones.map(i => i.number));
            if (this.phone.isBlock(number)) return;
            const result = await this.device.incomingCall.openPage('Incoming Call', { contact, number });
            if (result && typeof result === 'object') {
                this.device.callScreen.openPage('Phone', { contact: result.contact, number: result.number, status: 'incoming_call' });
            } else {
                let history: Omit<History, 'id'>;
                if (contact) {
                    history = this.phone.historyStore.generateMissCall(number, contact);
                } else {
                    history = this.phone.historyStore.generateMissCall(number);
                }
                this.phone.addHistory(history);
            }
        });

        document.getElementById('rendomMessage')?.addEventListener('click', async () => {
            const number = this.phone.historyStore.getRandomNumber();
            let contact = this.phone.contactsStore.findContactByNumber(number);
            if (this.phone.isBlock(number)) return;
            const newHistory: Omit<History, 'id'> = {
                type: 'from_message',
                date: new Date(),
                contact: contact || undefined,
                number,
                data: OSArray.getRandomElement(Object.values(randomMessages))
            };
            this.phone.addHistory(newHistory);
        });


        document.getElementById('contactMessage')?.addEventListener('click', async () => {
            let contact = this.phone.contactsStore.getRandomContact();
            const number = OSArray.getRandomElement(contact.phones.map(i => i.number));
            if (this.phone.isBlock(number)) return;
            const newHistory: Omit<History, 'id'> = {
                type: 'from_message',
                date: new Date(),
                contact: contact,
                number,
                data: OSArray.getRandomElement(Object.values(randomMessages))
            };
            this.phone.addHistory(newHistory);
        });
    }
}