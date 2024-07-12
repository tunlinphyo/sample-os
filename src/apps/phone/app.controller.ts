import { PhoneController } from "../../controllers/phone.controller";
import { DeviceController } from "../../device/device";
import { HistoryState, HistoryStateManager } from "../../device/history.manager";
import { ContactPage } from "./pages/contact.page";
import { ContactsPage } from "./pages/contacts.page";
import { ContactEditPage } from "./pages/contsct.edit.page";
import { DialpadPage } from "./pages/dailpad.page";
import { HistoryPage } from "./pages/history.page";


export class PhoneAppController {
    constructor(
        private history: HistoryStateManager,
        private device: DeviceController,
        private phone: PhoneController,
        private dialpadPage: DialpadPage,
        private historyPage: HistoryPage,
        private contactsPage: ContactsPage,
        private contactPage: ContactPage,
        private editPage: ContactEditPage
    ) {
        this.renderListeners();
    }

    private renderListeners() {
        const handleChange = (state: any, url: string) => {
            this.history.handleChange(url, [
                {
                    pattern: '/contacts',
                    callback: () => {
                        const contacts = this.phone.getContactsWithBlock()
                        this.contactsPage.openPage('Contacts', contacts);
                    }
                }, {
                    pattern: '/dialpad',
                    callback: () => {
                        this.dialpadPage.openPage('Dialpad', state);
                    }
                },  {
                    pattern: '/history',
                    callback: () => {
                        const list = this.phone.getHistoryByNumber(state);
                        this.historyPage.openPage('', list);
                    }
                }, {
                    pattern: '/contacts/detail',
                    callback: () => {
                        this.contactPage.openPage('Contact', state);
                    }
                }, {
                    pattern: '/contacts/new',
                    callback: () => {
                        this.editPage.openPage('New Contact', state);
                    }
                }, {
                    pattern: '/contacts/edit',
                    callback: () => {
                        this.editPage.openPage('Edit Contact', state);
                    }
                }
            ]);
        }

        this.history.onStateChange(handleChange);

        this.device.addEventListener('openAppFinished', () => {
            const history = parent.device.getHistory('phone');
            if (!history) return;
            // console.log('OPEN_PAGE', history);
            this.history.init(history);
            history.forEach((item: HistoryState) => {
                handleChange(item.state, item.url);
            })
        })

        this.device.addEventListener('closeApp', () => {
            // console.log('CLOSE_PAGE', JSON.stringify(this.history.history));
            this.device.setHistory('phone', this.history.history);
        });
    }
}