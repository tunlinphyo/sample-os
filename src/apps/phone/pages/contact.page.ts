import { Page } from "../../../components/page";
import { SelectItem } from "../../../components/select";
import { PhoneController } from "../../../controllers/phone.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { PhoneService } from "../../../services/phone.service";
import { ContactWithBlock } from "../../../stores/contact.store";



export class ContactPage extends Page {
    private contact: ContactWithBlock | undefined;
    private phoneService: PhoneService;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private phone: PhoneController,
    ) {
        super(history, { btnStart: 'delete', btnEnd: 'edit' });
        this.phoneService = new PhoneService(this.device, this.phone);
        this.component.classList.add("contactPage");
        this.init();
    }

    private init() {
        this.addEventListener('click', async () => {
            const isDel = await this.device.confirmPopup.openPage(
                'Delete Contact',
                `Are you sure to delete <br/> ${this.contact?.firstName} ${this.contact?.lastName}?`
            );
            if (isDel) {
                if (!this.contact) return;
                this.phone.deleteContact(this.contact);
            }
        }, this.btnStart, false);

        this.addEventListener('click', () => {
            this.history.pushState(`/contacts/edit`, this.contact);
        }, this.btnEnd, false);


        const phoneListener = (status: string, contact: ContactWithBlock) => {
            switch (status) {
                case 'CONTACT_UPDATED':
                case 'BLOCKED_CONTACT':
                case 'UNBLOCKED_CONTACT':
                    this.update('update', contact);
                    this.history.updateState('/contacts/detail', contact);
                    break;
                case 'CONTACT_DELETED':
                    this.closePage();
                    break;
            }
        };

        this.phone.addChangeListener(phoneListener);

        this.device.addEventListener('closeApp', () => {
            this.phone.removeChangeListener(phoneListener);
        });
    }

    render(contact: ContactWithBlock) {
        this.contact = contact;

        const scrollArea = this.createScrollArea();
        const contactCard = this.createElement('div', ['contactCard']);

        const profile = this.createElement('div', ['profile']);
        const avatar = this.createElement('div', ['avatar']);
        avatar.textContent = `${contact.firstName[0]}${contact.lastName[0]}`;
        profile.appendChild(avatar);

        const nameEl = this.createElement('h2', ['title']);
        if (contact.isBlocked) nameEl.classList.add('blocked');
        nameEl.innerHTML = `${contact.firstName} ${contact.lastName}`;

        const selectList = this.createElement('div', ['selectList']);

        contact.phones.forEach(phone => {
            const phoneEl = this.createElement('button', ['selectItem', 'withIcon']);
            phoneEl.innerHTML = `<span class="material-symbols-outlined">call</span>${phone.number}`;
            if (contact.isBlocked) phoneEl.classList.add('blockedNumber');
            this.addEventListener('click', () => {
                this.callOrMessage(phone.number);
            }, phoneEl);
            selectList.appendChild(phoneEl);
        });

        if (contact.email) {
            const emailEl = this.createElement('button', ['selectItem', 'withIcon']);
            emailEl.innerHTML = `<span class="material-symbols-outlined">mail</span> ${contact.email}`;
            this.addEventListener('click', () => {
                this.dispatchCustomEvent('email', contact);
            }, emailEl);
            selectList.appendChild(emailEl);
        }


        const blockEl = this.createElement('button', ['selectItem', 'withIcon']);
        blockEl.innerHTML = `
            <span class="material-symbols-outlined">block</span>
            ${this.contact?.isBlocked ? 'Unblock' : 'Block'} Contact
        `;
        this.addEventListener('click', () => {
            if (!this.contact) return;
            if (this.contact.isBlocked) {
                this.phone.unblockNumber(this.contact);
            } else {
                this.phone.blockNumber(this.contact);
            }
        }, blockEl);
        selectList.appendChild(blockEl);

        contactCard.appendChild(profile);
        contactCard.appendChild(nameEl);
        scrollArea.appendChild(contactCard);
        scrollArea.appendChild(selectList);
        this.mainArea.appendChild(scrollArea);
    }

    update(operation: string, data: ContactWithBlock) {
        if (!this.isActive) return;
        this.mainArea.innerHTML = '';
        this.removeAllEventListeners();
        if (operation === 'delete') {
            this.closePage();
        } else {
            this.render(data);
        }
    }

    // private async moreOptions() {
    //     const list: SelectItem[] = [
    //         {
    //             title: this.contact?.isBlocked ? 'Unblock' : 'Block',
    //             value: this.contact?.isBlocked ? 'unblock' : 'block',
    //             icon: 'block'
    //         },
    //         { title: 'Delete', value: 'delete', icon: 'delete' }
    //     ];
    //     const selected = await this.device.selectList.openPage(`${this.contact?.firstName} ${this.contact?.lastName}`, list);
    //     if (selected === 'block') {
    //         if (!this.contact) return;
    //         this.phone.blockNumber(this.contact);
    //     } else if (selected === 'unblock') {
    //         if (!this.contact) return;
    //         this.phone.unblockNumber(this.contact);
    //     } else if (selected === 'delete') {
    //         const isDel = await this.device.confirmPopup.openPage(
    //             'Delete Contact',
    //             `Are you sure to delete <br/> ${this.contact?.firstName} ${this.contact?.lastName}?`
    //         );
    //         if (isDel) {
    //             if (!this.contact) return;
    //             this.phone.deleteContact(this.contact);
    //         }
    //     }
    // }

    private async callOrMessage(number: string) {
        const list: SelectItem[] = [
            { title: 'Call', value: 'call', icon: 'phone' },
            { title: 'Message', value: 'message', icon: 'mode_comment' }
        ];
        const selected = await this.device.selectList.openPage(number, list);
        if (selected === 'call') {
            this.phoneService.makeACall(number);
        } else if (selected === 'message') {
            this.phoneService.textAMessage(number);
        }
    }
}