
import { App } from "../components/app";
import { HomeApp } from '../stores/settings.store';
import { HistoryStateManager } from "../device/history.manager";


export class HomePages extends App {
    private pageIndicator: HTMLElement;

    constructor(history: HistoryStateManager) {
        super(history, {});

        this.mainArea = this.getElement(".homeScrollView");
        this.pageIndicator = this.getElement('.pageIndicator');
    }

    render(list: HomeApp[]) {
        const pages = this.getHomePages(list, 6);

        pages.forEach((apps, index) => {
            const appList = this.createElement('div', ['appList']);

            apps.forEach((app) => {
                const appLink = this.createElement('button', ['appLink']);
                appLink.textContent = app.name;
                this.addEventListener('click', () => {
                    this.history.setUrl('/' + app.id, app.id);
                }, appLink);
                appList.appendChild(appLink);
            })

            const page = this.createElement('button', ['page', index ? 'inactive' : 'active']);
            this.addEventListener('click', () => {
                this.mainArea.scrollLeft = this.mainArea.clientWidth * index;
            }, page);
            this.pageIndicator.appendChild(page);

            this.mainArea.appendChild(appList);
        })

        this.addEventListener('scroll', event => {
            const target = event.target as HTMLDivElement;
            const scrollX = target.scrollLeft;
            const activeIndex = Math.round(scrollX / target.clientWidth);
            const pageIndicators = this.getAllElement('.pageIndicator .page')
            Array.from(pageIndicators).forEach((elem, index) => {
                if (activeIndex === index) elem.classList.add('active');
                else elem.classList.remove('active');
            });
        }, this.mainArea);
    }

    update(_: string, list: HomeApp[]) {
        this.removeAllEventListeners();
        this.mainArea.innerHTML = '';
        this.pageIndicator.innerHTML = '';
        this.render(list);
    }

    private getHomePages(array: HomeApp[], chunkSize: number): HomeApp[][] {
        const apps = array.sort((a, b) => a.order - b.order).filter(item => item.isShow);
        const result: HomeApp[][] = [];
        for (let i = 0; i < apps.length; i += chunkSize) {
          const chunk = apps.slice(i, i + chunkSize);
          result.push(chunk);
        }
        return result;
    }
}