export interface Content {
    id: string;
    text: string;
}

export class EbookRender {
    constructor(
        private parentEl: HTMLElement,
        private contents: Content[]
    ) {}

    public getContents() {
        let total = 0;
        const list = this.contents.map(item => {
            const { pages, totalPages } = this.paginate(item);
            const startPage = total + 1;
            total += totalPages;
            return {
                id: item.id,
                pages,
                startPage,
                endPage: total
            };
        });

        return { list, total };
    }

    private paginate(content: Content) {
        const tokens = this.tokenizeContent(content.text);
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.width = `${this.parentEl.clientWidth}px`;
        tempDiv.style.fontSize = '16px';
        tempDiv.style.lineHeight = '1.6';
        tempDiv.style.padding = '52px 16px 29px';
        tempDiv.style.visibility = 'hidden';
        this.parentEl.appendChild(tempDiv);

        const pages: string[] = [];
        let openTagsStack: string[] = [];

        let i = 0;
        while (i < tokens.length) {
            let low = i;
            let high = tokens.length;
            let fitIndex = i;
            let pageOpenTags = openTagsStack.slice();

            // Binary search to find the maximum number of tokens that fit in one page
            while (low < high) {
                const mid = Math.min(tokens.length, Math.floor((low + high + 1) / 2));
                let tempOpenTags = pageOpenTags.slice();
                const tokenSlice = tokens.slice(i, mid);

                const tokenSliceContent = this.processTokens(tokenSlice, tempOpenTags);
                const potentialContent = tokenSliceContent + this.getClosingTags(tempOpenTags);
                tempDiv.innerHTML = potentialContent;

                if (tempDiv.scrollHeight <= this.parentEl.clientHeight) {
                    fitIndex = mid;
                    low = mid;
                } else {
                    high = mid - 1;
                }
            }

            // If no tokens fit, force at least one token to avoid infinite loop
            if (fitIndex === i) {
                fitIndex = i + 1;
            }

            const tokensToAdd = tokens.slice(i, fitIndex);
            let tempOpenTags = pageOpenTags.slice();
            const tokenSliceContent = this.processTokens(tokensToAdd, tempOpenTags);

            // Update openTagsStack with tokens added
            this.updateOpenTags(tokensToAdd, openTagsStack);

            const pageContentWithClosingTags = tokenSliceContent + this.getClosingTags(tempOpenTags);
            pages.push(pageContentWithClosingTags.trim());

            i = fitIndex;
        }

        this.parentEl.removeChild(tempDiv);

        if (!pages.length) pages.push('');

        return { pages, totalPages: pages.length };
    }

    private tokenizeContent(content: string): string[] {
        const tokens: string[] = [];
        const regex = /(<[^>]+>)|([^<]+)/g;
        let match;

        while ((match = regex.exec(content)) !== null) {
            if (match[1]) {
                const tag = match[1];
                const processedTag = this.processTag(tag);
                if (processedTag) {
                    tokens.push(processedTag);
                }
            } else if (match[2]) {
                const words = match[2].split(/\s+/).filter(word => word.length > 0);
                tokens.push(...words.map(word => word + ' '));
            }
        }

        // Fill empty tags with a space
        return this.fillEmptyTags(tokens);
    }

    private processTag(tag: string): string | null {
        if (/^<img\b[^>]*>/i.test(tag)) {
            return null;
        }

        const openingATagMatch = /^<a\b([^>]*)>/i.exec(tag);
        if (openingATagMatch) {
            const attributes = openingATagMatch[1];
            return '<span' + attributes + '>';
        } else if (/^<\/a>/i.test(tag)) {
            return '</span>';
        } else {
            return tag;
        }
    }

    /**
     * New function to fill empty tags with a space.
     */
    private fillEmptyTags(tokens: string[]): string[] {
        const result: string[] = [];
        const tagStack: string[] = [];

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            if (this.isOpeningTag(token)) {
                const tagName = this.getTagName(token);
                tagStack.push(tagName);
                result.push(token);
            } else if (this.isClosingTag(token)) {
                const tagName = this.getTagName(token);
                const lastTag = tagStack.pop();

                if (lastTag === tagName) {
                    // Check if the tag is empty
                    if (i > 0 && this.isOpeningTag(tokens[i - 1]) && this.getTagName(tokens[i - 1]) === tagName) {
                        // Insert a space between the empty tag's opening and closing tags
                        result.push('&nbsp;');
                    }
                }
                result.push(token);
            } else {
                result.push(token);
            }
        }

        return result;
    }

    private isOpeningTag(token: string): boolean {
        return /^<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>$/.test(token) && !/^<\//.test(token) && !/\/>$/.test(token);
    }

    private isClosingTag(token: string): boolean {
        return /^<\/[a-zA-Z][a-zA-Z0-9]*>$/.test(token);
    }

    private getTagName(tag: string): string {
        const match = /^<\/?([a-zA-Z][a-zA-Z0-9]*)/.exec(tag);
        return match ? match[1] : '';
    }

    private getClosingTags(openTags: string[]): string {
        return openTags.slice().reverse().map(tag => `</${tag}>`).join('');
    }

    private processTokens(tokens: string[], openTags: string[]): string {
        let content = '';
        for (const token of tokens) {
            content += token;
            if (this.isOpeningTag(token)) {
                const tagName = this.getTagName(token);
                openTags.push(tagName);
            } else if (this.isClosingTag(token)) {
                openTags.pop();
            }
        }
        return content;
    }

    private updateOpenTags(tokens: string[], openTagsStack: string[]) {
        for (const token of tokens) {
            if (this.isOpeningTag(token)) {
                const tagName = this.getTagName(token);
                openTagsStack.push(tagName);
            } else if (this.isClosingTag(token)) {
                openTagsStack.pop();
            }
        }
    }
}