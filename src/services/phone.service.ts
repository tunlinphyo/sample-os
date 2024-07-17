import { PhoneController } from "../controllers/phone.controller";
import { DeviceController } from "../device/device";
import { Contact } from "../stores/contact.store";
import { History } from "../stores/history.store";


export class PhoneService {
    constructor(
        private device: DeviceController,
        private phone: PhoneController
    ) {}

    async makeACall(number: string) {
        if (this.phone.isBlock(number)) return;
        let contact = this.phone.contactsStore.findContactByNumber(number);
        const result = await this.device.outgoingCall.openPage({ contact, number });
        if (result && typeof result === 'object') {
            this.device.callScreen.openPage('Phone', { contact: result.contact, number: result.number, status: 'outgoing_call' });
        } else {
            let history = this.generateMissCall(number, false, (contact || undefined));
            this.phone.addHistory(history);
        }
    }

    private generateMissCall(number: string, to: boolean, contact?: Contact) {
        const history: Omit<History, 'id'> = {
            type: to ? 'to_miss_call' : 'from_miss_call',
            date: new Date(),
            contact,
            number,
            data: '',
        }

        return history;
    }
}