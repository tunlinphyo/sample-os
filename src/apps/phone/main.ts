import '../../style.css';
import './phone.css';

import { HistoryStateManager } from "../../device/history.manager";
import { PhoneApp } from "./pages/app.page";
import { ContactsPage } from './pages/contacts.page';
import { PhoneAppController } from './app.controller';
import { ContactPage } from './pages/contact.page';
import { ContactEditPage } from './pages/contsct.edit.page';
import { HistoryPage } from './pages/history.page';
import { DialpadPage } from './pages/dailpad.page';

document.body.dataset.schema = parent.device.theme;

document.addEventListener('DOMContentLoaded', () => {
    const historyManager = new HistoryStateManager();

    new PhoneApp(historyManager, parent.device, parent.phone);
    const dialpadPage = new DialpadPage(historyManager, parent.device, parent.phone, parent.osaudio);
    const historyPage = new HistoryPage(historyManager, parent.device, parent.phone, parent.osaudio);
    const contactsPage = new ContactsPage(historyManager, parent.device, parent.phone);
    const contactPage = new ContactPage(historyManager, parent.device, parent.phone, parent.osaudio);
    const editPage = new ContactEditPage(historyManager, parent.device, parent.phone);

    new PhoneAppController(
        historyManager,
        parent.device,
        parent.phone,
        dialpadPage,
        historyPage,
        contactsPage,
        contactPage,
        editPage
    );
});