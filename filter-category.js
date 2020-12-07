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

let sql = "SELECT category FROM objects group by category"
con.query(sql, function (err, result) {
  if (err) throw err;

  let state = [];
  result.map(categories => {
    categoryArr = categories.category.split(', ');
    categoryArr.map(category => {
      if (!containCheck(state, category)) {
        if(category !== '')
          state.push([category]);
      }
    })

  });

  let sql = 'INSERT INTO categories (name) VALUES ?';
  let values = [
    state
  ]

  con.query(sql, values, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows);
  });

});

const containCheck = (state, category) => {
  status = false;
  state.map(data => {
    if (data[0] === category) {
      status = true;
    }
  })
  return status;
}