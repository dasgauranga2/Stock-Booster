
const search_button = document.querySelector("#search-button");
const search_field = document.querySelector("#input-container input[type='text']");
const chart = document.getElementById('stock-chart');
const company = document.getElementById('company-container');
const list = document.querySelector('#input-container ul');
let API_KEY;
let FINNHUB_KEY = 'c25qcgiad3iafjno3250';
let myChart;

// ALPHA VANTAGE DOCS - https://www.alphavantage.co/documentation/
// FINNHUB DOCS - https://finnhub.io/docs/api/

// get the alpha vantage api key
fetch('API_KEY.txt')
    .then(function(response) {
        // the response received has a text method which is a promise 
        // return the promise
        return response.text();
    })
    .then(function(data) {
        // get the data from the text file
        const API_KEYS = data.split('\n');
        API_KEY = API_KEYS[0];
        FINNHUB_KEY = API_KEYS[1];
    });

// detect search button click
search_button.addEventListener('click',
    function search_stocks() {
        // get the input query 
        const query = search_field.value.toLowerCase();
        // companies json file 
        const URL = 'companies.json';
        // use the fetch api to get the data
        fetch(URL)
        .then(function(response) {
            // the response received has a json method which is a promise 
            // return the promise
            return response.json();
        })
        .then(function(data) {
            // array to contain company matches
            const matches = [];
            // iterate through each company
            for (let company of data) {
                // check if company matches query entered by the user
                if (company['description'].toLowerCase().includes(query) || company['displaySymbol'].toLowerCase().includes(query)) {
                    matches.push(company);
                }
            }
            console.log(matches);
            // remove all existing children of the element
            list.innerHTML = '';
            for(let match of matches) {
                // each company's details
                const symbol = match['displaySymbol'];
                const name = match['description'];
                const country = 'USA';
                // create a new html element
                const item = document.createElement('li');
                // set the inner html of the element
                item.innerHTML = `<p>${name}</p><p>${symbol}</p><p>${country}</p>`;
                // add the item to the list
                list.append(item);
            }
            // add event listener to each list item
            for (let item of list.children) {
                item.addEventListener('click', 
                    function(event) {
                        // get company symbol
                        const symbol = item.children[1].innerHTML;
                        // get the current stock price
                        stock_price(symbol);
                        // get stock price history
                        stock_price_history(symbol);
                        // set company-container display to flex
                        company.style.display = 'flex';
                        // scroll to company-container
                        company.scrollIntoView({behavior: 'smooth'});
                });
            }
        });
});

// function to get current stock price of a company
function stock_price(company) {
    // web api url
    const URL = `https://finnhub.io/api/v1/quote?symbol=${company}&token=${FINNHUB_KEY}`;
    // use the fetch api to get the data
    fetch(URL)
    .then(function(response) {
        // the response received has a json method which is a promise 
        // return the promise
        return response.json();
    })
    .then(function(data) {
        // get the data from web api
        const stock_price = data;
        // get the stock prices
        const open = stock_price['o'];
        const high = stock_price['h'];
        const low = stock_price['l'];
        const price = stock_price['c'];
        const change_price = Number(stock_price['d']).toFixed(2);
        const change_price_percent = Number(stock_price['dp']).toFixed(2);
        // select the html elements
        const current = document.querySelector('#current');
        const change = document.querySelector('#change');
        const prices = document.querySelectorAll('#stock-price p');
        // // set the prices
        current.innerHTML = `${Number(price).toFixed(2)} USD`;
        if (change_price >= 0) {
            change.innerHTML = `+${change_price} (${change_price_percent}%) today`;
            change.style.color = 'green';
        }
        else if (change_price < 0) {
            change.innerHTML = `${change_price} (${change_price_percent}%) today`;
            change.style.color = 'red';
        }
        prices[0].innerHTML = `Open : ${Number(open).toFixed(2)}`;
        prices[1].innerHTML = `High : ${Number(high).toFixed(2)}`;
        prices[2].innerHTML = `Low : ${Number(low).toFixed(2)}`;
        
    });
}

// function to get company stock price history
function stock_price_history(company) {
    // current timestamp in seconds
    const current = Math.floor(Date.now()/1000);
    // six months ago timestamp in seconds
    const from = current-15770000;
    // web api url
    const URL = `https://finnhub.io/api/v1/stock/candle?symbol=${company}&resolution=D&from=${from}&to=${current}&token=${FINNHUB_KEY}`;
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
        // array of stock prices
        const prices = data['c'];
        // array of corresponding dates
        const price_dates = data['t'];
        
        // plot the line chart
        // get the chart
        const ctx = document.getElementById('myChart').getContext('2d');
        // background color gradient
        let gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(10,180,10,0.6)');
        gradient.addColorStop(1, 'rgba(250,250,250,0.6)');
        // line chart dataset
        const dataset = {
            labels: price_dates,
            datasets: [{
                label: 'Stock Price',
                backgroundColor: gradient,
                borderColor: 'rgb(10,180,10)',
                data: prices,
                pointRadius: 0,
                borderWidth: 2,
                fill:true
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
                            display:false,
                            borderWidth: 1,
                            borderColor: "rgb(40,40,40)"
                        },
                        ticks: {
                            maxTicksLimit: 10,
                            // font: {
                            //     size: 18
                            // }
                        }
                    },
                    y: {
                        grid: {
                            // display:false,
                            lineWidth: 1,
                            color: "rgb(220,220,220)",
                            drawBorder: false
                        },
                        ticks: {
                            maxTicksLimit: 6,
                            // font: {
                            //     size: 18
                            // }
                        }
                    },
                },
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

// // function to generate date strings
// function date_strings(days) {
//     // current timestamp
//     let timestamp = Date.now();
//     // milliseconds in a day
//     const ms_day = 86400000;
//     // array of date strings
//     const dates = [];
//     while (days > 0) {
//         // get the date from timestamp
//         const date = new Date(timestamp).toISOString();
//         // get the date string
//         const date_string = date.split('T')[0];
//         dates.push(date_string);
//         timestamp = timestamp-ms_day;
//         days--;
//     }
//     return dates.reverse();
// }
