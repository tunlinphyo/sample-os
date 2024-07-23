import '../style.css'
import './home.css'
import { HomePages } from './home.pages';

document.body.dataset.schema = parent.device.theme;

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const homePages = new HomePages(parent.setting.history);

        parent.setting.addChangeListener((status: string, data: any) => {
            if (status === 'APPLOADED') {
                homePages.render(data);
            }
            if (status === 'UPDATE_APPS') {
                homePages.update('update', data.data);
            }
        });

        parent.setting.appsReady();
    }, 100);
});
