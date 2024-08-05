export function getCSSVariable(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function setCSSVariable(name: string, value: string): void {
    document.documentElement.style.setProperty(name, value);
}

export function getSchema() {
    return document.body.dataset.schema || 'auto';
}
