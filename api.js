const sirv = require('sirv');
const send = require('@polka/send-type');
const polka = require('polka');
const compress = require('compression')();
const expressGoogleAnalytics = require('express-google-analytics');
const cors = require('cors');
const slowDown = require("express-slow-down");
const { createReadStream } = require('fs');
const config = require("./config.json");

// Dependecies required for your API

const analytics = expressGoogleAnalytics(process.env.google);

// Fill in your google analytics api key into secrets as "google"

const baseURL = `${config.URL}/img/`

// Change the baseURL to your repl link in config.json!

const assets = sirv('src', {
    maxAge: 31536000,
    immutable: true
});
const ratelimit = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 5, // allow 5 requests to go at full-speed, then...
    delayMs: 100 // 6th request has a 100ms delay, 7th has a 200ms delay, 8th gets 300ms, etc.
});

// Ratelimit for the API

polka()
    .use("trust proxy")
    .use(cors())
    .use(analytics)
    .use(compress, assets)
    .use(ratelimit)
    .get('/get', (req, res) => {
        let image = `${config.Images}`
        const randomimage = Math.floor(Math.random() * (image - 2) + 1);

      // Randomizing the images in ../src/img
      
        let data = {
            "image": `${baseURL}${randomimage}.jpg`,
        }
        console.log(data);
        send(res, 200, data);
    })

// Console logging and sending the data out
  
    .get('/image', (req, res) => {
        let image = `${config.Images}`
        const randomimage = Math.floor(Math.random() * (image - 2) + 1);

// Randomizing the images in ../src/img
      
        let file = createReadStream(`./src/img/${randomimage}.jpg`)
        send(res, 206, file,{'Content-Type':'image/jpg'});
    })

// Defining the file type and sending the images out in jpg form
  
    .listen(3000, err => {
        if (err) throw err;
        console.log(`API up and running!`);
    });

// API listening to port 3000
