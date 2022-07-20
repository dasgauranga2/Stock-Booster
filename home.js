
const search_button = document.querySelector("#input-container input[type='submit']");
const search_field = document.querySelector("#input-container input[type='text']");
let API_KEY;

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