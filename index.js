const express = require('express');

// bring in getArticles backend data
const getArticles = require('./getArticles.js');

const app = express();

// lets us use this in our index.html page
app.use(express.static('public'))

app.get('/api/articles', async (req, res) => {
    // get the array of articles from our main back-end function
    const articles = await getArticles();
    // when this page is requested, we respond with the JSON format of the articles array
    res.json(articles);
});

const port = process.env.PORT || 4242

app.listen(4242, () => {
    console.log(`listening at http://localhost:${port}`)
});


