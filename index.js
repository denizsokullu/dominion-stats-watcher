require('dotenv').config();
const puppeteer = require('puppeteer');
const readline = require('readline');
const { stdin: input, stdout: output } = require('process');

async function run() {
    const rl = readline.createInterface({ input, output });

    let browser;
    let page;

    const START_COMMAND = 'start';
    const LOGIN_COMMAND = 'login';
    const LOGOUT_COMMAND = 'logout';
    const JOIN_COMMAND = 'join';
    const QUIT_COMMAND = 'quit';
    const GAME_DONE_COMMAND = 'game done';
    const SAVE_HISTORY_COMMAND = 'save history';
    const SAVE_STATS_COMMAND = 'save stats';

    const commands = [
        START_COMMAND,
        LOGIN_COMMAND,
        LOGOUT_COMMAND,
        JOIN_COMMAND,
        QUIT_COMMAND,
        GAME_DONE_COMMAND,
        SAVE_HISTORY_COMMAND,
        SAVE_STATS_COMMAND,
    ]

    rl.write('Dominion Stats Watcher v0.1.0:\n');
    rl.write(`Available commands: ${commands.join(', ')}\n`);

    rl.on('line', async function (input) {
        if (input === START_COMMAND) {
            browser = await puppeteer.launch({
                headless: false,
                args: [`--window-size=1920,1080`],
                defaultViewport: {
                  width: 1920,
                  height: 1080
                }
            });
            page = await browser.newPage();
            await page.goto('https://www.dominion.games');
            await page.waitForSelector(".login-form", { timeout: 5000 });
            await page.waitForTimeout(2000);
        } else if (input === LOGIN_COMMAND) {
            await page.type('#username-input', 'dominionstatswatcher');
            await page.type(`input[type='password']`, process.env.DOMINION_USER_PW); // get password from ENV
            await page.click(`input[value='Login']`);
        } else if (input === JOIN_COMMAND) {
            try {
                await page.click('.automatch-friends-buttons');
            } catch {
                rl.write('0 friends are online, no game to join');
            }
        } else if (input === SAVE_HISTORY_COMMAND) {
            // scrape all the text in log-container
            const currentHistory = await page.$eval(".log-container", el => el.textContent);
            console.log(currentHistory);
        } else if (input === GAME_DONE_COMMAND) {
            try {
                await page.click('.lobby-button');
            } catch {
                rl.write('Game is not finished');
            }
        } else if (input === SAVE_STATS_COMMAND) {
            const results = await page.$$eval(".score-panel-results .ui-grid-cell-contents", (cells) => { return cells.map((cell) => cell.textContent)});

            const chunks = [];
            let i = 0;
            let n = results.length;

            while (i < n) {
                chunks.push(results.slice(i, i += 4));
            }

            chunks.shift(); // drop the first row in the table as it's the header

            console.log(chunks);

        } else if (input === LOGOUT_COMMAND) {
            await page.click('.bottom-lobby-link:last-child');
        } else if (input === QUIT_COMMAND) {
            browser.close();
            process.exit();
        }
    });
}

run();
