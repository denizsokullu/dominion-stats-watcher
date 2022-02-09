require('dotenv').config();
const puppeteer = require('puppeteer');

async function run () {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    await page.goto('https://www.dominion.games');

    await page.waitForSelector(".login-form", { timeout: 5000 });

    await page.waitForTimeout(2000);

    await page.type('#username-input', 'dominionstatswatcher');
    await page.type(`input[type='password']`, process.env.DOMINION_USER_PW); // get password from ENV
    await page.click(`input[value='Login']`);

    await page.waitForTimeout(2000);

    await page.screenshot({path: 'login.png'});

    browser.close();
}

run();
