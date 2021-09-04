const cheerio = require('cheerio')
const axios = require('axios');
const e = require('express'); // doesnt look like this is needed to work.

// make most recent vital mtb article show on top
// test to see if this pushes to github

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
            const reDH = /DH Racing|Dh\s+/
            const dhMatch = reDH.exec(tag)
            let dh = false;
            if (dhMatch ? dh = true : dh = false);

            // check for photo epic
            const rePhoto = /photo epic/i;
            let photoEpic = false;
            if (rePhoto.exec(tag)) { photoEpic = true };

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

            // get riders list
            const reRider = /aaron gwin/i;
            const riderMatch = reRider.exec(tag);
            let rider = false;
            if (riderMatch) { rider = true };

            // check if it a contest
            const reContest = /contest[s?] and deal[s?]/i;
            const contestMatch = reContest.exec(tag);
            let contest = false;
            if (contestMatch) { contest = true; }

            // check to see if its apparel
            const reApparel = /apparel/i;
            const apparelMatch = reApparel.exec(tag);
            let apparel = false;
            if (apparelMatch) { apparel = true };

            // check its it today or not
            let today = false;
            const date = $(element).find('span.highlight').text().toLowerCase();
            if (date === "today") { today = true }

            // check if its a podcast
            const rePodcast = /podcast/i;
            const podcastMatch = rePodcast.exec(tag);
            let podcast = false;
            if (podcastMatch) { podcast = true };

            // check if Dirtjump bikes
            let dirtJumper = false;
            const reDirtJump = /dirtjump bike?s/i;
            if (reDirtJump.exec(tag)) {
                dirtJumper = true;
            }

            // check for redBull Rampage
            let rampage = false;
            const reRampage = /red bull rampage/i;
            if (reRampage.exec(tag)) {
                rampage = true;
            }


            // get date
            const articleDate = $(element).find('.fgrey2').text();

            // make object
            const article = {
                title: title,
                commentNumber: parseInt(commentNumber[0]),
                link: link,
                img: img,
                photoEpic: photoEpic,
                dh: dh,
                enduro: enduro,
                bikeCompany: bikeCompany,
                rider: rider,
                contest: contest,
                apparel: apparel,
                today: today,
                podcast: podcast,
                date: articleDate.trim(),
                dateObject: makeDateObject(articleDate.trim()),
                dirtJumper: dirtJumper,
                rampage: rampage
            }
            // console.log(article.link)
            // push articles
            if ((article.commentNumber > 150 || article.dh === true ||
                article.enduro === true || bikeCompany === true || rider === true || rampage === true) &&
                (article.contest === false && apparel === false && article.podcast === false && article.dirtJumper === false && photoEpic === false)) {

                articles.push(article);
            }

            // articles.sort(function (a, b) { return b.commentNumber + a.commentNumber });

        })
    })

    // do vital mtb
    await axios.get(vital_url).then(resp => {
        let vital_Articles = [];
        const $ = cheerio.load(resp.data)

        $('.sp-b-item').each((i, element) => {

            // get title and link
            const title = $(element).find('a.title').text();
            let link = $(element).find('.title').attr('href');

            // find raw videos  
            const reRaw = /vital raw|track walk/i;
            const match = reRaw.exec(title);

            // make sure content has a video


            // find track walk videos
            // const reTrack = /track walk/i;
            // const match = reTrack.exec(title);

            // wasnt able to select image

            // make object if raw video found
            let article = {}
            if (match) {
                // get date -> ads had the sb-item-class, which has no date to get, so we do here, instead of outside the 'if match'

                const articleDate = $(element).find('span.timestamp').text();
                const reDate = /\d+\/\d+\/\d+/
                const dateMatch = reDate.exec(articleDate)

                // get comment count
                const commentNumber = $(element).find('.comment_count').text();
                // console.log(link)

                article = {
                    title: title,
                    link: link,
                    date: dateMatch[0],
                    commentNumber: commentNumber,
                    dateObject: makeDateObject(dateMatch[0])

                }
                // push article to vitals array
                vital_Articles.push(article)
            }
        })

        // put vital articles in the right spot
        const pbLength = articles.length;
        const vitalLength = vital_Articles.length;
        let vitalTheOldest = true;
        let thisWorked = false;

        for (let i = vitalLength - 1; i >= 0; i--) {
            let vital = vital_Articles[i]

            for (let j = 0; j < pbLength; j++) {
                let article = articles[j];

                // check if vital is same day as Pinkbike article
                if (sameDay(vital.dateObject, article.dateObject)) {
                    articles.splice(j, 0, vital_Articles[i])
                    vitalTheOldest = false;
                    thisWorked = true;
                    break;
                }
                // check to see if vital is older than all Pinkbike articles
                else if (vital.dateObject > article.dateObject) {
                    vitalTheOldest = false;
                }

                // check to see if vital is somwhere between articles
                else {
                    // check if vital is between 2 dates
                    if (j < pbLength - 1) {

                        // index to splice vital in should be at j+1 then
                        if (vital.dateObject > article.dateObject && vital.dateObject < articles[j + 1].dateObject) {
                            console.log("BETWEEEEEEEN")
                            articles.splice(j + 1, 0, vital_Articles[i])
                        }
                    }
                }
            }

            if (vitalTheOldest === true) {
                console.log("oldest")
                articles.push(vital_Articles[i])
                thisWorked = true;
            }

            console.log("this worked is: ", thisWorked)

            // if we fucked up, lets just put the vital at the beginning
            if (thisWorked === false) {
                console.log("we FUCKED UP....")
                articles.push(vital_Articles[i])
            }
        }

        // combine pb + vital
        // combinedArticles = vital_Articles.concat(articles)
        combinedArticles = articles;
        // combinedArticles.splice(5, 0, vital_Articles[0])
        // combinedArticles.splice(0, 1)

    })

    // console.log(combinedArticles)
    articles.forEach(item => {
        // console.log(item.dateObject.getDate())
    })
    return combinedArticles;

    // unviersal functions
    function makeDateObject(date) {
        if (date === "Today") { return new Date() }
        else {
            return new Date(date)
        }
    }
    function sameDay(day1, day2) {
        return day1.getFullYear() === day2.getFullYear() && day1.getMonth() === day2.getMonth() && day1.getDate() === day2.getDate();
    }



}
pb2()
console.log("heyyy")
// so index.js can use the pb2 function
module.exports = pb2;
