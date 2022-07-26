
const news = document.getElementById('news-container');
let API_KEY;
let current_company;
let ALPHAVANTAGE_KEYS = ['c25qcgiad3iafjno3250','WGTQSM1LASX0N5KS'];
let key_index = 0;

// FINNHUB DOCS - https://finnhub.io/docs/api/

// function to get the alpha vantage key
function get_key() {
    const rand_num = Math.random();
    if (rand_num <= 0.5) {
        console.log("FIRST");
        return ALPHAVANTAGE_KEYS[0];
    }
    else if (rand_num > 0.5) {
        console.log("SECOND");
        return ALPHAVANTAGE_KEYS[1];
    } 
}

// web api url
const URL = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=technology&limit=20&apikey=${get_key()}`;
// use the fetch api to get the data
fetch(URL)
.then(function(response) {
    // the response received has a json method which is a promise 
    // return the promise
    return response.json();
})
.then(function(data) {
    // array to contain news articles
    const articles = data['feed'];
    console.log(articles);
    
    for(let article of articles) {
        // each article's details
        const title = article['title'];
        const date = article['time_published'];
        const image = article['banner_image'];
        const summary = article['summary'];
        const link = article['url'];
        // check if the details are correct
        if (image === "") {
            continue;
        }
        // create a new html element
        const item = document.createElement('a');
        // set the href attribute
        item.setAttribute('href', link);
        // set the inner html of the element
        item.innerHTML = `
        <img src=${image}>
        <div class="article-info">
            <h2>${title}</h2>
            <p>${summary}</p>
        </div>`;
        // set the class name
        item.className = 'article-container';
        // add the item to the news-container
        news.append(item);
    }
});
