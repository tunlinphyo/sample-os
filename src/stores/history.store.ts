import { DB } from "./db";
import { BaseManager, ChangeListener } from "./data";
import { Contact } from "./contact.store";
import { OSArray } from "../utils/arrays";

export const randomMessages: { [key: string]: string } = {
    a: "Hello, how are you today? I hope everything is going well for you.",
    b: "It's a beautiful day outside! Let's take a walk and enjoy the weather.",
    c: "Did you finish the report? We need to submit it by the end of the day.",
    d: "Happy birthday! Wishing you a fantastic day filled with joy and happiness.",
    e: "Let's grab lunch together tomorrow. I know a great place nearby.",
    f: "Good luck on your exam! I know you'll do great with all the studying you've done.",
    g: "I'll call you later this evening to discuss the details of the project.",
    h: "Can you send me the file? I need it for the presentation tomorrow morning.",
    i: "Nice to meet you! I'm looking forward to working together on this project.",
    j: "Congratulations on your promotion! You deserve it for all your hard work.",
    k: "What time is the meeting? I want to make sure I am prepared and on time.",
    l: "Do you have any plans for the weekend? Maybe we can catch up over coffee.",
    m: "Thank you for your help with the project. I couldn't have done it without you.",
    n: "See you tomorrow at the office. We have a lot to catch up on.",
    o: "I'm running late due to traffic. I should be there in about 20 minutes.",
    p: "How was your vacation? I'd love to hear all about your adventures.",
    q: "Let's schedule a meeting for next week to go over the project details.",
    r: "Happy holidays! I hope you enjoy this special time with your loved ones.",
    s: "I hope you're doing well. It's been a while since we last spoke.",
    t: "Please review the document and let me know if there are any changes needed.",
    u: "I really appreciate your support during the recent project.",
    v: "Can we reschedule our meeting to later this week?",
    w: "The event was fantastic, thank you for inviting me.",
    x: "I've forwarded you the email with the necessary details.",
    y: "Don't forget about our deadline on Friday.",
    z: "Let's catch up soon, it's been too long since we last spoke."
};

export const phoneNumbers: { [key: string]: string } = {
    '00': "012-3456-0000",
    '01': "013-4567-8901",
    '02': "014-5678-9002",
    '03': "015-6789-0103",
    '04': "016-7890-1204",
    '05': "017-8901-2305",
    '06': "018-9012-3406",
    '07': "019-0123-4507",
    '08': "020-1234-5608",
    '09': "021-2345-6709",
    '10': "022-3456-7810",
    '11': "023-4567-8911",
    '12': "024-5678-9012",
    '13': "025-6789-0113",
    '14': "026-7890-1214",
    '15': "027-8901-2315",
    '16': "028-9012-3416",
    '17': "029-0123-4517",
    '18': "030-1234-5618",
    '19': "031-2345-6719",
    '20': "032-3456-7820",
    '21': "033-4567-8921",
    '22': "034-5678-9022",
    '23': "035-6789-0123",
    '24': "036-7890-1224",
    '25': "037-8901-2325",
    '26': "038-9012-3426",
    '27': "039-0123-4527",
    '28': "040-1234-5628",
    '29': "041-2345-6729",
    '30': "042-3456-7830",
    '31': "043-4567-8931",
    '32': "044-5678-9032",
    '33': "045-6789-0133",
    '34': "046-7890-1234",
    '35': "047-8901-2335",
    '36': "048-9012-3436",
    '37': "049-0123-4537",
    '38': "050-1234-5638",
    '39': "051-2345-6739",
    '40': "052-3456-7840",
    '41': "053-4567-8941",
    '42': "054-5678-9042",
    '43': "055-6789-0143",
    '44': "056-7890-1244",
    '45': "057-8901-2345",
    '46': "058-9012-3446",
    '47': "059-0123-4547",
    '48': "060-1234-5648",
    '49': "061-2345-6749",
    '50': "062-3456-7850",
    '51': "063-4567-8951",
    '52': "064-5678-9052",
    '53': "065-6789-0153",
    '54': "066-7890-1254",
    '55': "067-8901-2355",
    '56': "068-9012-3456",
    '57': "069-0123-4557",
    '58': "070-1234-5658",
    '59': "071-2345-6759",
    '60': "072-3456-7860",
    '61': "073-4567-8961",
    '62': "074-5678-9062",
    '63': "075-6789-0163",
    '64': "076-7890-1264",
    '65': "077-8901-2365",
    '66': "078-9012-3466",
    '67': "079-0123-4567",
    '68': "080-1234-5668",
    '69': "081-2345-6769",
    '70': "082-3456-7870",
    '71': "083-4567-8971",
    '72': "084-5678-9072",
    '73': "085-6789-0173",
    '74': "086-7890-1274",
    '75': "087-8901-2375",
    '76': "088-9012-3476",
    '77': "089-0123-4577",
    '78': "090-1234-5678",
    '79': "091-2345-6779",
    '80': "092-3456-7880",
    '81': "093-4567-8981",
    '82': "094-5678-9082",
    '83': "095-6789-0183",
    '84': "096-7890-1284",
    '85': "097-8901-2385",
    '86': "098-9012-3486",
    '87': "099-0123-4587",
    '88': "100-1234-5688",
    '89': "101-2345-6789",
    '90': "102-3456-7890",
    '91': "103-4567-8991",
    '92': "104-5678-9092",
    '93': "105-6789-0193",
    '94': "106-7890-1294",
    '95': "107-8901-2395",
    '96': "108-9012-3496",
    '97': "109-0123-4597",
    '98': "110-1234-5698",
    '99': "075-7885-2899"
};

const aToZ = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

export type HistoryType = 'outgoing_call' | 'incoming_call' | 'from_miss_call' | 'to_miss_call' | 'from_message' | 'to_message';

export interface History {
    id: string,
    type: HistoryType;
    date: Date
    contact?: Contact;
    number: string;
    data: number | string;
}

export interface GroupedHistory {
    date: string;
    histories: History[];
}

export class HistoryStore extends BaseManager<History> {
    private db: DB<History>;

    constructor() {
        super([])
        this.db = new DB<History>('histories')
        this.init()
    }

    async init() {
        const items = await this.db.getAll()
        this.setItems(items)
        this.notifyListeners(null, 'loaded');
    }

    getHistoryByHistory(history: History) {
        const chatHistory: History[] = []

        this.items.forEach(item => {
            if (item.contact && item.contact.id == history.contact?.id || item.number === history.number) {
                chatHistory.push(item)
            }
        });

        return chatHistory.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA.getTime() - dateB.getTime();
        });
    }

    getHistoryByNumbers(numbers: string[]) {
        const chatHistory: History[] = []

        this.items.forEach(item => {
            if (numbers.includes(item.number)) {
                chatHistory.push(item)
            }
        });

        return chatHistory.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA.getTime() - dateB.getTime();
        });
    }

    getId(item: History): string {
        return item.id;
    }

    setId(item: History, id: string): History {
        return { ...item, id };
    }

    async add(item: Omit<History, 'id'>) {
        const id = await this.db.post(item)
        this.addItem(id, item)
        return id
    }

    async update(id: string, item: Partial<Omit<History, "id">>): Promise<string> {
        await this.db.put(id, item)
        this.editItem(id, item)
        return id
    }

    async del(id: string): Promise<string> {
        await this.db.del(id)
        this.deleteItem(id)
        return id
    }

    async delMany(number: string, contact?: Contact) {
        const ids = this.items.filter(item => (
            (contact && contact.id === item.contact?.id)
            || number === item.number
        )).map(item => item.id)
        await this.db.delMany(ids)
        this.deleteMany(ids)
    }

    public resetStore() {
        return this.db.clear();
    }

    listen(callback: ChangeListener<History>): void {
        this.addChangeListener((items, changedItem, operation) => {
            callback(items, changedItem, operation)
        })
    }

    generateHistory(contact: Contact) {
        const historyTypes = ['incoming_call', 'from_miss_call', 'from_message']
        const type = OSArray.getRandomElement(historyTypes) as HistoryType
        const history: Omit<History, 'id'> = {
            type,
            date: new Date(),
            contact,
            number: contact.phones[0].number,
            data: type === 'from_message' ? randomMessages[OSArray.getRandomElement(aToZ)] : '00:00:32'
        }

        return history
    }

    generateHistoryByNumber(number: string) {
        const historyTypes = ['incoming_call', 'from_miss_call', 'from_message']
        const type = OSArray.getRandomElement(historyTypes) as HistoryType
        const history: Omit<History, 'id'> = {
            type,
            date: new Date(),
            contact: undefined,
            number,
            data: type === 'from_message' ? randomMessages[OSArray.getRandomElement(aToZ)] : '00:00:32'
        }

        return history
    }

    getRandomNumber() {
        return OSArray.getRandomElement(Object.values(phoneNumbers));
    }

    generateMissCall(number: string, contact?: Contact) {
        const history: Omit<History, 'id'> = {
            type: 'from_miss_call',
            date: new Date(),
            contact,
            number,
            data: '',
        }

        return history;
    }
}
