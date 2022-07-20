
const search_button = document.querySelector("#input-container input[type='submit']");
const search_field = document.querySelector("#input-container input[type='text']");
const chart = document.getElementById('stock-chart');
let API_KEY;
let myChart;

// CHARTIST.JS - http://gionkunz.github.io/chartist-js/examples.html#simple-line-chart

// get the alpha vantage api key
fetch('API_KEY.txt')
    .then(function(response) {
        // the response received has a text method which is a promise 
        // return the promise
        return response.text();
    })
    .then(function(data) {
        // get the data from the text file
        API_KEY = data;
    });

// detect search button click
search_button.addEventListener('click',
    function search_stocks() {
        // get the company symbol 
        const symbol = search_field.value;
        // get the current stock price
        stock_price(symbol);
        // get stock price history
        stock_price_history(symbol);
});

// function to get current stock price of a company
function stock_price(company) {
    // web api url
    const URL = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${company}&apikey=${API_KEY}`;
    // use the fetch api to get the data
    fetch(URL)
    .then(function(response) {
        // the response received has a json method which is a promise 
        // return the promise
        return response.json();
    })
    .then(function(data) {
        // get the data from web api
        const stock_price = data['Global Quote'];
        console.log(stock_price);
        // get the stock prices
        const open = stock_price['02. open'];
        const high = stock_price['03. high'];
        const low = stock_price['04. low'];
        const price = stock_price['05. price'];
        const change_price = Number(stock_price['09. change']).toFixed(2);
        const change_price_percent = stock_price['10. change percent'];
        // select the html elements
        const current = document.querySelector('#current');
        const change = document.querySelector('#change');
        const prices = document.querySelectorAll('#stock-price p');
        // // set the prices
        current.innerHTML = `${Number(price).toFixed(2)}`;
        if (change_price >= 0) {
            change.innerHTML = `+${change_price} (${change_price_percent}) today`;
            change.style.color = 'green';
        }
        else if (change_price < 0) {
            change.innerHTML = `-${change_price} (${change_price_percent}) today`;
            change.style.color = 'red';
        }
        prices[0].innerHTML = `Open : ${Number(open).toFixed(2)}`;
        prices[1].innerHTML = `High : ${Number(high).toFixed(2)}`;
        prices[2].innerHTML = `Low : ${Number(low).toFixed(2)}`;
        
    });
}

// function to get company stock price history
function stock_price_history(company) {
    // web api url
    const URL = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${company}&outputsize=full&apikey=${API_KEY}`;
    // use the fetch api to get the data
    fetch(URL)
    .then(function(response) {
        // the response received has a json method which is a promise 
        // return the promise
        return response.json();
    })
    .then(function(data) {
        // get the data from web api
        console.log(data);
        // stock price history
        const history = data['Time Series (Daily)'];
        console.log(history);
        // get date strings
        const dates = date_strings(180);
        // array of stock prices
        const prices = [];
        const price_dates = [];
        for (let date of dates) {
            if (date in history) {
                // get the stock price
                const price = history[date]['4. close'];
                prices.push(price);
                price_dates.push(date);
            }
        }
        console.log(prices);
        // plot the line chart
        // line chart dataset
        const dataset = {
            labels: price_dates,
            datasets: [{
                label: 'Stock Price',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: prices,
                pointRadius: 0,
            }]
        };
        // line chart configuration
        const config = {
            type: 'line',
            data: dataset,
            options: {
                maintainAspectRatio: false,
                responsive: true,
                scales: {
                    x: {
                        grid: {
                            display:false
                        },
                        ticks: {
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        ticks: {
                            maxTicksLimit: 6
                        }
                    },
                }
            }
        };
        // destroy the chart
        if (myChart != undefined) {
            myChart.destroy();
        }
        // create the new line chart
        myChart = new Chart(
            document.getElementById('myChart'),
            config
        );
    });
}

// function to generate date strings
function date_strings(days) {
    // current timestamp
    let timestamp = Date.now();
    // milliseconds in a day
    const ms_day = 86400000;
    // array of date strings
    const dates = [];
    while (days > 0) {
        // get the date from timestamp
        const date = new Date(timestamp).toISOString();
        // get the date string
        const date_string = date.split('T')[0];
        dates.push(date_string);
        timestamp = timestamp-ms_day;
        days--;
    }
    return dates.reverse();
}
