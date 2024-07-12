export const message = {
    PHONE_CALL: 'PHONE_CALL',
    ALARM_ALERT: 'ALARM_ALART',
    STOPWATCH_START: 'STOPWATCH_START',
    STOPWATCH_ALART: 'STOPWATCH_ALART',
    COUNTDOWN_START: 'COUNTDOWN_START',
    COUNTDOWN_STOP: 'COUNTDOWN_STOP',
    COUNTDOWN_RESET: 'COUNTDOWN_RESET',
    COUNTDOWN_ALART: 'COUNTDOWN_ALART',
    COUNTDOWN_CLOSE: 'COUNTDOWN_CLOSE',
}

export interface MessageData {
    type: string;
    message: any;
}

export interface Message {
    type: string;
    data: any;
    messageId: string;
    ack?: boolean;
}

export type MessageHandler = (message: Message) => void;

class PostMessage {
    private targetWindow: Window;
    private targetOrigin: string;
    private handlers: { [key: string]: MessageHandler } = {};

    constructor(targetWindow: Window, targetOrigin: string = '*') {
        this.targetWindow = targetWindow;
        this.targetOrigin = targetOrigin;
        window.addEventListener('message', this.receiveMessage.bind(this));
    }

    public sendMessage(type: string, data: any): void {
        const messageId = this.generateMessageId();
        const message: Message = { type, data, messageId };


        this.targetWindow.postMessage(message, this.targetOrigin);
    }

    public onMessage(type: string, handler: MessageHandler): void {
        this.handlers[type] = handler;
    }

    private receiveMessage(event: MessageEvent): void {
        if (event.origin !== this.targetOrigin) {
            return;
        }

        const message: Message = event.data;

        if (this.handlers[message.type]) {
            this.handlers[message.type](message);
        }
    }

    private generateMessageId(): string {
        return Math.random().toString(36).substr(2, 9);
    }
}

export default PostMessage;