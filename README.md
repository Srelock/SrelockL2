# Lineage 2 Calculator - Standalone Version

A standalone calculator for Lineage 2 game mechanics, including damage penalty calculations, experience calculations, and character stats.

## Features

- **Damage Penalty Calculator**: Calculate damage reduction when fighting higher-level monsters
- **Adena Calculator**: Calculate adena trading costs, profits, and coin conversion rates
- **Hourly Rate Calculator**: Calculate hourly rates for XP or Adena farming

## Files

- `index.html` - Main HTML file
- `styles.css` - CSS styles for the calculator
- `script.js` - JavaScript functionality
- `hunting-zones.js` - Hunting zone names and levels
- `zone-compare.js` - Zone comparison (save, sort, remove)

## Usage

1. Open `index.html` in your web browser
2. Choose the calculator you want to use from the tabs
3. Enter the required values
4. Click "Calculate" to see the results

## Damage Penalty Calculator

The damage penalty calculator uses the exact formula from Lineage 2:
- **Formula**: `1.035 × (1.25^levelDifference)`
- **Level Difference**: `Mob Level - Your Level - 1`
- **Damage Reduction**: Calculated as a percentage

## Adena Calculator

Calculates adena trading costs, profits, and coin conversion rates:
- **Adena Trading**: Calculate buy/sell costs and profit/loss
- **Coin Conversion**: Calculate adena needed for coins and associated costs
- **Price Analysis**: Compare different adena prices and coin rates

## Hourly Rate Calculator

Calculates hourly rates for XP and Adena farming:
- **Input**: XP gained, Adena gained (either or both), and time spent
- **Output**: XP per hour and Adena per hour, each with a 3-hour projection
- **Auto-calculation**: Real-time updates as you type
- **Number formatting**: Automatic comma formatting for large numbers

### Zone comparison

Pick one of the 36 teleport hunting zones above level 105 (listed in `hunting-zones.js`; party hunting zones are marked with `*`), calculate a run, and click **Save to comparison**. Saved zones appear in a table that can be sorted by XP per hour or Adena per hour, with the best rate in each column highlighted. Results are stored in the browser's localStorage only; saving the same zone again replaces its earlier result.

## Setup

Simply open `index.html` in any modern web browser. No server setup required.

## Browser Compatibility

Works in all modern browsers:
- Chrome
- Firefox
- Safari
- Edge
