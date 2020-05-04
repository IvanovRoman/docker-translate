"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const puppeteer = require("puppeteer");
const qs = require("querystring");
const fs = require("fs");
const app = express();
app.get("/", (req, res) => {
    res.json(JSON.stringify({ ok: 1 })).end();
});
app.get("/page", async (req, res) => {
    try {
        if (!req.query.url) {
            res.send("Нет одного ссылки на страницу");
            res.end();
        }
        if (!req.query.src) {
            res.send("Нет одного исходного языка");
            res.end();
        }
        if (!req.query.dest) {
            res.send("Нет одного конечного языка");
            res.end();
        }
        const linkToPage = req.query.url;
        const src = req.query.src;
        const dest = req.query.dest;
        const url = await generateUrl(linkToPage, {
            source: src,
            destination: dest,
        });
        const { html, browser } = await translateContent(url);
        res.write(html);
        res.end();
        await saveHtml(html);
        await browser.close();
    }
    catch (err) {
        console.log(err);
    }
});
app.listen(process.env.PORT || 3000, () => {
    console.log("app running");
});
async function saveHtml(html) {
    return new Promise(async (resolve, reject) => {
        if (!html || html === "") {
            reject("No html page");
            return;
        }
        try {
            fs.writeFile("demo.html", html, (err) => {
                console.log("File created!");
            });
        }
        catch (err) {
            reject(err);
        }
    });
}
async function generateUrl(url, langs) {
    return new Promise(async (resolve, reject) => {
        try {
            const googleLink = `https://translate.google.com/translate?hl=&sl=${langs.source}&tl=${langs.destination}&u=`;
            const linkToPage = qs.escape(url);
            const resultUrl = googleLink + linkToPage;
            resolve(resultUrl);
        }
        catch (err) {
            reject(err);
        }
    });
}
async function translateContent(url) {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({
                // headless: false,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });
            const page = await browser.newPage();
            await page.goto(url);
            console.log(`Открываю страницу: ${url}`);
            const frame = page.mainFrame();
            const childFrame = frame
                .childFrames()
                .find((fr) => fr.name() === "c");
            console.log("content-frame: ", childFrame === null || childFrame === void 0 ? void 0 : childFrame.url());
            page.close();
            const transateLink = childFrame === null || childFrame === void 0 ? void 0 : childFrame.url();
            // const transateLink =
            //   "https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.ru&sl=pl&sp=nmt4&tl=ru&u=https://porady.sympatia.onet.pl/sympatia-radzi/zakochana-kobieta-symptomy/1n0xh64&usg=ALkJrhjHgShp8xVBuRs9bzWYBKEcp35JTQ"
            const pageLink = await browser.newPage();
            await pageLink.setRequestInterception(true);
            pageLink.on("request", (request) => {
                if (["image", "stylesheet", "font"].indexOf(request.resourceType()) !==
                    -1) {
                    request.abort();
                }
                else {
                    request.continue();
                }
            });
            await pageLink.goto(transateLink, { waitUntil: "domcontentloaded" });
            await autoScroll(pageLink);
            const html = await pageLink.content();
            resolve({ html, browser });
        }
        catch (err) {
            console.log(err);
            reject(err);
        }
    });
}
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise(async (resolve, reject) => {
            try {
                var totalHeight = 0;
                var distance = 100;
                var timer = setInterval(() => {
                    var scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 300);
            }
            catch (err) {
                reject(err);
            }
        });
    });
}
//# sourceMappingURL=server.js.map