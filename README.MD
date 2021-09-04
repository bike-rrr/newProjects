INSTALL PACKAGE.JSON -> npm init -y
INSTALL AXIOS ->  npm i axios
Install nodemon ->  npm i -D nodemon -> npx nodemon index.js

bring in axios library -> const axios = require('axios')


get class of table
 -> get the caption that has the text and select the parent element
    $('caption:contains("States of the United States of America")')[0].parentElement
    
function remove() {
    document.querySelector(".foot").style.visibility = "hidden"
document.querySelector("#nav-container").style.visibility = "hidden"
document.querySelector(".blog-foot").style.visibility = "hidden"
document.querySelector("#header").style.visibility = "hidden"
document.querySelector("#login").style.visibility = "hidden"
}


1. gather data in getArticles.js
 -> export that data
2. bring in getArticles.js in our index.js so we can request the info
3. use apps.js to get acces to the data
4. link our html page to app.js


// compare dates for vital, so its not on top always
// add each vital article indiviually to the articlea array

loop thorugh each vital article
    -> get index where vital aritlce belongs comaring its date 
        -> spice articles array at articles index  articles.splice(index, 0, object)

// function formatDate(date) {
        //     var d = new Date(date),
        //         month = '' + (d.getMonth() + 1),
        //         day = '' + d.getDate(),
        //         year = d.getFullYear();

        //     if (month.length < 2)
        //         month = '0' + month;
        //     if (day.length < 2)
        //         day = '0' + day;

        //     return [year, month, day].join('-');
        // }



 vital_Articles.forEach((item, index) => {
            // vital articles alreay in "Oct/xx/2020" format
            const date1 = new Date(item.date);

            for (let i = 0; i < articles.length - 1; i++) {
                let articleIndex = 0;
                let date2;
                const article = articles[i];
                if (article.date === "Today") {
                    date2 = new Date()
                }
                else {
                    date2 = new Date(article.date)
                }
                if (sameDay(date1, date2)) {
                    console.log("same day", date1, date2, item.title, article.title, i)
                    articleIndex = i;
                    console.log(articleIndex)
                    combinedArticles.splice(5, 0, article)
                    combinedArticles.forEach(item => {
                        console.log(item.title)
                    })
                    break;
                }
            }
        })

        ________________________________________________________________________________________________
       working with all vitals on top


       const cheerio = require('cheerio')
const axios = require('axios')

// make most recent vital mtb article show on top

const pb_url = 'https://www.pinkbike.com/';
const vital_url = 'https://www.vitalmtb.com/';


async function pb2() {
    let articles = [];
    let combinedArticles = [];

    await axios.get(pb_url).then(resp => {
        const $ = cheerio.load(resp.data);

        $('.news-style1').each((i, element) => {

            // get title and link and change to mobile version
            let link = $(element).find('a.f22').attr('href');
            const regex = /www/;
            link = link.replace(regex, 'm')
            const title = $(element).find('a.f22').text().trim();

            // get number of comments
            const comments = $(element).find('div.floatleft').text();
            const re = /\d*\s*Comments/;
            const comment = re.exec(comments);
            const re2 = /\d*/;
            let commentNumber = re2.exec(comment);
            if (commentNumber[0] == "") {
                commentNumber = 0;
            }

            // used for tag queries
            const img = $(element).find('img.floatleft').attr('src');
            const tag = $(element).find('div.floatleft div a.pb-tag').text();

            // get tags for dh racing
            const reDH = /DH Racing|Dh/
            const dhMatch = reDH.exec(tag)
            let dh = false;
            if (dhMatch ? dh = true : dh = false);

            // get tags for enduro 
            reEnduro = /enduro bikes/i
            const enduroCheck = reEnduro.exec(tag)
            let enduro = false;
            if (enduroCheck) { enduro = true };

            // get bike manufactures list
            const reBike = /rocky mountain|norco|santa cruz|evil|guerilla gravity|trasition|specialized|trek/i
            const bikeMatch = reBike.exec(tag);
            let bikeCompany = false;
            if (bikeMatch) { bikeCompany = true; }

            // check if it a contest
            const reContest = /contest[s?] and deal[s?]/i;
            const contestMatch = reContest.exec(tag);
            let contest = false;
            if (contestMatch) { contest = true; }

            // check its it today or not
            let today = false;
            const date = $(element).find('span.highlight').text().toLowerCase();
            if (date === "today") { today = true }

            // check if its a podcast
            const rePodcast = /podcast/i;
            const podcastMatch = rePodcast.exec(tag);
            let podcast = false;
            if (podcastMatch) { podcast = true };

            // get date
            const articleDate = $(element).find('.fgrey2').text();

            // make object
            const article = {
                title: title,
                commentNumber: parseInt(commentNumber[0]),
                link: link,
                img: img,
                dh: dh,
                enduro: enduro,
                bikeCompany: bikeCompany,
                contest: contest,
                today: today,
                podcast: podcast,
                date: articleDate.trim()
            }
            // console.log(article.link)
            // push articles
            if ((article.commentNumber > 200 || article.dh === true ||
                article.enduro === true || bikeCompany === true) &&
                (article.contest === false && article.podcast === false)) {

                articles.push(article);
            }

            // articles.sort(function (a, b) { return b.commentNumber - a.commentNumber });
        })
    })

    // do vital mtb
    await axios.get(vital_url).then(resp => {
        let vital_Articles = [];
        const $ = cheerio.load(resp.data)

        $('.sp-b-item').each((i, element) => {

            // get title and link
            const title = $(element).find('a.title').text();
            const link = $(element).find('.title').attr('href');

            // find raw videos  
            const reRaw = /vital raw/i;
            const match = reRaw.exec(title);

            // wasnt able to select image

            // make object if raw video found
            let article = {}
            if (match) {
                // get date -> ads had the sb-item-class, which has no date to get, so we do here, instead of outside the 'if match'

                const articleDate = $(element).find('span.timestamp').text();
                const reDate = /\d+\/\d+\/\d+/
                const dateMatch = reDate.exec(articleDate)
                // console.log(dateMatch[0])

                article = {
                    title: title,
                    link: link,
                    date: dateMatch[0]
                }
                // push article to vitals array
                vital_Articles.push(article)
            }
            // if (match) { vital_Articles.push(article) }
            // articles.splice(4, 0, article)
        })
        // combine pb + vital
        combinedArticles = vital_Articles.concat(articles)

        // sort vital raws into correct spot by date

        function sameDay(day1, day2) {
            return day1.getFullYear() === day2.getFullYear() && day1.getMonth() === day2.getMonth() && day1.getDate() === day2.getDate();
        }

        function getIndex(vital_date) {
            // vital articles alreay in "Oct/xx/2020" format
            const date1 = new Date(vital_date.date);

            for (let i = 0; i < articles.length - 1; i++) {
                let articleIndex = 0;
                let date2;
                const article = articles[i];
                if (article.date === "Today") {
                    date2 = new Date()
                }
                else {
                    date2 = new Date(article.date)
                }
                if (sameDay(date1, date2)) {
                    console.log("same day", date1, date2, item.title, article.title, i)
                    articleIndex = i;
                    console.log(articleIndex)
                    combinedArticles.splice(5, 0, article)
                    combinedArticles.forEach(item => {
                        console.log(item.title)
                    })
                    break;
                }
            }
        }
    })

    // console.log(combinedArticles)

    return combinedArticles;
}
pb2()
// so index.js can use the pb2 function
module.exports = pb2;

________________________________________________________________________________________________________

original workking with vitals on top

const cheerio = require('cheerio')
const axios = require('axios')

// make most recent vital mtb article show on top

const pb_url = 'https://www.pinkbike.com/';
const vital_url = 'https://www.vitalmtb.com/';


async function pb2() {
    let articles = [];
    let combinedArticles = [];

    await axios.get(pb_url).then(resp => {
        const $ = cheerio.load(resp.data);

        $('.news-style1').each((i, element) => {

            // get title and link and change to mobile version
            let link = $(element).find('a.f22').attr('href');
            const regex = /www/;
            link = link.replace(regex, 'm')
            const title = $(element).find('a.f22').text().trim();

            // get number of comments
            const comments = $(element).find('div.floatleft').text();
            const re = /\d*\s*Comments/;
            const comment = re.exec(comments);
            const re2 = /\d*/;
            let commentNumber = re2.exec(comment);
            if (commentNumber[0] == "") {
                commentNumber = 0;
            }

            // used for tag queries
            const img = $(element).find('img.floatleft').attr('src');
            const tag = $(element).find('div.floatleft div a.pb-tag').text();

            // get tags for dh racing
            const reDH = /DH Racing|Dh/
            const dhMatch = reDH.exec(tag)
            let dh = false;
            if (dhMatch ? dh = true : dh = false);

            // get tags for enduro 
            reEnduro = /enduro bikes/i
            const enduroCheck = reEnduro.exec(tag)
            let enduro = false;
            if (enduroCheck) { enduro = true };

            // get bike manufactures list
            const reBike = /rocky mountain|norco|santa cruz|evil|guerilla gravity|trasition|specialized|trek/i
            const bikeMatch = reBike.exec(tag);
            let bikeCompany = false;
            if (bikeMatch) { bikeCompany = true; }

            // check if it a contest
            const reContest = /contest[s?] and deal[s?]/i;
            const contestMatch = reContest.exec(tag);
            let contest = false;
            if (contestMatch) { contest = true; }

            // check its it today or not
            let today = false;
            const date = $(element).find('span.highlight').text().toLowerCase();
            if (date === "today") { today = true }

            // check if its a podcast
            const rePodcast = /podcast/i;
            const podcastMatch = rePodcast.exec(tag);
            let podcast = false;
            if (podcastMatch) { podcast = true };

            // get date
            const articleDate = $(element).find('.fgrey2').text();

            // make object
            const article = {
                title: title,
                commentNumber: parseInt(commentNumber[0]),
                link: link,
                img: img,
                dh: dh,
                enduro: enduro,
                bikeCompany: bikeCompany,
                contest: contest,
                today: today,
                podcast: podcast,
                date: articleDate.trim()
            }
            // console.log(article.link)
            // push articles
            if ((article.commentNumber > 200 || article.dh === true ||
                article.enduro === true || bikeCompany === true) &&
                (article.contest === false && article.podcast === false)) {

                articles.push(article);
            }

            // articles.sort(function (a, b) { return b.commentNumber - a.commentNumber });
        })
    })

    // do vital mtb
    await axios.get(vital_url).then(resp => {
        let vital_Articles = [];
        const $ = cheerio.load(resp.data)

        $('.sp-b-item').each((i, element) => {

            // get title and link
            const title = $(element).find('a.title').text();
            const link = $(element).find('.title').attr('href');

            // find raw videos  
            const reRaw = /vital raw/i;
            const match = reRaw.exec(title);

            // wasnt able to select image

            // make object if raw video found
            let article = {}
            if (match) {
                // get date -> ads had the sb-item-class, which has no date to get, so we do here, instead of outside the 'if match'

                const articleDate = $(element).find('span.timestamp').text();
                const reDate = /\d+\/\d+\/\d+/
                const dateMatch = reDate.exec(articleDate)
                // console.log(dateMatch[0])

                article = {
                    title: title,
                    link: link,
                    date: dateMatch[0]
                }
                // push article to vitals array
                vital_Articles.push(article)
            }
        })

        // combine pb + vital
        combinedArticles = vital_Articles.concat(articles)

        // sort vital raws into correct spot by date
        function sameDay(day1, day2) {
            return day1.getFullYear() === day2.getFullYear() && day1.getMonth() === day2.getMonth() && day1.getDate() === day2.getDate();
        }
    })

    // console.log(combinedArticles)
    return combinedArticles;

}
pb2()
// so index.js can use the pb2 function
module.exports = pb2;

____________________________________________________________________________________________