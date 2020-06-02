const puppeteer = require('puppeteer');

//--> legacy url (will be discontinued june 2020)
// const BASE_URL = 'https://mobile.twitter.com/';
// const USERNAME_URL = (username) => `https://mobile.twitter.com/${username}`;

const BASE_URL = 'https://twitter.com/';
const USERNAME_URL = (username) => `https://twitter.com/${username}`;

let browser = null;
let page = null;

const twitter = {

    initialize: async() => {
        browser = await puppeteer.launch({headless: false});
        page = await browser.newPage();

        //--> tests for legacy url 
        // await page.setRequestInterception(true);
        // page.on('request', (request) => {
        //   if(['image', 'stylesheet', 'font', 'script'].includes(request.resourceType())){
        //       request.abort();
        //     }
        //   else{
        //       request.continue();
        //     }
        // })
    },

    getUser: async(username) => {
        let url = await page.url();

        if(url != USERNAME_URL(username)){
            await page.goto(USERNAME_URL(username));
        }
        
        //--> wait for username to load
        await page.waitFor('div[class="css-1dbjc4n r-15d164r r-1g94qm0"] span[class="css-901oao css-16my406 r-1qd0xha r-ad9z0x r-bcqeeo r-qvutc0"');

        //--> get username
        let user = await page.evaluate(() => {
            return document.querySelector('div[class="css-1dbjc4n r-15d164r r-1g94qm0"] span[class="css-901oao css-16my406 r-1qd0xha r-ad9z0x r-bcqeeo r-qvutc0"').innerText;
        })

        return user;
    },

    getTweets: async(username, count = 5) => {
        let url = await page.url();

        //--> disable js (legacy test)
        // await page.setJavaScriptEnabled(false);
        
        if(url != USERNAME_URL(username)){
            await page.goto(USERNAME_URL(username));
        }
       
        //--> proceed to legacy
        // await page.click('button[type="submit"]');
        // await page.waitFor('div[class="timeline"]');

        //--> get real name
        await page.waitFor('div[class="css-1dbjc4n r-15d164r r-1g94qm0"] span[class="css-901oao css-16my406 r-1qd0xha r-ad9z0x r-bcqeeo r-qvutc0"');
        let user = await page.evaluate(() => {
            return document.querySelector('div[class="css-1dbjc4n r-15d164r r-1g94qm0"] span[class="css-901oao css-16my406 r-1qd0xha r-ad9z0x r-bcqeeo r-qvutc0"').innerText;
        })

        console.log("user:" + user);

        //--> wait for timeline
        await page.waitFor(`div[aria-label="Timeline: ${user}’s Tweets"]`);
        console.log("wait for timeline");
        await page.waitFor(3000);

        let tweetsArray = await page.$$(`div[aria-label="Timeline: ${user}’s Tweets"] div[data-testid="tweet"]`);
        console.log("wait for tweetsarray");
        let tweets = [];

        //--> while < count for testing purposes
        // while(tweets.length < count){
            
            // let tweetsArray = await page.$$(`div[aria-label="Timeline: ${user}’s Tweets"] div[data-testid="tweet"]`);
            
            console.log("got tweetsarray");
            //console.log(tweetsArray);
            for(let tweetElement of tweetsArray){
                try {
                    console.log("start element");
                    //TODO: different types of tweets / retweets / sorting when posted on same time / filter on keywords
                    let tweet = await tweetElement.$eval('div[class="css-901oao r-hkyrab r-1qd0xha r-a023e6 r-16dba41 r-ad9z0x r-bcqeeo r-bnwqim r-qvutc0"] span', element => element.innerText);
                    console.log("got tweet");
                    console.log(tweet);
                    let date = await tweetElement.$eval('time', element => element.getAttribute('dateTime'));
                    console.log("got date");
                    console.log(date);
                    // let interaction = await tweetElement.$eval('div[class="css-1dbjc4n r-18u37iz r-1wtj0ep r-156q2ks r-1mdbhws"]');
                    // console.log("got interaction");
                    
                    // let commentCount = await interaction.$eval('div[data-testid="reply"] span span', element => element.innerText);
                    // console.log("got comment");
                    // let retweetCount = await interaction.$eval('div[data-testid="retweet"] span span', element => element.innerText);
                    // console.log("got retweet");
                    // let favoriteCount = await interaction.$eval('div[data-testid="like"] span span', element => element.innerText);
                    // console.log("got like");
                    // tweets.push({date, tweet, commentCount, retweetCount, favoriteCount});
                    console.log(tweets);
                    tweets.push({date, tweet});
                   
                    console.log(tweets);
                } catch (error) {
                    console.log(error);
                }
            }

            // await page.evaluate(`window.scrollTo(0, document.body.scrollHeight)`);
            // await page.waitFor(2000);
        // }
        // debugger;
        return tweets;
    }
};

module.exports = twitter;