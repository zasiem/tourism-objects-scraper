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

const cities = [
    // 'surabaya',
    // 'jakarta',
    // 'medan',
    // 'bali',
    // 'yogyakarta',
    // 'bandung',
    // 'semarang',
]

const getLink = city => {
    return `https://www.triphobo.com/places/${city}-indonesia/things-to-do`;
}

const mainScrap = (link, city) => {
    if(link == undefined || link == null){
        return;
    }
    scraperjs.StaticScraper.create(link)
    .scrape(function ($) {
        let links = $("#AjaxLoad li").map(function() {
            return $(this).find('#js_attraction_list a').attr('href');
        }).get();
        let nextLink = $(".next a").attr('href');
        return {
            'links': links,
            'next': nextLink
        }
    })
    .then(function (data) {
        data.links.map(link => {
            scrapDetail(link, city);
        })
        mainScrap(data.next, city);
    });
}

const scrapDetail = (link, city) => {
    scraperjs.StaticScraper.create(link)
        .scrape(function ($) {
            let title = $(".main-head").text();
            let rating = $(".digit").text();
            let total_review = $(".adda-votes").text();
            let address = $("address span").text();
            let price = $(".fa-money").parent('li').find('span').text();
            let category = $(".icon-attraction").parent('li').find('span').text();
            let description = $("#cms-data p").first().text();
            let image_url = $('#main_image').attr('src');
            
            return {
                'title': title.replace(/["']/g, ""),
                'link': link,
                'rating': rating,
                'total_review': total_review,
                'address': address.replace(/["']/g, ""),
                'price': price,
                'category': category,
                'description': description.replace(/["']/g, ""),
                'image_url': image_url,
                'city': city,
            }
        })
        .then(function (data) {
            insertDB(data);
        });
}

const insertDB = object => {
    var sql = `INSERT INTO objects VALUES (null, "${object.title}", "${object.link}", "${object.image_url}", "${object.city}", "${object.rating}", "${object.category}", "${object.total_review}", "${object.description}", "${object.price}")`;
    con.query(sql, function (err, result) {
        if (err) throw err;
        return console.log(`${object.title} record inserted`);
    });
}

cities.map(city => {
    let link = getLink(city);
    mainScrap(link, city);
})
