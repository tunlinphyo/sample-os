import { HistoryStateManager } from '../../device/history.manager';
import '../../style.css';
import './calculator.css';
import { CalculatorApp } from './calculator.pages';

document.body.dataset.schema = parent.device.theme;

document.addEventListener('DOMContentLoaded', () => {
    const historyManager = new HistoryStateManager();

    const calculatorApp = new CalculatorApp(historyManager, parent.device);

    calculatorApp.render();
})
