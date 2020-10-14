var scraperjs = require('scraperjs');

var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "tourism-object-scraping"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

scraperjs.StaticScraper.create('https://www.tripadvisor.com/Attractions-g294226-Activities-oa30-Bali.html')
    .scrape(function ($) {
        let objects = getObject($);
        return objects;
    })
    .then(function (objects) {
        console.log(objects);
    });

function getObject($) {
    return $("._1MKm6PFo").map(function () {
        let url = $(this).find('._1QKQOve4').attr('href');

        let image_urls = $(this).find('img').data("url");
        let image_urls_arr = image_urls.split(" ");
        let image_url_arr = image_urls_arr[(image_urls_arr.length - 2)].split(",");
        let image_url = image_url_arr[image_url_arr.length - 1];

        let name = $(this).find('._1QKQOve4 h2').text();
        let rating = $(this).find('._1DZZGRFQ').attr('title');
        let total_review = $(this).find('._2s3pPhGm span').text();
        let category = $(this).find('._21qUqkJx').text();

        object = {
            name: name,
            url: url,
            image_url: image_url,
            rating: rating,
            category: category,
            total_review: total_review,
        };

        insertDB(object);

        return object
    }).get();
}

function insertDB(object) {
    console.log(object.name);
    var sql = "INSERT INTO objects VALUES (null, '" + object.name + "', '" + object.url + "','" + object.image_url + "','" + object.rating + "','" + object.category + "','" + object.total_review + "')";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
    });
}