import { DeviceController } from "../device/device";
import { PhoneService } from "../services/phone.service";
import { Contact } from "../stores/contact.store";
import { History, randomMessages } from "../stores/history.store";
import { OSArray } from "../utils/arrays";
import { AudioController } from "./audio.controller";
import { PhoneController } from "./phone.controller";
import { SettingsController } from "./settings.controller";

export class PhoneDummyController {
    constructor(
        private device: DeviceController,
        private phone: PhoneController,
        private setting: SettingsController,
        private audio: AudioController
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
            const ringTone = this.setting.volumes.ringTone;
            this.audio.playRingtone(ringTone);
            const result = await this.device.incomingCall.open('Phone', { contact, number });
            this.audio.stopRingtone();
            if (result && typeof result === 'object') {
                const data: Omit<History, 'id'> = {
                    type: 'incoming_call',
                    date: new Date(),
                    contact: result.contact ?? undefined,
                    number: result.number,
                    data: 0,
                    isViewed: true,
                }
                this.phone.inCall(number);
                setTimeout(() => {
                    this.audio.pauseMusic();
                }, 0);
                const history = await this.device.callScreen.open('Phone', data);
                this.phone.inCall();
                this.audio.resumeMusic();
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
            const ringTone = this.setting.volumes.ringTone;
            this.audio.playRingtone(ringTone);
            const result = await this.device.incomingCall.open('Phone', { contact, number });
            this.audio.stopRingtone();
            if (result && typeof result === 'object') {
                const data: Omit<History, 'id'> = {
                    type: 'incoming_call',
                    date: new Date(),
                    contact: result.contact ?? undefined,
                    number: result.number,
                    data: 0,
                    isViewed: true,
                }
                this.phone.inCall(number);
                setTimeout(() => {
                    this.audio.pauseMusic();
                }, 0);
                const history = await this.device.callScreen.open('Phone', data);
                this.phone.inCall();
                this.audio.resumeMusic();
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
            const textTone = this.setting.volumes.textTone;
            this.audio.playText(textTone);
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
            const textTone = this.setting.volumes.textTone;
            this.audio.playText(textTone);
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