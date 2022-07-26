
const search_button = document.querySelector("#search-button");
const search_field = document.querySelector("#input-container input[type='text']");
const company_name = document.querySelector("#company-container h1");
const company_symbol = document.querySelector("#company-container h2");
const period_change = document.querySelectorAll("#period-change button");
const no_match = document.querySelector("#input-container > p");
const chart = document.getElementById('stock-chart');
const company = document.getElementById('company-container');
const list = document.querySelector('#input-container ul');
let current_company;
let FINNHUB_KEY = 'c25qcgiad3iafjno3250';
let myChart;

// FINNHUB DOCS - https://finnhub.io/docs/api/

// chart.js tooltip custom positioner
Chart.Tooltip.positioners.custom = function(items) {
    const pos = Chart.Tooltip.positioners.average(items);

    // Happens when nothing is found
    if (pos === false) {
        return false;
    }

    const chart = this._chart;
    return {
        x: pos.x,
        y: chart.chartArea.top,
    };
}

// detect period change button click
period_change.forEach((button) => {
    button.addEventListener('click', 
        function(event) {
            // get the period
            const period = event.target.innerHTML;
            // get the new company stock price history
            stock_price_history(current_company,period);
    });
});

// detect search button click
search_button.addEventListener('click',
    function search_stocks() {
        // get the input query 
        const query = search_field.value.toLowerCase();
        // companies json file 
        //const URL = 'companies.json';
        const URL = 'https://stock-booster.s3.ap-south-1.amazonaws.com/companies.json';
        // use the fetch api to get the data
        fetch(URL)
        .then(function(response) {
            // the response received has a json method which is a promise 
            // return the promise
            console.log(response);
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
            // check if there are any matches
            if (matches.length === 0) {
                no_match.style.display = 'flex';
                list.style.display = 'none';
            }
            else if (matches.length > 0) {
                no_match.style.display = 'none';
                list.style.display = 'flex';
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
                            // set the current selected company
                            current_company = symbol;
                            // get the current stock price
                            stock_price(symbol);
                            // get stock price history
                            stock_price_history(symbol,'6M');
                            // set company-container display to flex
                            company.style.display = 'flex';
                            // set the company symbol
                            company_symbol.innerHTML = item.children[1].innerHTML;
                            // set the company name
                            company_name.innerHTML = item.children[0].innerHTML;
                            // scroll to company-container
                            company.scrollIntoView({behavior: 'smooth'});
                    });
                }
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
        // set the prices
        current.innerHTML = `${Number(price).toFixed(2)} USD`;
        if (change_price >= 0) {
            change.innerHTML = `+${change_price} (${change_price_percent}%) today`;
            change.style.color = 'green';
        }
        else if (change_price < 0) {
            change.innerHTML = `${change_price} (${Math.abs(change_price_percent)}%) today`;
            change.style.color = 'red';
        }
        prices[0].innerHTML = `Open: ${Number(open).toFixed(2)} USD`;
        prices[1].innerHTML = `High: ${Number(high).toFixed(2)} USD`;
        prices[2].innerHTML = `Low: ${Number(low).toFixed(2)} USD`;
        
    });
}

// function to get company stock price history
function stock_price_history(company,period) {
    // current timestamp in seconds
    const current = Math.floor(Date.now()/1000);
    // set the color of all buttons to gray
    period_change.forEach((button) => {
        button.style.color = 'gray';
    });
    // set how far back the user wants to see the stock price
    let from;
    switch (period) {
        case '1Y':
            from = current-31540000;
            period_change[3].style.color = 'blue';
            break;
        case '6M':
            from = current-15770000;
            period_change[2].style.color = 'blue';
            break;
        case '1M':
            from = current-2628000;
            period_change[1].style.color = 'blue';
            break;
        case '1W':
            from = current-777600;
            period_change[0].style.color = 'blue';
            break;
    }    
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
        // maximum stock prices
        const max_price = Math.max(...prices);
        // array of corresponding timestamps
        const price_timestamps = data['t'];
        // convert timestamps to dates
        const price_dates = price_timestamps.map(
            function convert(timestamp) {
                const date = new Date(timestamp*1000);
                const string = date_string(date);
                return string;
        });
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
                            maxTicksLimit: 8,
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
                        },
                        suggestedMax: max_price*1.1
                    },
                },
                plugins: {
                    tooltip: {
                        intersect: false,
                        mode: 'nearest',
                        axis: 'x',
                        position: 'custom',
                        callbacks: {
                            title: (item) => {
                                //console.log(item);
                                return `${item[0]['label']}`;
                            },
                            label: (item) => {
                                //console.log(item);
                                return `${Number(item.raw).toFixed(2)} USD`;
                            }
                        }
                    },
                    legend: {
                        display: false
                    }
                }
            },
            plugins: [{
                id: 'corsair',
                afterInit: (chart) => {
                  chart.corsair = {
                    x: 0,
                    y: 0
                  }
                },
                afterEvent: (chart, evt) => {
                  const {
                    chartArea: {
                      top,
                      bottom,
                      left,
                      right
                    }
                  } = chart;
                  const {
                    event: {
                      x,
                      y
                    }
                  } = evt;
                  if (x < left || x > right || y < top || y > bottom) {
                    chart.corsair = {
                      x,
                      y,
                      draw: false
                    }
                    chart.draw();
                    return;
                  }
            
                  chart.corsair = {
                    x,
                    y,
                    draw: true
                  }
            
                  chart.draw();
                },
                afterDatasetsDraw: (chart, _, opts) => {
                  const {
                    ctx,
                    chartArea: {
                      top,
                      bottom,
                      left,
                      right
                    }
                  } = chart;
                  const {
                    x,
                    y,
                    draw
                  } = chart.corsair;
            
                  if (!draw) {
                    return;
                  }
            
                  ctx.lineWidth = opts.width || 0;
                  ctx.setLineDash(opts.dash || []);
                  ctx.strokeStyle = opts.color || 'black'
            
                  ctx.save();
                  ctx.beginPath();
                  ctx.moveTo(x, bottom);
                  ctx.lineTo(x, top);
                //   ctx.moveTo(left, y);
                //   ctx.lineTo(right, y);
                  ctx.stroke();
                  ctx.restore();
                }
              }]
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

// convert date object to string 
function date_string(date) {
    // array of months
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    // function to get date ordinal
    const nth = function(d) {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
            case 1:  return "st";
            case 2:  return "nd";
            case 3:  return "rd";
            default: return "th";
        }
    };
    return `${date.getDate()}${nth(date.getDate())} ${months[date.getMonth()]} ${date.getFullYear()}`;
}
