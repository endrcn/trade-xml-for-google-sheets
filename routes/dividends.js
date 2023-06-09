var express = require('express');
var axios = require("axios");
var router = express.Router();

var qs = require('qs');

let dividends = {};

/* GET dividends listing. */
router.get('/:ticker', async (req, res, next) => {
    let ticker = req.params.ticker;

    try {

        if (!dividends[ticker]) {

            let resp = await axios({
                url: "https://temettuhisseleri.com/backend/getdividendslist.php",
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
                    "Host": "temettuhisseleri.com",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Accept": "*/*"
                },
                data: qs.stringify({
                    ticker
                })
            });

            if (resp.status == 200) {
                dividends[ticker] = resp.data;
            } else {
                console.warn(resp.status, resp.statusText);
                res.render("dividends", { data: [] });
            }
        }

    } catch (err) {
        console.error(err);
        res.render("dividends", { data: [] });
    } finally {

        let last5YearCount = 0;
        let sumOfLast5YearRatio = 0;
        let last10YearCount = 0;
        let sumOfLast10YearRatio = 0;

        let fiveYearsAgo = new Date().getFullYear() - 5;
        let tenYearsAgo = new Date().getFullYear() - 10;

        let xmlData = `<?xml version="1.0" encoding="UTF-8"?>
        <endrcn>
        <dividends>`;
        for (let i = 0; i < dividends[ticker].length; i++) {
            let data = dividends[ticker][i];
            if (data) {
                if (data.year >= tenYearsAgo) {
                    last10YearCount++;
                    sumOfLast10YearRatio += parseFloat(data.amount);
                }

                if (data.year >= fiveYearsAgo) {
                    last5YearCount++;
                    sumOfLast5YearRatio += parseFloat(data.amount);
                }

                xmlData += `
                <dividend>
                    <payoutratio>${data.payoutratio}%</payoutratio>
                    <amount>${data.amount.replace(".", ",")}%</amount>
                    <perstock>${data.perstock.replace(".", ",")}</perstock>
                    <date>${data.year + "-" + data.month + "-" + data.day}</date>
                </dividend>
                `;
            }

        }

        xmlData += "</dividends>";
        xmlData += `
        <metadata>
        <last-5-years>
            <avg-amount>${(sumOfLast5YearRatio / 5).toFixed(2)}</avg-amount>
            <dividend-count>${last5YearCount}</dividend-count>
        </last-5-years>
        <last-10-years>
            <avg-amount>${(sumOfLast10YearRatio / 5).toFixed(2)}</avg-amount>
            <dividend-count>${last10YearCount}</dividend-count>
        </last-10-years>
        </metadata>
        </endrcn>`;

        res.setHeader('content-type', 'text/xml');
        res.send(xmlData);
    }



});

module.exports = router;
