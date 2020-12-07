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

let masterCategories;

let sql = "SELECT * FROM categories";
con.query(sql, function (err, result) {
    if (err) throw err;

    masterCategories = result;
    con.query("SELECT * FROM objects", function (err, result) {
        if (err) throw err;

        result.map(data => {
            let categories = splitCategories(data.id, data.category);

            let sql = 'INSERT INTO object_categories (object_id, category_id) VALUES ?';
            let values = [
                categories
            ]
            
            if(categories.length > 0){
                con.query(sql, values, function (err, result) {
                    if (err) throw err;
                    console.log(result.affectedRows);
                });
            }
            

        })
    })

});

const splitCategories = (id, categories) => {
    let data = [];
    categories = categories.split(', ');
    if (categories[0] !== '')
        categories.map(category => {
            getCategory = masterCategories.find(data => data.name == category);
            data.push([id, getCategory.id]);
        });

    return data;
}

