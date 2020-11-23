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

let linkArray = [
    {
        url: 'https://www.tripadvisor.com/Attractions-g294226-Activities-oa30-Bali.html',
        city: 'bali'
    },
    {
        url: 'https://www.tripadvisor.com/Attractions-g297704-Activities-oa30-Bandung_West_Java_Java.html',
        city: 'bandung'
    }
]

linkArray.map(source => {
    scraperjs.StaticScraper.create(source.url)
        .scrape(function ($) {
            getObject($, source.city);
            console.log(`done ${source.city}`);
        })
        .then(function (objects) {
            console.log(objects);
        });
})


function getObject($, city) {
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
            city: city,
            category: category,
            total_review: total_review,
        };

        if (image_url.substring(0, 4) == 'http') {
            insertDB(object);
        }

        return object
    }).get();
}

function insertDB(object) {
    console.log(object.name);
    var sql = "INSERT INTO objects VALUES (null, '" + object.name + "', '" + object.url + "','" + object.image_url + "','" + object.city + "','" + object.rating + "','" + object.category + "','" + object.total_review + "')";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
    });
}