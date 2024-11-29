

export class OSString {
    public static getBookTitle(text: string) {
        const lastPart = text.split('-').pop() || "";
        const formattedTitle = lastPart
            .replace(/([A-Z])/g, ' $1')
            .trim();

        return formattedTitle;
    }
}