document.addEventListener('DOMContentLoaded', function() {
    initCalculatorTabs();
    initNumericClamping();
    initFieldTooltips();
    initDamageForm();
    initHourlyForm();
});

// Tabs (WAI-ARIA tabs pattern: click, arrow keys, Home/End)
function initCalculatorTabs() {
    const tabs = Array.from(document.querySelectorAll('.tab-button'));

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => activateTab(tab));
        tab.addEventListener('keydown', (event) => {
            const lastIndex = tabs.length - 1;
            const keyTargets = {
                ArrowRight: index === lastIndex ? 0 : index + 1,
                ArrowLeft: index === 0 ? lastIndex : index - 1,
                Home: 0,
                End: lastIndex,
            };
            if (!(event.key in keyTargets)) {
                return;
            }
            event.preventDefault();
            const target = tabs[keyTargets[event.key]];
            activateTab(target);
            target.focus();
        });
    });
}

function activateTab(activeTab) {
    document.querySelectorAll('.tab-button').forEach((tab) => {
        const isActive = tab === activeTab;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        tab.tabIndex = isActive ? 0 : -1;
        const panel = document.getElementById(tab.dataset.tab);
        if (panel) {
            panel.classList.toggle('active', isActive);
        }
    });
}

function initNumericClamping() {
    document.querySelectorAll('input[type="number"]').forEach(input => {
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
}

function initFieldTooltips() {
    const tooltips = {
        'your-level': 'Your character\'s current level',
        'mob-level': 'The level of the monster you are fighting',
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
}

function initDamageForm() {
    const form = document.getElementById('damage-form');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            calculateDamagePenalty();
        });
    }
}

function initHourlyForm() {
    const form = document.getElementById('hourly-form');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            calculateHourlyRate();
        });
    }

    const amountInput = document.getElementById('hourly-amount');
    const hoursInput = document.getElementById('hourly-hours');
    const minutesInput = document.getElementById('hourly-minutes');

    if (amountInput) {
        amountInput.addEventListener('input', function() {
            formatNumber(this);
            scheduleHourlyAutoCalc();
        });
    }
    [hoursInput, minutesInput].forEach((input) => {
        if (input) {
            input.addEventListener('input', scheduleHourlyAutoCalc);
        }
    });
    if (minutesInput) {
        minutesInput.addEventListener('blur', function() {
            if (this.value > 59) {
                this.value = 59;
            }
        });
    }
}

let hourlyAutoCalcTimer = null;

function scheduleHourlyAutoCalc() {
    clearTimeout(hourlyAutoCalcTimer);
    hourlyAutoCalcTimer = setTimeout(() => {
        const amount = parseFormattedNumber(document.getElementById('hourly-amount').value);
        const hours = parseInt(document.getElementById('hourly-hours').value) || 0;
        const minutes = parseInt(document.getElementById('hourly-minutes').value) || 0;
        if ((hours > 0 || minutes > 0) && !isNaN(amount) && amount > 0) {
            calculateHourlyRate();
        }
    }, 500);
}

// Inline form errors (replace alert pop-ups)
function showFormError(errorId, message, inputIds) {
    const error = document.getElementById(errorId);
    if (error) {
        error.textContent = message;
        error.hidden = false;
    }
    inputIds.forEach((id) => {
        const input = document.getElementById(id);
        if (input) {
            input.setAttribute('aria-invalid', 'true');
        }
    });
}

function clearFormError(errorId, inputIds) {
    const error = document.getElementById(errorId);
    if (error) {
        error.textContent = '';
        error.hidden = true;
    }
    inputIds.forEach((id) => {
        const input = document.getElementById(id);
        if (input) {
            input.removeAttribute('aria-invalid');
        }
    });
}

// Damage Penalty Calculator
function calculateDamagePenalty() {
    const yourLevel = parseInt(document.getElementById('your-level').value) || 0;
    const mobLevel = parseInt(document.getElementById('mob-level').value) || 0;
    const levelInputs = ['your-level', 'mob-level'];

    if (yourLevel === 0 || mobLevel === 0) {
        showFormError('damage-error', 'Enter both levels, from 1 to 130.', levelInputs);
        return;
    }
    clearFormError('damage-error', levelInputs);

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
}

// Hourly Rate Calculator
function calculateHourlyRate() {
    const amount = parseFormattedNumber(document.getElementById('hourly-amount').value);
    const hours = parseInt(document.getElementById('hourly-hours').value) || 0;
    const minutes = parseInt(document.getElementById('hourly-minutes').value) || 0;

    if (isNaN(amount) || amount < 0) {
        showFormError('hourly-error', 'Enter the XP or Adena you gained, as a positive number.', ['hourly-amount']);
        return;
    }
    if (hours === 0 && minutes === 0) {
        showFormError('hourly-error', 'Enter a time longer than 0 minutes.', ['hourly-hours', 'hourly-minutes']);
        return;
    }
    clearFormError('hourly-error', ['hourly-amount', 'hourly-hours', 'hourly-minutes']);

    // Convert time to total hours
    const totalHours = hours + (minutes / 60);

    // Calculate hourly rate
    const hourlyRate = amount / totalHours;

    // Calculate amounts for 1 hour and 3 hours
    const oneHourAmount = hourlyRate * 1;
    const threeHoursAmount = hourlyRate * 3;

    document.getElementById('hourly-rate').textContent = formatCurrency(hourlyRate);
    document.getElementById('one-hour-amount').textContent = formatCurrency(oneHourAmount);
    document.getElementById('three-hours-amount').textContent = formatCurrency(threeHoursAmount);
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
    // Non-breaking space keeps the suffix letter on the same line as its number.
    const gap = '\u00A0';

    if (roundedAmount >= 1e12) {
        return 'T' + gap + formattedNumber;
    } else if (roundedAmount >= 1e9) {
        return 'B' + gap + formattedNumber;
    } else if (roundedAmount >= 1e6) {
        return 'M' + gap + formattedNumber;
    } else if (roundedAmount >= 1e3) {
        return 'K' + gap + formattedNumber;
    } else {
        return formattedNumber;
    }
}
