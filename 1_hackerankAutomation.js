// npm init -y
// npm install minimist
// npm install puppeteer

// node 1_hackerankAutomation.js --url=https://www.hackerrank.com --config=config.json

let minimist = require("minimist");
let fs = require("fs");
let puppeteer = require("puppeteer");
const { AcroTextFlags } = require("pdf-lib");

let args = minimist(process.argv);
let configJSON = fs.readFileSync(args.config,"utf-8");
let configJSO = JSON.parse(configJSON);

async function run(){
    let browser = await puppeteer.launch({
        headless: false,
        args: [
            '--start-maximized'
        ],
        defaultViewport: null
    });

    let pages = await browser.pages(); 
    let page = pages[0];

    await page.goto(args.url);
    
    // click on 1st Login
    await page.waitForSelector('a[href="https://www.hackerrank.com/access-account/"]');
    await page.click('a[href="https://www.hackerrank.com/access-account/"]');

    // click on 2nd Login
    await page.waitForSelector('a[href="https://www.hackerrank.com/login"]');
    await page.click('a[href="https://www.hackerrank.com/login"]');

    // type userid
    await page.waitForSelector('input[name="username"]');
    await page.type('input[name="username"]',configJSO.userid,{delay: 100});

    // type password
    await page.waitForSelector('input[name="password"]');
    await page.type('input[name="password"]',configJSO.password,{delay: 100});

    // click on 3rd Login
    await page.waitForSelector('button[data-analytics="LoginPassword"]');
    await page.click('button[data-analytics="LoginPassword"]');

    // click on compete
    await page.waitForSelector('a[data-analytics="NavBarContests"]');
    await page.click('a[data-analytics="NavBarContests"]');

    // click on manage contest
    await page.waitForSelector('a[href="/administration/contests/"]');
    await page.click('a[href="/administration/contests/"]');

    
    // find pages
    await page.waitForSelector("a[data-attr1 = 'Last']");
    let numPages = await page.$eval("a[data-attr1 = 'Last']",function(lastTag){
        let numPages = lastTag.getAttribute("data-page");
        return parseInt(numPages);
    });
    

    // move through all pages
    for(let i=0;i<numPages;i++){
        // work for 1 page
        await page.waitForSelector("a.backbone.block-center");
        let ourls = await page.$$eval("a.backbone.block-center",function(atags){
            let urls = [];

            for(let i=0;i<atags.length;i++){
                let url = atags[i].getAttribute("href");
                console.log(url);
                urls.push(url);
            }
            console.log(urls);
            return urls;
        });


        for(let i=0;i<ourls.length;i++){
            await handleContest(browser,page,ourls[i]);
        }
        // move to next page
        await page.waitFor(1500);
        await page.waitForSelector("a[data-attr1='Right']");
        await page.click("a[data-attr1='Right']");
        
    }
}

async function handleContest(browser,page,ourl){
    let npage = await browser.newPage();
    await npage.goto(args.url + ourl);

    
    
    await npage.waitForSelector("li[data-tab='moderators']");
    await npage.click("li[data-tab='moderators']");

    // let saveButtn = document.getElementById("confirmBtn");
    // if(saveButtn != null){
    //     await npage.click("#confirmBtn");
    // }
    
    // await npage.keyboard.press("Enter");
    // 

    // npage.on('dialog', async dialog => {
    //     await dialog.click("#confirmBtn");
    // });

    // npage.on('dialog', async (dialog) => {
    //     console.log(dialog.message());
    //     await dialog.dismiss();
    //     await browser.close();
    // });
    

    await npage.waitForSelector("input#moderator");
    await npage.type("input#moderator",configJSO.moderator,{delay:200});

    await npage.keyboard.press("Enter");
    
    await npage.waitFor(2000);
    await npage.close();
    await page.waitFor(2000);
}

run();
