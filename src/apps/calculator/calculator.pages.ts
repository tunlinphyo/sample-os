import { App } from "../../components/app";
import { DeviceController } from "../../device/device";
import { HistoryStateManager } from "../../device/history.manager";

interface CalculatorData {
    currentInput: string;
    operator: string | null;
    previousInput: string;
    textContent: string;
}

export class CalculatorApp extends App {
    private currentInput = '';
    private operator: null | string = null;
    private previousInput = '';
    private display: HTMLElement;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController
    ) {
        super(history);
        const calculator = this.cloneTemplate('mainareaTemplate');
        this.replaceElement(this.mainArea, calculator);

        this.display = this.getElement('#displayValue');
        this.init();
    }

    get data(): CalculatorData {
        return {
            currentInput: this.currentInput,
            operator: this.operator,
            previousInput: this.previousInput,
            textContent: this.display.textContent || '0'
        }
    }
    set data(data: CalculatorData) {
        this.currentInput = data.currentInput;
        this.operator = data.operator;
        this.previousInput = data.previousInput;
        this.display.textContent = data.textContent;
    }

    init() {
        this.device.addEventListener('openAppFinished', () => {
            const history = parent.device.getHistory('calculator');
            if (!history) return;
            this.history.init(history);

            if (history[0]) {
                this.data = history[0].state;
            }
        })

        this.device.addEventListener('closeApp', () => {
            this.device.setHistory('calculator', this.history.history);
        });
    }

    render() {
        const pads = this.getAllElement('.pad');

        pads.forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                const buttonContent = button.dataset.value || '';

                switch (action) {
                    case 'clear':
                        this.clearDisplay();
                        break;
                    case 'backspace':
                        this.backspace();
                        break;
                    case 'operator':
                        this.setOperator(buttonContent);
                        break;
                    case 'equals':
                        this.calculate();
                        break;
                    case 'percent':
                        this.handlePercent();
                        break;
                    case 'negate':
                        this.handleNegate();
                        break;
                    default:
                        this.appendNumber(buttonContent);
                }

                setTimeout(() => {
                    this.history.replaceState('/', this.data);
                }, 0);
            });
        })
    }

    update() {

    }

    private clearDisplay() {
        this.currentInput = '';
        this.operator = null;
        this.previousInput = '';
        this.display.textContent = '0';
    }

    private backspace() {
        this.currentInput = this.currentInput.slice(0, -1);
        this.display.textContent = this.formatNumber(this.currentInput) || '0';
    }

    private appendNumber(number: string) {
        const [integer, decimal] = this.currentInput.split('.');
        const maxLength = integer.concat(decimal || '')
        if (maxLength.length >= 9) return;
        if (number === '.' && this.currentInput.includes('.')) return;
        this.currentInput += number;
        if (this.currentInput.startsWith('0')) {
            this.currentInput = String(parseFloat(this.currentInput))
        }
        if (this.currentInput.startsWith('.')) {
            this.currentInput = '0'.concat(this.currentInput)
        }
        this.display.textContent = this.formatNumber(this.currentInput);
    }

    private setOperator(op: string) {
        if (this.currentInput === '' && op === '-') {
            this.currentInput = '-';
            this.display.textContent = this.formatNumber(this.currentInput);
            return;
        }
        if (this.currentInput === '') return;
        if (this.previousInput !== '') {
            this.calculate();
        }
        this.operator = op;
        this.previousInput = this.currentInput;
        this.currentInput = '';
    }

    private calculate() {
        let result;
        const prev = parseFloat(this.previousInput);
        const curr = parseFloat(this.currentInput);
        if (isNaN(prev) || isNaN(curr)) return;
        switch (this.operator) {
            case '+':
                result = prev + curr;
                break;
            case '-':
                result = prev - curr;
                break;
            case '*':
                result = prev * curr;
                break;
            case '/':
                result = prev / curr;
                break;
            default:
                return;
        }
        this.currentInput = result.toString();
        this.operator = null;
        this.previousInput = '';
        this.display.textContent = this.formatNumber(this.currentInput);
    }

    private handlePercent() {
        if (this.currentInput === '') return;
        this.currentInput = (parseFloat(this.currentInput) / 100).toString();
        this.display.textContent = this.formatNumber(this.currentInput);
    }

    private handleNegate() {
        if (this.currentInput === '') return;
        this.currentInput = (parseFloat(this.currentInput) * -1).toString();
        this.display.textContent = this.formatNumber(this.currentInput);
    }

    private formatNumber(number: string) {
        const isDecimal = number.includes('.')
        if (number === '') return '';
        const [integer, decimal] = number.split('.');
        const formattedInteger = parseInt(integer).toLocaleString();
        return isDecimal ? `${formattedInteger}.${decimal}` : formattedInteger;
    }
}