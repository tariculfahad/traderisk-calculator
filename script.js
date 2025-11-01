document.addEventListener('DOMContentLoaded', () => {
    // Modal elements
    const currencyText = document.getElementById('currency-text');
    const currencyModal = document.getElementById('currency-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const currencyOptions = document.querySelectorAll('.modal-content ul li');

    // Calculator elements
    const calculateBtn = document.getElementById('calculate-btn');
    const pairSelect = document.getElementById('pair');
    const chartTitle = document.getElementById('chart-pair-title');
    const rrRatioSelect = document.getElementById('rr-ratio');
    
    // Chart control elements
    const timeframeButtons = document.querySelectorAll('.timeframe-btn');
    const chartTypeButtons = document.querySelectorAll('.chart-type-btn');

    let tradingViewWidget;
    let selectedCurrency = 'USD';
    let lastCalculatedRiskAmount = null;
    let currentInterval = '240';
    let currentStyle = 1;

    const pipValues = {
        'EURUSD': 10, 'GBPUSD': 10, 'AUDUSD': 10, 'USDCAD': 10,
        'USDJPY': 0.09, 'XAUUSD': 1
    };
    
    // --- Modal Logic ---
    currencyText.addEventListener('click', () => {
        currencyModal.style.display = 'flex';
    });

    closeModalBtn.addEventListener('click', () => {
        currencyModal.style.display = 'none';
    });

    currencyModal.addEventListener('click', (event) => {
        if (event.target === currencyModal) {
            currencyModal.style.display = 'none';
        }
    });

    currencyOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectedCurrency = option.getAttribute('data-currency');
            currencyText.textContent = selectedCurrency;
            currencyModal.style.display = 'none';
            if (lastCalculatedRiskAmount !== null) {
                calculateRisk();
            }
        });
    });

    // --- Calculation Logic ---
    function calculateRisk(event) {
        const accountBalance = parseFloat(document.getElementById('account-balance').value);
        const riskPercentage = parseFloat(document.getElementById('risk-percentage').value);
        const stopLoss = parseFloat(document.getElementById('stop-loss').value);
        const pair = pairSelect.value;
        const rewardRatio = parseFloat(rrRatioSelect.value);

        if (isNaN(accountBalance) || isNaN(riskPercentage) || isNaN(stopLoss)) {
            if(event && event.target.id === 'calculate-btn') {
                alert("Please fill in all fields: Balance, Risk, and Pips.");
            }
            return;
        }

        const riskAmount = accountBalance * (riskPercentage / 100);
        lastCalculatedRiskAmount = riskAmount;
        
        const pipValue = pipValues[pair] || 10;
        const lotSize = riskAmount / (stopLoss * pipValue);
        const rewardAmount = riskAmount * rewardRatio;
        
        document.getElementById('risk-amount').textContent = `${riskAmount.toFixed(2)} ${selectedCurrency}`;
        document.getElementById('lot-size').textContent = lotSize.toFixed(3);
        document.getElementById('reward-amount').textContent = `${rewardAmount.toFixed(2)} ${selectedCurrency}`;
    }
    
    function updateRewardOnly() {
        if (lastCalculatedRiskAmount !== null) {
            const rewardRatio = parseFloat(rrRatioSelect.value);
            const rewardAmount = lastCalculatedRiskAmount * rewardRatio;
            document.getElementById('reward-amount').textContent = `${rewardAmount.toFixed(2)} ${selectedCurrency}`;
        }
    }

    // --- TradingView Chart Logic ---
    function createTradingViewWidget(symbol) {
        const container = document.getElementById('tradingview-chart-container');
        if (!container) return;
        container.innerHTML = ''; 
        
        tradingViewWidget = new TradingView.widget({
            "autosize": true,
            "symbol": symbol,
            "interval": currentInterval,
            "style": currentStyle,
            "timezone": "Etc/UTC",
            "theme": "dark",
            "locale": "en",
            "enable_publishing": false,
            "hide_top_toolbar": true,
            "hide_legend": true,
            "save_image": false,
            "container_id": "tradingview-chart-container"
        });
    }
    
    // --- Event Listeners ---
    calculateBtn.addEventListener('click', calculateRisk);
    rrRatioSelect.addEventListener('change', updateRewardOnly);
    
    pairSelect.addEventListener('change', (event) => {
        const selectedPair = event.target.value;
        const pairText = event.target.options[event.target.selectedIndex].text;
        chartTitle.textContent = pairText;
        const chartSymbol = selectedPair === 'XAUUSD' ? 'OANDA:XAUUSD' : `FX:${selectedPair}`;
        createTradingViewWidget(chartSymbol);
    });

    timeframeButtons.forEach(button => {
        button.addEventListener('click', () => {
            timeframeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentInterval = button.getAttribute('data-interval');
            const currentSymbol = pairSelect.value === 'XAUUSD' ? 'OANDA:XAUUSD' : `FX:${pairSelect.value}`;
            createTradingViewWidget(currentSymbol);
        });
    });

    chartTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            chartTypeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentStyle = parseInt(button.getAttribute('data-style'));
            const currentSymbol = pairSelect.value === 'XAUUSD' ? 'OANDA:XAUUSD' : `FX:${pairSelect.value}`;
            createTradingViewWidget(currentSymbol);
        });
    });

    // --- Initial Load ---
    const initialPair = pairSelect.value;
    const initialChartSymbol = initialPair === 'XAUUSD' ? 'OANDA:XAUUSD' : `FX:${initialPair}`;
    createTradingViewWidget(initialChartSymbol);
});