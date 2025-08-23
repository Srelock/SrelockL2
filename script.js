// Tab switching functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const calculatorContents = document.querySelectorAll('.calculator-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            calculatorContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Smooth scroll to the calculator section
            const calculatorSection = document.querySelector('.calculator-section');
            if (calculatorSection) {
                calculatorSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add input validation for numeric fields
    const numericInputs = document.querySelectorAll('input[type="number"]');
    
    numericInputs.forEach(input => {
        input.addEventListener('input', function() {
            const value = parseFloat(this.value);
            const min = parseFloat(this.min);
            const max = parseFloat(this.max);
            
            if (this.value !== '' && !isNaN(value)) {
                if (min !== 0 && value < min) {
                    this.value = min;
                }
                if (max !== 0 && value > max) {
                    this.value = max;
                }
            }
        });
    });

    // Add tooltips to form fields
    const tooltips = {
        'your-level': 'Your character\'s current level',
        'mob-level': 'The level of the monster you are fighting',
        'adena-amount': 'Amount of Adena in billions',
        'buy-price': 'Price to buy Adena per billion',
        'sell-price': 'Price to sell Adena per billion',
        'coin-price': 'Price for 10,000 coins in USD',
        'coin-amount': 'Amount of coins you want to buy',
        'hourly-amount': 'Amount of XP or Adena earned',
        'hourly-hours': 'Hours spent farming',
        'hourly-minutes': 'Minutes spent farming'
    };

    Object.keys(tooltips).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.title = tooltips[id];
        }
    });

    // Add auto-formatting for hourly amount input
    const hourlyAmountInput = document.getElementById('hourly-amount');
    if (hourlyAmountInput) {
        hourlyAmountInput.addEventListener('input', function() {
            formatNumber(this);
            if (this.value && (document.getElementById('hourly-hours').value || document.getElementById('hourly-minutes').value)) {
                setTimeout(calculateHourlyRate, 500); // Debounce the calculation
            }
        });
    }

    // Add auto-calculation for hourly time inputs
    const hourlyHoursInput = document.getElementById('hourly-hours');
    const hourlyMinutesInput = document.getElementById('hourly-minutes');
    
    if (hourlyHoursInput) {
        hourlyHoursInput.addEventListener('input', function() {
            if (this.value && document.getElementById('hourly-amount').value) {
                setTimeout(calculateHourlyRate, 500); // Debounce the calculation
            }
        });
    }
    
    if (hourlyMinutesInput) {
        hourlyMinutesInput.addEventListener('input', function() {
            if (this.value && document.getElementById('hourly-amount').value) {
                setTimeout(calculateHourlyRate, 500); // Debounce the calculation
            }
        });
        
        // Ensure minutes don't exceed 59
        hourlyMinutesInput.addEventListener('blur', function() {
            if (this.value > 59) {
                this.value = 59;
            }
        });
    }

    // Allow Enter key to trigger hourly calculation
    document.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.id === 'hourly-amount' || activeElement.id === 'hourly-hours' || activeElement.id === 'hourly-minutes')) {
                calculateHourlyRate();
            }
        }
    });
});

// Damage Penalty Calculator
function calculateDamagePenalty() {
    const yourLevel = parseInt(document.getElementById('your-level').value) || 0;
    const mobLevel = parseInt(document.getElementById('mob-level').value) || 0;

    if (yourLevel === 0 || mobLevel === 0) {
        alert('Please enter valid level values.');
        return;
    }

    // Lineage 2 damage penalty calculation
    // When mob level is higher than player level, there's a damage penalty
    let penaltyDivider = 1.0;
    let damageReduction = 0.0;

    if (mobLevel > yourLevel) {
        const levelDifference = mobLevel - yourLevel - 1; // Subtract 1 to match spreadsheet
        
        // Lineage 2 damage penalty formula from Google Spreadsheet
        // =IF(C6>0;IF(C6=0;1,035;IF(1,25^(C6)<1;"Штрафа Нет";(1,25^(C6))))*1,035;IF(C6=0;1,035;IF(1,25^(C6)<1;"Штрафа Нет";(1,25^(C6)))))
        
        let g5 = 100; // Base value (equivalent to G5 in spreadsheet)
        
        // Calculate penalty divider using the formula: 1.035 × (1.25^levelDifference)
        if (levelDifference >= 0) {
            penaltyDivider = 1.035 * Math.pow(1.25, levelDifference);
        } else {
            penaltyDivider = 1.0; // No penalty
        }
        
        // Final calculation: =G5/C7 (where C7 is the penaltyDivider)
        const finalDivider = g5 / penaltyDivider;
        
        // Calculate damage reduction percentage (negative value for penalty)
        // The result should be -38.16% for level 121 vs 124
        damageReduction = -((100 - finalDivider) / 100) * 100;
    } else if (mobLevel < yourLevel) {
        // Bonus damage when player level is higher
        const levelDifference = yourLevel - mobLevel;
        if (levelDifference <= 5) {
            penaltyDivider = 1.0 - (levelDifference * 0.02); // 2% bonus per level
            damageReduction = -((1.0 - penaltyDivider) * 100); // Negative means bonus
        }
    }

    // Display results with 2 decimal places for damage reduction
    document.getElementById('penalty-divider').textContent = penaltyDivider.toFixed(3);
    document.getElementById('damage-reduction').textContent = damageReduction.toFixed(2) + '%';

    // Show result section
    document.getElementById('damage-result').style.display = 'block';
}

// Adena Calculator
function calculateAdena() {
    const adenaAmount = parseFloat(document.getElementById('adena-amount').value) || 0;
    const buyPrice = parseFloat(document.getElementById('buy-price').value) || 0;
    const sellPrice = parseFloat(document.getElementById('sell-price').value) || 0;
    const coinPrice = parseFloat(document.getElementById('coin-price').value) || 0;
    const coinAmount = parseFloat(document.getElementById('coin-amount').value) || 0;

    if (adenaAmount === 0 || buyPrice === 0 || sellPrice === 0 || coinPrice === 0 || coinAmount === 0) {
        alert('Please enter valid values for all fields.');
        return;
    }

    // Calculate basic adena trading
    const buyCost = adenaAmount * buyPrice;
    const sellRevenue = adenaAmount * sellPrice;
    const profit = sellRevenue - buyCost;

    // Calculate adena needed for 10k coins
    const adenaNeededForCoins = sellPrice > 0 ? coinPrice / sellPrice : 0;
    const costForCoinsAdena = adenaNeededForCoins * buyPrice;

    // Calculate for selected coin amount
    const adenaNeededForSelectedCoins = sellPrice > 0 ? (coinAmount / 10000) * coinPrice / sellPrice : 0;
    const costForSelectedCoinsAdena = adenaNeededForSelectedCoins * buyPrice;

    // Display results
    document.getElementById('buy-cost').textContent = '$' + buyCost.toFixed(2);
    document.getElementById('sell-revenue').textContent = '$' + sellRevenue.toFixed(2);
    document.getElementById('profit').textContent = '$' + profit.toFixed(2);
    document.getElementById('adena-for-coins').textContent = adenaNeededForCoins.toFixed(2) + ' billion';
    document.getElementById('adena-for-coins-cost').textContent = '$' + costForCoinsAdena.toFixed(2);
    document.getElementById('total-coin-cost').textContent = '$' + coinPrice.toFixed(2);
    document.getElementById('adena-for-selected-coins').textContent = adenaNeededForSelectedCoins.toFixed(2) + ' billion';
    document.getElementById('adena-cost-for-selected-coins').textContent = '$' + costForSelectedCoinsAdena.toFixed(2);

    // Show result section
    document.getElementById('adena-result').style.display = 'block';
}

// Hourly Rate Calculator
function calculateHourlyRate() {
    const amount = parseFormattedNumber(document.getElementById('hourly-amount').value);
    const hours = parseInt(document.getElementById('hourly-hours').value) || 0;
    const minutes = parseInt(document.getElementById('hourly-minutes').value) || 0;
    
    // Validate inputs
    if (isNaN(amount) || amount < 0) {
        alert('Please enter a valid amount (must be a positive number)');
        return;
    }
    
    if (hours === 0 && minutes === 0) {
        alert('Please enter a valid time (must be greater than 0)');
        return;
    }
    
    // Convert time to total hours
    const totalHours = hours + (minutes / 60);
    
    // Calculate hourly rate
    const hourlyRate = amount / totalHours;
    
    // Calculate amounts for 1 hour and 3 hours
    const oneHourAmount = hourlyRate * 1;
    const threeHoursAmount = hourlyRate * 3;
    
    // Display results
    document.getElementById('hourly-rate').textContent = formatCurrency(hourlyRate);
    document.getElementById('one-hour-amount').textContent = formatCurrency(oneHourAmount);
    document.getElementById('three-hours-amount').textContent = formatCurrency(threeHoursAmount);
    
    // Show result section
    document.getElementById('hourly-result').style.display = 'block';
}

// Helper function to switch tabs
function switchTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-button');
    const calculatorContents = document.querySelectorAll('.calculator-content');
    
    tabButtons.forEach(btn => btn.classList.remove('active'));
    calculatorContents.forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// Helper function to format number with commas
function formatNumber(input) {
    // Remove all non-digit characters except decimal point
    let value = input.value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Format the whole number part with commas
    if (parts.length > 0) {
        const wholePart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        value = parts.length > 1 ? wholePart + '.' + parts[1] : wholePart;
    }
    
    input.value = value;
}

// Helper function to parse formatted number
function parseFormattedNumber(value) {
    return parseFloat(value.replace(/,/g, ''));
}

// Helper function to format currency with K, M, B, T suffixes
function formatCurrency(amount) {
    const roundedAmount = Math.round(amount);
    const formattedNumber = roundedAmount.toLocaleString('en-US');
    
    if (roundedAmount >= 1e12) {
        return 'T ' + formattedNumber;
    } else if (roundedAmount >= 1e9) {
        return 'B ' + formattedNumber;
    } else if (roundedAmount >= 1e6) {
        return 'M ' + formattedNumber;
    } else if (roundedAmount >= 1e3) {
        return 'K ' + formattedNumber;
    } else {
        return formattedNumber;
    }
}
