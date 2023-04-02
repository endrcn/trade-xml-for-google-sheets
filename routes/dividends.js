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
                    "User-Agent": "PostmanRuntime/7.29.2",
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

        let xmlData = `
        <?xml version="1.0" encoding="UTF-8"?>
        <dividends>`;

        for (let i = 0; i < dividends[ticker].length; i++) {
            let data = dividends[ticker][i];
            if (data) {
                
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

        res.setHeader('content-type', 'text/xml');
        res.send(xmlData);
    }



});

module.exports = router;
