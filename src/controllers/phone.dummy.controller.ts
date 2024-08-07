import { DeviceController } from "../device/device";
import { PhoneService } from "../services/phone.service";
import { Contact } from "../stores/contact.store";
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
            if (this.phone.isBlock(number)) {
                return this.addHistory(number);
            };
            let contact = this.phone.contactsStore.findContactByNumber(number);
            if (this.device.system.isPhone) {
                return this.addHistory(number, contact);
            }
            const result = await this.device.incomingCall.open('Phone', { contact, number });
            if (result && typeof result === 'object') {
                const data: Omit<History, 'id'> = {
                    type: 'incoming_call',
                    date: new Date(),
                    contact: result.contact ?? undefined,
                    number: result.number,
                    data: 0,
                    isViewed: true,
                }
                const history = await this.device.callScreen.open('Phone', data);
                if (history && typeof history !== 'boolean') this.phone.addHistory(history);
            } else {
                this.addHistory(number, contact);
            }
        });

        document.getElementById('contactCall')?.addEventListener('click', async () => {
            let contact = this.phone.contactsStore.getRandomContact();
            const number = OSArray.getRandomElement(contact.phones.map(i => i.number));
            if (this.phone.isBlock(number)) {
                return this.addHistory(number, contact);
            };
            if (this.device.system.isPhone) {
                return this.addHistory(number, contact);
            }
            const result = await this.device.incomingCall.open('Phone', { contact, number });
            if (result && typeof result === 'object') {
                const data: Omit<History, 'id'> = {
                    type: 'incoming_call',
                    date: new Date(),
                    contact: result.contact ?? undefined,
                    number: result.number,
                    data: 0,
                    isViewed: true,
                }
                const history = await this.device.callScreen.open('Phone', data);
                if (history && typeof history !== 'boolean') this.phone.addHistory(history);
            } else {
                this.addHistory(number, contact);
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
                data: OSArray.getRandomElement(Object.values(randomMessages)),
                isViewed: false,
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
                data: OSArray.getRandomElement(Object.values(randomMessages)),
                isViewed: false,
            };
            this.phone.addHistory(newHistory);
        });
    }

    private addHistory(number: string, contact?: Contact | null) {
        let history: Omit<History, 'id'>;
        if (contact) {
            history = PhoneService.generateMissCall(number, false, contact);
        } else {
            history = PhoneService.generateMissCall(number, false);
        }
        this.phone.addHistory(history);
    }
}