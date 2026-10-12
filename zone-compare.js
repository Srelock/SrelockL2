// Hunting zone comparison: saves hourly rates per zone in localStorage.
(function() {
    const STORAGE_KEY = 'l2calc.zoneComparison.v1';
    const SORT_FIELDS = { xp: 'xpPerHour', adena: 'adenaPerHour' };
    const ZONES_BY_ID = new Map(HUNTING_ZONES.map((zone) => [zone.id, zone]));

    let latestRates = null;
    let sortKey = 'xp';

    document.addEventListener('DOMContentLoaded', () => {
        populateZoneSelect();
        bindEvents();
        renderComparison();
    });

    function populateZoneSelect() {
        const select = document.getElementById('hourly-zone');
        HUNTING_ZONES.forEach((zone) => {
            const option = document.createElement('option');
            option.value = String(zone.id);
            option.textContent = `${zone.name} (Lv. ${zone.level})`;
            select.appendChild(option);
        });
    }

    function bindEvents() {
        document.addEventListener('hourlyrate:calculated', (event) => {
            const isSameRun = latestRates !== null
                && latestRates.xpPerHour === event.detail.xpPerHour
                && latestRates.adenaPerHour === event.detail.adenaPerHour;
            latestRates = event.detail;
            if (!isSameRun) {
                updateSaveState();
            }
        });
        document.addEventListener('hourlyrate:cleared', () => {
            latestRates = null;
            updateSaveState();
        });
        document.getElementById('hourly-zone').addEventListener('change', updateSaveState);
        document.getElementById('zone-save').addEventListener('click', saveCurrentRun);
        document.getElementById('zone-compare-clear').addEventListener('click', clearAll);
        document.querySelectorAll('.sort-button').forEach((button) => {
            button.addEventListener('click', () => setSort(button.dataset.sort));
        });
        document.getElementById('zone-compare-body').addEventListener('click', (event) => {
            const button = event.target.closest('[data-remove-zone]');
            if (button) {
                removeEntry(Number(button.dataset.removeZone));
            }
        });
    }

    function selectedZone() {
        return ZONES_BY_ID.get(Number(document.getElementById('hourly-zone').value)) || null;
    }

    function setStatus(message) {
        document.getElementById('zone-save-status').textContent = message;
    }

    function updateSaveState() {
        const zone = selectedZone();
        document.getElementById('zone-save').disabled = !(zone && latestRates);
        if (!zone && !latestRates) {
            setStatus('Pick a hunting zone and calculate to save this run.');
        } else if (!zone) {
            setStatus('Pick a hunting zone to save this run.');
        } else if (!latestRates) {
            setStatus('Calculate a rate to save it for this zone.');
        } else {
            setStatus(`Ready to save for ${zone.name}.`);
        }
    }

    function loadEntries() {
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(parsed) ? parsed.filter((entry) => ZONES_BY_ID.has(entry.zoneId)) : [];
        } catch (error) {
            console.warn('Could not read saved zone comparison.', error);
            return [];
        }
    }

    function storeEntries(entries) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
            return true;
        } catch (error) {
            console.warn('Could not save zone comparison.', error);
            return false;
        }
    }

    function saveCurrentRun() {
        const zone = selectedZone();
        if (!zone || !latestRates) {
            return;
        }
        const savedEntries = loadEntries();
        const entries = savedEntries.filter((entry) => entry.zoneId !== zone.id);
        const isReplacing = entries.length < savedEntries.length;
        entries.push({
            zoneId: zone.id,
            xpPerHour: latestRates.xpPerHour,
            adenaPerHour: latestRates.adenaPerHour,
            savedAt: new Date().toISOString(),
        });
        if (!storeEntries(entries)) {
            setStatus('Could not save. Your browser is blocking local storage.');
            return;
        }
        setStatus(isReplacing ? `Updated ${zone.name}.` : `Saved ${zone.name}.`);
        renderComparison();
    }

    function removeEntry(zoneId) {
        storeEntries(loadEntries().filter((entry) => entry.zoneId !== zoneId));
        renderComparison();
    }

    function clearAll() {
        if (window.confirm('Remove all saved zones from the comparison?')) {
            storeEntries([]);
            renderComparison();
        }
    }

    function setSort(key) {
        sortKey = key;
        document.querySelectorAll('.sort-button').forEach((button) => {
            const isActive = button.dataset.sort === key;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
        renderComparison();
    }

    // Missing rates (null) sort last; ties fall back to the higher zone level.
    function sortEntries(entries) {
        const field = SORT_FIELDS[sortKey];
        return [...entries].sort((a, b) => {
            const aValue = a[field] ?? -1;
            const bValue = b[field] ?? -1;
            return bValue - aValue || ZONES_BY_ID.get(b.zoneId).level - ZONES_BY_ID.get(a.zoneId).level;
        });
    }

    function bestValue(entries, field) {
        const values = entries.map((entry) => entry[field]).filter((value) => value !== null);
        return values.length > 1 ? Math.max(...values) : null;
    }

    function renderComparison() {
        const entries = loadEntries();
        const hasEntries = entries.length > 0;
        document.getElementById('zone-compare-empty').hidden = hasEntries;
        document.getElementById('zone-compare-table').hidden = !hasEntries;
        document.getElementById('zone-compare-clear').hidden = !hasEntries;

        const bestXp = bestValue(entries, 'xpPerHour');
        const bestAdena = bestValue(entries, 'adenaPerHour');
        const body = document.getElementById('zone-compare-body');
        body.replaceChildren(...sortEntries(entries).map((entry) => buildRow(entry, bestXp, bestAdena)));
    }

    function buildRow(entry, bestXp, bestAdena) {
        const zone = ZONES_BY_ID.get(entry.zoneId);
        const row = document.createElement('tr');
        row.append(
            buildCell('Zone', zone.name, 'th'),
            buildCell('Level', String(zone.level)),
            buildRateCell('XP per hour', entry.xpPerHour, bestXp),
            buildRateCell('Adena per hour', entry.adenaPerHour, bestAdena),
            buildRemoveCell(zone),
        );
        return row;
    }

    function buildCell(label, text, tag = 'td') {
        const cell = document.createElement(tag);
        if (tag === 'th') {
            cell.scope = 'row';
        }
        cell.dataset.label = label;
        cell.textContent = text;
        return cell;
    }

    function buildRateCell(label, value, best) {
        const cell = buildCell(label, value === null ? '—' : formatCurrency(value));
        if (best !== null && value === best) {
            cell.classList.add('is-best');
            const note = document.createElement('span');
            note.className = 'visually-hidden';
            note.textContent = ' (best)';
            cell.appendChild(note);
        }
        return cell;
    }

    function buildRemoveCell(zone) {
        const cell = document.createElement('td');
        cell.className = 'compare-actions';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn-tertiary';
        button.dataset.removeZone = String(zone.id);
        button.textContent = 'Remove';
        button.setAttribute('aria-label', `Remove ${zone.name}`);
        cell.appendChild(button);
        return cell;
    }
})();
