module.exports = function () {

    let mysql = require('mysql2')

    //Establish Connection to the DB
    let connection = mysql.createConnection({
        host: 'us-cdbr-east-06.cleardb.net',
        user: 'beffb000664367',
        password: 'cbb7b74a',
        database: 'heroku_443f99716ce7801'
    });

    connection.connect((err) => {
        if (err) {
            console.log(err)
        } else {
            console.log("Database connection established")
        }
    });

    //return connection object
    return connection
}