import { Keyboard } from "../components/keyboard";
import { PhoneController } from "../controllers/phone.controller";
import { DeviceController } from "../device/device";
import { Contact } from "../stores/contact.store";
import { History, randomMessages } from "../stores/history.store";



export class PhoneService {
    constructor(
        private device: DeviceController,
        private phone: PhoneController
    ) {}

    async makeACall(number: string) {
        if (this.phone.isBlock(number)) return;
        let contact = this.phone.contactsStore.findContactByNumber(number);
        const isBlock = this.phone.isBlock(number);
        if (isBlock) {
            const name = contact ? `${contact.firstName} ${contact.lastName}` : number;
            const result = await this.device.confirmPopup.openPage(
                'Blocked',
                `${name} is blocked. Do you want to unblock?`
            );
            if (result) {
                this.phone.unblockNumber(contact || number);
            } else {
                return;
            }
        }
        const result = await this.device.outgoingCall.open('Calling', { contact, number });
        if (result && typeof result === 'object') {
            const history: Omit<History, 'id'> = {
                type: 'outgoing_call',
                date: new Date(),
                contact: contact ?? undefined,
                number: number,
                data: 0,
                isViewed: true,
            }
            const data = await this.device.callScreen.open('Phone', history);
            if (data && typeof data !== 'boolean') this.phone.addHistory(data);
        } else {
            let history = PhoneService.generateMissCall(number, true, (contact || undefined));
            this.phone.addHistory(history);
        }
    }

    async textAMessage(number: string) {
        if (!number || number.length < 6) return;
        const contact = this.phone.contactsStore.findContactByNumber(number);
        const isBlock = this.phone.isBlock(number);
        if (isBlock) {
            const name = contact ? `${contact.firstName} ${contact.lastName}` : number;
            const result = await this.device.confirmPopup.openPage(
                'Blocked',
                `${name} is blocked. Do you want to unblock?`
            );
            if (result) {
                this.phone.unblockNumber(contact || number);
            } else {
                return;
            }
        }
        const keyboardConfig: Keyboard = {
            label: contact ? `${contact.firstName} ${contact.lastName}` : number,
            defaultValue: '',
            type: 'textarea',
            keys: randomMessages,
            btnEnd: 'send',
        };
        this.device.keyboard.open(keyboardConfig).then(data => {
            if (data) {
                const newHistory: Omit<History, 'id'> = {
                    type: 'to_message',
                    date: new Date(),
                    contact: contact || undefined,
                    number: number,
                    data: data,
                    isViewed: true,
                };
                this.phone.addHistory(newHistory);
            }
        });
    }

    public static generateMissCall(number: string, to: boolean, contact?: Contact) {
        const history: Omit<History, 'id'> = {
            type: to ? 'to_miss_call' : 'from_miss_call',
            date: new Date(),
            contact,
            number,
            data: '',
            isViewed: to ? true : false,
        }

        return history;
    }
}