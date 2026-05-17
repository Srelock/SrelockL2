const ARMOR_PIECE_ORDER = ['helmet', 'chest', 'gaiters', 'gloves', 'boots'];

const ARMOR_MATERIAL_ICONS = {
    'Crystal of Protection': 'crystal',
    Aether: 'aether',
    Solaris: 'solaris',
    Jewel: 'jewel',
    Adena: 'adena',
};

const ARMOR_SLOT_MATERIALS = {
    helmet: {
        'Crystal of Protection': 3710,
        Aether: 76500,
        Solaris: 520,
        Jewel: 2080,
        Adena: 1511640000,
    },
    chest: {
        'Crystal of Protection': 9892,
        Aether: 204000,
        Solaris: 1387,
        Jewel: 5548,
        Adena: 4032009000,
    },
    gaiters: {
        'Crystal of Protection': 6183,
        Aether: 127500,
        Solaris: 867,
        Jewel: 3468,
        Adena: 2520369000,
    },
    gloves: {
        'Crystal of Protection': 2473,
        Aether: 51000,
        Solaris: 348,
        Jewel: 1392,
        Adena: 1011636000,
    },
    boots: {
        'Crystal of Protection': 2473,
        Aether: 51000,
        Solaris: 348,
        Jewel: 1392,
        Adena: 1011636000,
    },
};

const ARMOR_TYPES = {
    heavy: {
        label: 'Heavy Armor',
        pieces: {
            helmet: 'Helmet',
            chest: 'Breastplate',
            gaiters: 'Gaiters',
            gloves: 'Gauntlets',
            boots: 'Boots',
        },
    },
    light: {
        label: 'Light Armor',
        pieces: {
            helmet: 'Leather Helmet',
            chest: 'Leather Armor',
            gaiters: 'Leather Leggings',
            gloves: 'Leather Gloves',
            boots: 'Leather Boots',
        },
    },
    robe: {
        label: 'Robe Armor',
        pieces: {
            helmet: 'Circlet',
            chest: 'Tunic',
            gaiters: 'Stockings',
            gloves: 'Gloves',
            boots: 'Shoes',
        },
        materials: {
            helmet: {
                'Crystal of Protection': 3710,
                Aether: 76500,
                Solaris: 520,
                Jewel: 2080,
                Adena: 1510000000,
            },
        },
    },
};

let currentArmorType = 'heavy';

function getArmorMaterialsForType(type) {
    const overrides = ARMOR_TYPES[type].materials || {};
    const materials = {};
    for (const piece of ARMOR_PIECE_ORDER) {
        materials[piece] = { ...(overrides[piece] || ARMOR_SLOT_MATERIALS[piece]) };
    }
    return materials;
}

function formatArmorNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatArmorLargeNumber(num) {
    if (num >= 1000000000) {
        const billions = num / 1000000000;
        const formatted = billions >= 10
            ? billions.toFixed(1)
            : billions.toFixed(2).replace(/0$/, '');
        return `${formatted}B`;
    }
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    return formatArmorNumber(num);
}

function formatArmorMaterialAmount(material, amount) {
    return material === 'Adena' ? formatArmorLargeNumber(amount) : formatArmorNumber(amount);
}

function armorMaterialRowHtml(name, amount) {
    const iconClass = ARMOR_MATERIAL_ICONS[name] || 'jewel';
    return [
        `<div class="armor-material-item" data-mat="${name}">`,
        `<div class="armor-mat-icon armor-mat-icon--${iconClass}" aria-hidden="true"></div>`,
        `<span class="armor-material-name">${name}</span>`,
        `<span class="armor-material-amount">×${formatArmorMaterialAmount(name, amount)}</span>`,
        '</div>',
    ].join('');
}

function renderArmorPieceSelector() {
    const selector = document.getElementById('armor-piece-selector');
    if (!selector) {
        return;
    }
    const typeConfig = ARMOR_TYPES[currentArmorType];
    selector.innerHTML = ARMOR_PIECE_ORDER.map((piece) => {
        const checkbox = document.getElementById(`armor-cb-${piece}`);
        const checked = checkbox ? checkbox.checked : true;
        return `
            <label class="armor-piece-checkbox">
                <input type="checkbox" id="armor-cb-${piece}" ${checked ? 'checked' : ''}>
                <span>${typeConfig.pieces[piece]}</span>
            </label>
        `;
    }).join('');

    selector.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        cb.addEventListener('change', updateArmorTotals);
    });
}

function renderArmorGrid() {
    const grid = document.getElementById('armor-grid');
    if (!grid) {
        return;
    }
    const materials = getArmorMaterialsForType(currentArmorType);
    const typeConfig = ARMOR_TYPES[currentArmorType];

    grid.innerHTML = ARMOR_PIECE_ORDER.map((piece) => {
        const pieceMaterials = materials[piece];
        const rows = Object.entries(pieceMaterials)
            .map(([name, amount]) => armorMaterialRowHtml(name, amount))
            .join('');

        return `
            <article class="armor-piece-card" id="armor-piece-${piece}">
                <h3 class="armor-piece-title">${typeConfig.pieces[piece]}</h3>
                <div class="armor-materials-list">${rows}</div>
            </article>
        `;
    }).join('');
}

function switchArmorType(type) {
    if (!ARMOR_TYPES[type]) {
        return;
    }
    currentArmorType = type;
    const root = document.getElementById('armor');
    if (root) {
        root.dataset.armor = type;
    }

    document.querySelectorAll('.armor-type-tab').forEach((tab) => {
        const isActive = tab.dataset.type === type;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    renderArmorPieceSelector();
    renderArmorGrid();
    updateArmorTotals();
}

function updateArmorTotals() {
    const materials = getArmorMaterialsForType(currentArmorType);
    const totals = {};

    for (const piece of ARMOR_PIECE_ORDER) {
        const checkbox = document.getElementById(`armor-cb-${piece}`);
        const pieceElement = document.getElementById(`armor-piece-${piece}`);

        if (!checkbox || !pieceElement) {
            continue;
        }

        if (checkbox.checked) {
            pieceElement.classList.remove('disabled');
            for (const [material, amount] of Object.entries(materials[piece])) {
                totals[material] = (totals[material] || 0) + amount;
            }
        } else {
            pieceElement.classList.add('disabled');
        }
    }

    const totalsGrid = document.getElementById('armor-totals-grid');
    if (!totalsGrid) {
        return;
    }

    totalsGrid.innerHTML = Object.entries(totals)
        .map(([material, amount]) => {
            const displayValue = material === 'Adena'
                ? formatArmorLargeNumber(amount)
                : formatArmorNumber(amount);
            return `
                <div class="armor-total-item" data-mat="${material}">
                    <div class="armor-total-item-name">${material}</div>
                    <div class="armor-total-item-amount">×${displayValue}</div>
                </div>
            `;
        })
        .join('');

    updateArmorCosts();
}

function selectAllArmorPieces() {
    document.querySelectorAll('#armor-piece-selector input[type="checkbox"]').forEach((cb) => {
        cb.checked = true;
    });
    updateArmorTotals();
}

function deselectAllArmorPieces() {
    document.querySelectorAll('#armor-piece-selector input[type="checkbox"]').forEach((cb) => {
        cb.checked = false;
    });
    updateArmorTotals();
}

function formatArmorPriceInput(input) {
    const cursorPosition = input.selectionStart;
    const oldValue = input.value;
    const numericValue = oldValue.replace(/[^\d]/g, '');

    if (numericValue) {
        const formatted = parseInt(numericValue, 10).toLocaleString('en-US');
        input.value = formatted;

        const commasBefore = (oldValue.substring(0, cursorPosition).match(/,/g) || []).length;
        const commasAfter = (formatted.substring(0, cursorPosition).match(/,/g) || []).length;
        const newPosition = cursorPosition + (commasAfter - commasBefore);
        input.setSelectionRange(newPosition, newPosition);
    }

    updateArmorCosts();
}

function updateArmorCosts() {
    const materials = getArmorMaterialsForType(currentArmorType);
    const totals = {};

    for (const piece of ARMOR_PIECE_ORDER) {
        const checkbox = document.getElementById(`armor-cb-${piece}`);
        if (checkbox && checkbox.checked) {
            for (const [material, amount] of Object.entries(materials[piece])) {
                totals[material] = (totals[material] || 0) + amount;
            }
        }
    }

    const aetherAdenaEl = document.getElementById('armor-aether-adena');
    if (!aetherAdenaEl) {
        return;
    }

    const aetherAdenaPrice = parseFormattedNumber(aetherAdenaEl.value);
    const aetherConquestPrice = parseFormattedNumber(
        document.getElementById('armor-aether-conquest').value,
    );
    const solarisAdenaPrice = parseFormattedNumber(
        document.getElementById('armor-solaris-adena').value,
    );
    const solarisConquestPrice = parseFormattedNumber(
        document.getElementById('armor-solaris-conquest').value,
    );

    const aetherCount = totals.Aether || 0;
    const solarisCount = totals.Solaris || 0;

    const aetherAdenaCost = aetherCount * aetherAdenaPrice;
    const aetherConquestCost = aetherCount * aetherConquestPrice;
    const solarisAdenaCost = solarisCount * solarisAdenaPrice;
    const solarisConquestCost = solarisCount * solarisConquestPrice;

    document.getElementById('armor-aether-adena-cost').textContent = formatArmorNumber(
        Math.round(aetherAdenaCost),
    );
    document.getElementById('armor-solaris-adena-cost').textContent = formatArmorNumber(
        Math.round(solarisAdenaCost),
    );
    document.getElementById('armor-total-adena-cost').textContent = formatArmorNumber(
        Math.round(aetherAdenaCost + solarisAdenaCost),
    );

    document.getElementById('armor-aether-conquest-cost').textContent = formatArmorNumber(
        Math.round(aetherConquestCost),
    );
    document.getElementById('armor-solaris-conquest-cost').textContent = formatArmorNumber(
        Math.round(solarisConquestCost),
    );
    document.getElementById('armor-total-conquest-cost').textContent = formatArmorNumber(
        Math.round(aetherConquestCost + solarisConquestCost),
    );
}

function initArmorCalculator() {
    if (!document.getElementById('armor')) {
        return;
    }

    document.querySelectorAll('.armor-type-tab').forEach((tab) => {
        tab.addEventListener('click', () => switchArmorType(tab.dataset.type));
    });

    ['armor-aether-adena', 'armor-aether-conquest', 'armor-solaris-adena', 'armor-solaris-conquest'].forEach((id) => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => formatArmorPriceInput(input));
        }
    });

    switchArmorType('heavy');
}

document.addEventListener('DOMContentLoaded', initArmorCalculator);
