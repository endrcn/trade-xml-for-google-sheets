var express = require('express');
var axios = require("axios");
const fs = require("fs");
var router = express.Router();

var qs = require('qs');

let dividends = {};

/* GET dividends listing. */
router.get('/:ticker', async (req, res, next) => {
  let ticker = req.params.ticker;

  try {
    res.setHeader('content-type', 'text/xml');

    if (dividends[ticker]) return res.render("dividends", {
      data: dividends[ticker]
    });

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
      console.log(resp.data);
      dividends[ticker] = resp.data;
      fs.writeFileSync("dividends.json", JSON.stringify(dividends, null, 4), "utf-8");
      res.render("dividends", { data: resp.data });
    } else {
      console.warn(resp.status, resp.statusText);
      res.render("dividends", { data: [] });
    }

  } catch (err) {
    console.error(err);
    res.render("dividends", { data: [] });
  }



});

module.exports = router;
