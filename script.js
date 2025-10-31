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
    let tradingViewWidget;
    let selectedCurrency = 'USD'; // Default currency

    const pipValues = {
        'EURUSD': 10, 'GBPUSD': 10, 'AUDUSD': 10, 'USDCAD': 10,
        'USDJPY': 0.09 // Example value for JPY pairs (approximate)
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
        });
    });

    // --- Calculation Logic ---
    function calculateRisk() {
        const accountBalance = parseFloat(document.getElementById('account-balance').value);
        const riskPercentage = parseFloat(document.getElementById('risk-percentage').value);
        const stopLoss = parseFloat(document.getElementById('stop-loss').value);
        const pair = pairSelect.value;
        
        // Check if any field is empty
        if (isNaN(accountBalance) || isNaN(riskPercentage) || isNaN(stopLoss)) {
            alert("Please fill in all fields: Balance, Risk, and Pips.");
            return;
        }

        const riskAmount = accountBalance * (riskPercentage / 100);
        const pipValue = pipValues[pair] || 10;
        const lotSize = riskAmount / (stopLoss * pipValue);
        const rewardAmount = riskAmount * 2;
        
        // Display results
        document.getElementById('risk-amount').textContent = `${riskAmount.toFixed(2)} ${selectedCurrency}`;
        document.getElementById('lot-size').textContent = lotSize.toFixed(3);
        document.getElementById('reward-amount').textContent = `${rewardAmount.toFixed(2)} ${selectedCurrency}`;
    }

    // --- TradingView Chart Logic ---
    function createTradingViewWidget(symbol) {
        const container = document.getElementById('tradingview-chart-container');
        container.innerHTML = ''; // Clear previous widget
        
        tradingViewWidget = new TradingView.widget({
            "autosize": true,
            "symbol": `FX:${symbol}`,
            "interval": "15",
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
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
    
    pairSelect.addEventListener('change', (event) => {
        const selectedPair = event.target.value;
        chartTitle.textContent = selectedPair.slice(0, 3) + '/' + selectedPair.slice(3);
        createTradingViewWidget(selectedPair);
    });

    // --- Initial Load ---
    createTradingViewWidget(pairSelect.value);

});