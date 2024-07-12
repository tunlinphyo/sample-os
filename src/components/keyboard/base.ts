import { EventListenerInfo } from "../base";

export type KeyboardCallback = (data: string) => void;

export class KeyboardBase {
    private eventListeners: EventListenerInfo[] = [];
    protected component: HTMLElement;

    constructor(component: HTMLElement) {
        this.component = component;
        this.init();
    }

    private init() {
        this.removeAllEventListeners();
        this.component.innerHTML = '';
    }

    public addEventListener(eventName: string, listener: EventListenerOrEventListenerObject, target: EventTarget, options?: boolean | AddEventListenerOptions) {
        target.addEventListener(eventName, listener, options);
        this.eventListeners.push({ eventName, target, listener, options });
    }

    public removeEventListener(eventName: string, listener: EventListenerOrEventListenerObject, target: EventTarget, options?: boolean | AddEventListenerOptions) {
        target.removeEventListener(eventName, listener, options);
        this.eventListeners = this.eventListeners.filter(
            ev => ev.eventName !== eventName || ev.listener !== listener || ev.options !== options || ev.target !== target
        );
    }

    protected removeAllEventListeners() {
        for (const { eventName, target, listener, options } of this.eventListeners) {
            this.removeEventListener(eventName, listener, target, options);
        }
    }

    protected createElement<T extends HTMLElement>(elementName: string, classes: string[] = [], attributes: { [key: string]: string } = {}): T {
        const element = document.createElement(elementName) as T;

        if (classes.length > 0) {
            element.classList.add(...classes);
        }

        for (const key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                element.setAttribute(key, attributes[key]);
            }
        }

        return element;
    }

    protected getElement<T extends HTMLElement>(selector: string, parent: Document | HTMLElement = this.component): T {
        const element = parent.querySelector(selector) as T;
        if (!element) {
            throw new Error(`Element with selector ${selector} not found.`);
        }
        return element;
    }

    protected replaceElement(oldElement: HTMLElement, newElement: HTMLElement) {
        if (oldElement.parentNode) {
            oldElement.parentNode.replaceChild(newElement, oldElement);
        } else {
            throw new Error('Parent node not found for the element to be replaced.');
        }
    }
}
