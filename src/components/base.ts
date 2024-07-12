export type EventListenerInfo = {
    eventName: string;
    target: EventTarget;
    listener: EventListenerOrEventListenerObject;
    options?: boolean | AddEventListenerOptions;
};

export abstract class BaseComponent {
    protected component: HTMLElement;
    private eventListeners: EventListenerInfo[] = [];
    protected customEvents: Set<string> = new Set();

    constructor(templateId: string, parent?: HTMLElement) {
        this.component = this.cloneTemplate(templateId);
        if (parent) parent.appendChild(this.component);

        this.handleScroll();
    }

    private handleScroll() {
        try {
            const fullScrollArea = this.getElement('.fullScrollArea');
            if (fullScrollArea) {
                const scrollElem = this.getElement('.mainArea');
                let lastScrollTop = 0;

                this.addEventListener('scroll', () => {
                    const scrollView = this.getElement('.mainArea > *');
                    const scrollTop = scrollElem.scrollTop;
                    const maxScroll = scrollView.clientHeight - scrollElem.clientHeight - 5;

                    if (scrollTop <= 0 || scrollTop >= maxScroll) {
                        fullScrollArea.classList.remove('hidden');
                    } else if (scrollTop > lastScrollTop) {
                        fullScrollArea.classList.add('hidden');
                    } else {
                        fullScrollArea.classList.remove('hidden');
                    }

                    lastScrollTop = scrollTop;
                }, scrollElem, false)
            }
        } catch(error) {
            // console.log(error);
        }
    }

    protected cloneTemplate<T extends HTMLElement>(templateId: string): T {
        const template = document.getElementById(templateId) as HTMLTemplateElement;
        if (!(template && template.content.firstElementChild)) {
            throw new Error(`Template with ID ${templateId} not found.`);
        }
        return template.content.firstElementChild.cloneNode(true) as T;
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

    protected replaceElement(oldElement: HTMLElement, newElement: HTMLElement) {
        if (oldElement.parentNode) {
            oldElement.parentNode.replaceChild(newElement, oldElement);
        } else {
            throw new Error('Parent node not found for the element to be replaced.');
        }
    }

    protected getElement<T extends HTMLElement>(selector: string, parent: Document | HTMLElement = this.component): T {
        const element = parent.querySelector(selector) as T;
        if (!element) {
            throw new Error(`Element with selector ${selector} not found.`);
        }
        return element;
    }

    protected getAllElement<T extends HTMLElement>(selector: string, parent: Document | HTMLElement = this.component): NodeListOf<T> {
        const elements = parent.querySelectorAll(selector) as NodeListOf<T>;
        if (!elements) {
            throw new Error(`Element with selector ${selector} not found.`);
        }
        return elements;
    }

    protected dispatchCustomEvent(eventName: string, data?: any) {
        const event = new CustomEvent(eventName, { detail: { page: this.component, data } });
        this.component.dispatchEvent(event);
        if (!this.customEvents.has(eventName)) {
            this.customEvents.add(eventName);
        }
    }

    public addEventListener(eventName: string, listener: EventListenerOrEventListenerObject, target: EventTarget = this.component, toClear: boolean = true, options?: boolean | AddEventListenerOptions) {
        target.addEventListener(eventName, listener, options);
        if (toClear) this.eventListeners.push({ eventName, target, listener, options });
    }

    public removeEventListener(eventName: string, listener: EventListenerOrEventListenerObject, target: EventTarget = this.component, options?: boolean | AddEventListenerOptions) {
        target.removeEventListener(eventName, listener, options);
        this.eventListeners = this.eventListeners.filter(
            ev => ev.eventName !== eventName || ev.listener !== listener || ev.options !== options || ev.target !== target
        );
    }

    protected removeAllEventListeners() {
        for (const { eventName, target, listener, options } of this.eventListeners) {
            if (!this.customEvents.has(eventName)) {
                this.removeEventListener(eventName, listener, target, options);
            }
        }
    }

    public logEvents() {
        console.log(this.eventListeners, this.customEvents)
    }

    public isAllCaps(text: string) {
        return text === text.toUpperCase() && /[A-Z]/.test(text);
      }
}
