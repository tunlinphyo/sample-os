import Sortable from 'sortablejs';

export class SortableList {
    constructor(private listId: string) {
        this.initializeSortable();
    }

    private initializeSortable(): void {
        const listElement = document.getElementById(this.listId);

        if (listElement) {
            Sortable.create(listElement, {
                animation: 150,
                handle: '.material-symbols-outlined',
                onEnd: () => {
                    this.updateDataIndex();
                }
            });
        }
    }

    private updateDataIndex(): void {
        const listItems = document.querySelectorAll(`#${this.listId} li`);
        listItems.forEach((item, index) => {
            item.setAttribute('data-index', index.toString());
        });
    }
}