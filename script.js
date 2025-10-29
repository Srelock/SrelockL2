// Tab switching functionality
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for hero CTA
    const heroCTA = document.querySelector('.hero-cta');
    if (heroCTA) {
        heroCTA.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector('#calculators');
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
    
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
        'hourly-amount': 'Amount of XP or Adena earned',
        'hourly-hours': 'Hours spent farming',
        'hourly-minutes': 'Minutes spent farming',
        'adenaRate': 'Exchange rate: How much Adena equals 1 Dollar',
        'itemPrice': 'The price of the item in the selected currency'
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
            const hours = parseInt(document.getElementById('hourly-hours').value) || 0;
            const minutes = parseInt(document.getElementById('hourly-minutes').value) || 0;
            if (this.value && (hours > 0 || minutes > 0)) {
                setTimeout(calculateHourlyRate, 500); // Debounce the calculation
            }
        });
    }

    // Add auto-calculation for hourly time inputs
    const hourlyHoursInput = document.getElementById('hourly-hours');
    const hourlyMinutesInput = document.getElementById('hourly-minutes');
    
    if (hourlyHoursInput) {
        hourlyHoursInput.addEventListener('input', function() {
            const hours = parseInt(this.value) || 0;
            const minutes = parseInt(document.getElementById('hourly-minutes').value) || 0;
            const amount = parseFormattedNumber(document.getElementById('hourly-amount').value);
            if ((hours > 0 || minutes > 0) && !isNaN(amount) && amount > 0) {
                setTimeout(calculateHourlyRate, 500); // Debounce the calculation
            }
        });
    }
    
    if (hourlyMinutesInput) {
        hourlyMinutesInput.addEventListener('input', function() {
            const hours = parseInt(document.getElementById('hourly-hours').value) || 0;
            const minutes = parseInt(this.value) || 0;
            const amount = parseFormattedNumber(document.getElementById('hourly-amount').value);
            if ((hours > 0 || minutes > 0) && !isNaN(amount) && amount > 0) {
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

    // Currency calculator event listeners
    const adenaRateInput = document.getElementById('adenaRate');
    const itemPriceInput = document.getElementById('itemPrice');
    
    if (adenaRateInput) {
        adenaRateInput.addEventListener('input', function(e) {
            formatCurrencyInput(e.target);
            calculateCurrencyConversions();
        });
    }
    
    if (itemPriceInput) {
        itemPriceInput.addEventListener('input', function(e) {
            formatCurrencyInput(e.target);
            calculateCurrencyConversions();
        });
    }

    // Initial currency calculation
    calculateCurrencyConversions();
    
    // Initialize armor calculator if on armor tab
    if (document.getElementById('armor')) {
        updateArmorTotals();
    }
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

// Currency Calculator Functions
let currentCurrency = 'coins';

// Fixed conversion rate: 10000 coins = 7 dollars
const COINS_TO_DOLLARS_RATE = 7 / 10000; // 1 coin = 0.0007 dollars

function selectCurrency(currency) {
    currentCurrency = currency;
    
    // Update active tab
    document.querySelectorAll('.currency-tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update label
    const labels = {
        'coins': 'Item Price (Einhasad Coins):',
        'dollars': 'Item Price (Dollars):',
        'adena': 'Item Price (Adena):'
    };
    document.querySelector('label[for="itemPrice"]').textContent = labels[currency];
    
    // Recalculate
    calculateCurrencyConversions();
}

function calculateCurrencyConversions() {
    const itemPriceElement = document.getElementById('itemPrice');
    const adenaRateElement = document.getElementById('adenaRate');
    
    if (!itemPriceElement || !adenaRateElement) return;
    
    const itemPriceValue = itemPriceElement.value.replace(/,/g, '');
    const adenaRateValue = adenaRateElement.value.replace(/,/g, '');
    
    const itemPrice = parseFloat(itemPriceValue) || 0;
    const adenaRate = parseFloat(adenaRateValue) || 1000000000;

    let coins, dollars, adena;

    // Convert input to all three currencies
    if (currentCurrency === 'coins') {
        coins = itemPrice;
        dollars = coins * COINS_TO_DOLLARS_RATE;
        adena = dollars * adenaRate;
    } else if (currentCurrency === 'dollars') {
        dollars = itemPrice;
        coins = dollars / COINS_TO_DOLLARS_RATE;
        adena = dollars * adenaRate;
    } else if (currentCurrency === 'adena') {
        adena = itemPrice;
        dollars = adena / adenaRate;
        coins = dollars / COINS_TO_DOLLARS_RATE;
    }

    // Display results
    const coinsResultElement = document.getElementById('coinsResult');
    const dollarsResultElement = document.getElementById('dollarsResult');
    const adenaResultElement = document.getElementById('adenaResult');
    
    if (coinsResultElement) {
        coinsResultElement.textContent = formatNumberDisplay(coins, 2);
    }
    if (dollarsResultElement) {
        dollarsResultElement.textContent = '$' + formatNumberDisplay(dollars, 2);
    }
    if (adenaResultElement) {
        adenaResultElement.textContent = formatNumberDisplay(adena, 0);
    }
}

function formatNumberDisplay(num, decimals) {
    if (isNaN(num) || num === null) return '0';
    return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

// Format input with commas while typing for currency calculator
function formatCurrencyInput(input) {
    let value = input.value.replace(/,/g, '');
    
    // Allow decimal point and numbers only
    value = value.replace(/[^\d.]/g, '');
    
    // Prevent multiple decimal points
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Format with commas
    if (value) {
        const [integerPart, decimalPart] = value.split('.');
        const formattedInteger = parseInt(integerPart || '0').toLocaleString('en-US');
        input.value = decimalPart !== undefined ? formattedInteger + '.' + decimalPart : formattedInteger;
    }
}

// ==================== Armor Calculator Functions ====================

const armorMaterials = {
    helmet: {
        "Crystal of Protection": 3710,
        "Aether": 76500,
        "Solaris": 520,
        "Jewel": 2080,
        "Adena": 1511640000
    },
    chest: {
        "Crystal of Protection": 9892,
        "Aether": 210296,
        "Solaris": 1540,
        "Jewel": 5548,
        "Adena": 4032009000
    },
    gloves: {
        "Crystal of Protection": 2473,
        "Aether": 57296,
        "Solaris": 501,
        "Jewel": 1392,
        "Adena": 1011636000
    },
    boots: {
        "Crystal of Protection": 2473,
        "Aether": 57296,
        "Solaris": 501,
        "Jewel": 1392,
        "Adena": 1011636000
    },
    gaiters: {
        "Crystal of Protection": 6183,
        "Aether": 133796,
        "Solaris": 1020,
        "Jewel": 3468,
        "Adena": 2520369000
    }
};

function formatArmorNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function parseArmorFormattedNumber(value) {
    return parseFloat(value.replace(/,/g, '')) || 0;
}

function formatArmorPriceInput(input) {
    const cursorPosition = input.selectionStart;
    const oldValue = input.value;
    
    let numericValue = oldValue.replace(/[^\d]/g, '');
    
    if (numericValue) {
        const formatted = parseInt(numericValue).toLocaleString();
        input.value = formatted;
        
        const commasBefore = (oldValue.substring(0, cursorPosition).match(/,/g) || []).length;
        const commasAfter = (formatted.substring(0, cursorPosition).match(/,/g) || []).length;
        const newPosition = cursorPosition + (commasAfter - commasBefore);
        input.setSelectionRange(newPosition, newPosition);
    }
    
    updateArmorCosts();
}

function updateArmorTotals() {
    const totals = {};
    
    for (const piece in armorMaterials) {
        const checkbox = document.getElementById(piece);
        const pieceElement = document.getElementById(`piece-${piece}`);
        
        if (checkbox && checkbox.checked) {
            if (pieceElement) pieceElement.classList.remove('disabled');
            for (const material in armorMaterials[piece]) {
                if (!totals[material]) {
                    totals[material] = 0;
                }
                totals[material] += armorMaterials[piece][material];
            }
        } else {
            if (pieceElement) pieceElement.classList.add('disabled');
        }
    }

    const totalsGrid = document.getElementById('armor-totals-grid');
    if (totalsGrid) {
        totalsGrid.innerHTML = '';
        
        for (const material in totals) {
            const totalItem = document.createElement('div');
            totalItem.className = 'armor-total-item';
            let displayValue;
            if (material === 'Adena') {
                displayValue = '10.5B';
            } else {
                displayValue = formatArmorNumber(totals[material]);
            }
            totalItem.innerHTML = `
                <div class="armor-total-item-name">${material}</div>
                <div class="armor-total-item-amount">${displayValue}</div>
            `;
            totalsGrid.appendChild(totalItem);
        }
    }
    
    updateArmorCosts();
}

function updateArmorCosts() {
    const totals = {};
    for (const piece in armorMaterials) {
        const checkbox = document.getElementById(piece);
        if (checkbox && checkbox.checked) {
            for (const material in armorMaterials[piece]) {
                if (!totals[material]) {
                    totals[material] = 0;
                }
                totals[material] += armorMaterials[piece][material];
            }
        }
    }

    const aetherAdenaPrice = parseArmorFormattedNumber(document.getElementById('aether-adena-price')?.value || '0');
    const aetherConquestPrice = parseArmorFormattedNumber(document.getElementById('aether-conquest-price')?.value || '0');
    const solarisAdenaPrice = parseArmorFormattedNumber(document.getElementById('solaris-adena-price')?.value || '0');
    const solarisConquestPrice = parseArmorFormattedNumber(document.getElementById('solaris-conquest-price')?.value || '0');

    const aetherCount = totals['Aether'] || 0;
    const solarisCount = totals['Solaris'] || 0;

    const aetherAdenaCost = aetherCount * aetherAdenaPrice;
    const aetherConquestCost = aetherCount * aetherConquestPrice;
    const solarisAdenaCost = solarisCount * solarisAdenaPrice;
    const solarisConquestCost = solarisCount * solarisConquestPrice;

    const totalAdenaCost = aetherAdenaCost + solarisAdenaCost;
    const totalConquestCost = aetherConquestCost + solarisConquestCost;

    const aetherAdenaCostEl = document.getElementById('aether-adena-cost');
    const solarisAdenaCostEl = document.getElementById('solaris-adena-cost');
    const totalAdenaCostEl = document.getElementById('total-adena-cost');
    const aetherConquestCostEl = document.getElementById('aether-conquest-cost');
    const solarisConquestCostEl = document.getElementById('solaris-conquest-cost');
    const totalConquestCostEl = document.getElementById('total-conquest-cost');

    if (aetherAdenaCostEl) aetherAdenaCostEl.textContent = formatArmorNumber(Math.round(aetherAdenaCost));
    if (solarisAdenaCostEl) solarisAdenaCostEl.textContent = formatArmorNumber(Math.round(solarisAdenaCost));
    if (totalAdenaCostEl) totalAdenaCostEl.textContent = formatArmorNumber(Math.round(totalAdenaCost));
    if (aetherConquestCostEl) aetherConquestCostEl.textContent = formatArmorNumber(Math.round(aetherConquestCost));
    if (solarisConquestCostEl) solarisConquestCostEl.textContent = formatArmorNumber(Math.round(solarisConquestCost));
    if (totalConquestCostEl) totalConquestCostEl.textContent = formatArmorNumber(Math.round(totalConquestCost));
}

function selectAllArmor() {
    const checkboxes = ['helmet', 'chest', 'gloves', 'boots', 'gaiters'];
    checkboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.checked = true;
    });
    updateArmorTotals();
}

function deselectAllArmor() {
    const checkboxes = ['helmet', 'chest', 'gloves', 'boots', 'gaiters'];
    checkboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.checked = false;
    });
    updateArmorTotals();
}
