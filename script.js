// Navbar
const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.navbar__menu');

menu.addEventListener('click', function() {
    menu.classList.toggle('is-active');
    menuLinks.classList.toggle('active');
});

//live data

let selectedCurrency = 'gbp'; // Default currency
let currentDays = 1;


async function fetchBitcoinStats(days = 1, currency = 'gbp') {
  currentDays = days;

  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=${currency}&days=${days}`);
    const data = await response.json();

    const prices = data.prices;
    const volumes = data.total_volumes;

    if (!prices || !volumes || prices.length === 0 || volumes.length === 0) {
      console.error('Missing or empty price/volume data:', data);
      return;
    }

    const avgPrice = (prices.reduce((sum, p) => sum + p[1], 0) / prices.length);
    const priceChange = (((prices[prices.length - 1][1] - prices[0][1]) / prices[0][1]) * 100).toFixed(2);

    const avgVolume = (volumes.reduce((sum, v) => sum + v[1], 0) / volumes.length);
    const volumeChange = (((volumes[volumes.length - 1][1] - volumes[0][1]) / volumes[0][1]) * 100).toFixed(2);

    const symbol = currency === 'gbp' ? '£' : '$';

    document.getElementById('avg-price').textContent = `Avg Price: ${symbol}${avgPrice.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('price-change').textContent = `Price Change: ${priceChange}%`;

    document.getElementById('avg-volume').textContent = `Avg Volume: ${symbol}${avgVolume.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('volume-change').textContent = `Volume Change: ${volumeChange}%`;
  } catch (error) {
    console.error('Error fetching Bitcoin stats:', error);
  }
}

// Fetch Yesterdays Close & Volume (fixed)

async function fetchYesterdayStats(currency = 'gbp') {
  const response = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${getYesterdayDate()}&localization=false`);
  const data = await response.json();

    if (!data.market_data) {
    console.error('Missing market_data in yesterday stats:', data);
    return;
  }

  const closePrice = data.market_data.current_price[currency];
  const volume = data.market_data.total_volume[currency];
  const symbol = currency === 'gbp' ? '£' : '$';

  document.getElementById('yesterday-close-price').textContent = `Yesterday Close: ${symbol}${closePrice.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('yesterday-volume').textContent = `Yesterday Volume: ${symbol}${volume.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getYesterdayDate() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`; // format: dd-mm-yyyy
}


// Hook to buttons Time range

document.querySelectorAll('.stats-controls button').forEach(button => {
  button.addEventListener('click', () => {
    const range = button.dataset.range;
    let days = 1;
    if (range === '7d') days = 7;
    if (range === '28d') days = 28;
    if (range === '365d') days = 365;
    fetchBitcoinStats(days, selectedCurrency);
    setActiveButton('.stats-controls', button);
  });
});


// Hook to currency selector

document.querySelectorAll('.currency-controls button').forEach(button => {
  button.addEventListener('click', () => {
    selectedCurrency = button.dataset.currency;
    fetchBitcoinStats(currentDays, selectedCurrency);
    fetchYesterdayStats(selectedCurrency);
    setActiveButton('.currency-controls', button);
  });
});

//Current price & Volume

async function fetchLivePriceVolume(currency = 'gbp') {
  const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currency}&include_24hr_vol=true`);
  const data = await response.json();
  const symbol = currency === 'gbp' ? '£' : '$';

  const currentPrice = data.bitcoin[currency];
  const currentVolume = data.bitcoin[`${currency}_24h_vol`];

  document.getElementById('current-price').textContent = `Current Price: ${symbol}${currentPrice.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('current-volume').textContent = `Current Volume: ${symbol}${currentVolume.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Highlight Buttons when clicked

function setActiveButton(groupSelector, clickedButton) {
  document.querySelectorAll(`${groupSelector} button`).forEach(btn => {
    btn.classList.remove('active');
  });
  clickedButton.classList.add('active');
}
// Load default
fetchBitcoinStats(1, selectedCurrency);
fetchYesterdayStats(selectedCurrency);
fetchLivePriceVolume(selectedCurrency);

//Refresh live price & volume every 30secs

setInterval(() => {
  fetchLivePriceVolume(selectedCurrency);
}, 30000); // every 30 seconds

