import { Popup } from "../popup";


export class EmojiKeyboard extends Popup {
    private notoSansSymbols2 = [
        '🌍', '✄', '✎', '🏔', '🏕', '🏌', '🏍', '🎭', '🎮',
        '&#x1F600;', '\u{1F601}', '\u{1F602}', '\u{1F603}', '\u{1F604}', '\u{1F605}', '\u{1F606}', '\u{1F607}', '\u{1F608}', '\u{1F609}',
        '\u{1F60A}', '\u{1F60B}', '\u{1F60C}', '\u{1F60D}', '\u{1F60E}', '\u{1F60F}', '\u{1F610}', '\u{1F611}', '\u{1F612}', '\u{1F613}',
        '\u{1F614}', '\u{1F615}', '\u{1F616}', '\u{1F617}', '\u{1F618}', '\u{1F619}', '\u{1F61A}', '\u{1F61B}', '\u{1F61C}', '\u{1F61D}',
        '\u{1F61E}', '\u{1F61F}', '\u{1F620}', '\u{1F621}', '\u{1F622}', '\u{1F623}', '\u{1F624}', '\u{1F625}', '\u{1F626}', '\u{1F627}',
        '\u{1F628}', '\u{1F629}', '\u{1F62A}', '\u{1F62B}', '\u{1F62C}', '\u{1F62D}', '\u{1F62E}', '\u{1F62F}', '\u{1F630}', '\u{1F631}',
        '\u{1F632}', '\u{1F633}', '\u{1F634}', '\u{1F635}', '\u{1F636}', '\u{1F637}', '\u{1F638}', '\u{1F639}', '\u{1F63A}', '\u{1F63B}',
        '\u{1F63C}', '\u{1F63D}', '\u{1F63E}', '\u{1F63F}', '\u{1F640}', '\u{1F641}', '\u{1F642}', '\u{1F643}', '\u{1F644}', '\u{1F645}',
        '\u{1F646}', '\u{1F647}', '\u{1F648}', '\u{1F649}', '\u{1F64A}', '\u{1F64B}', '\u{1F64C}', '\u{1F64D}', '\u{1F64E}', '\u{1F64F}'
    ];

    constructor() {
        super({ btnEnd: true });
    }

    render() {
        // this.data = 'APPLE_EMOJI';
        const scrollArea = this.createScrollArea();

        const emojiContainer = this.createElement('div', ['emojiContainer']);

        for (const emoji of this.notoSansSymbols2) {
            const emojiBtn = this.createElement('button', ['emojiBtn']);
            emojiBtn.innerHTML = emoji;

            emojiContainer.appendChild(emojiBtn);
        }

        scrollArea.appendChild(emojiContainer);
        this.mainArea.appendChild(scrollArea);
    }

    update() {

    }
}