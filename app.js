const express = require('express')
const mysql = require('mysql2')
require('dotenv').config();
const cors = require('cors')
const app = express()
const http = require('http')
const jsonwebtoken = require("jsonwebtoken");
const JWT_SECRET =
    "goK!pusp6ThEdURUtRenOwUhAsWUCLheBazl!uJLPlS8EbreWLdrupIwabRAsiBu";

const port = 3000

const connectionRequest = require('./connect.js')

// const server = http.createServer(function(req, res){
//     res.write('Hello Node')
//     res.end()
// })


// server.listen(port, function(error){
//     if(error){
//         console.log('Something went wrong ' + error)
//     } else{
//         console.log('Server is listerning on port '+ port)
//     }
// })

app.use(express.json())

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// const con = mysql.createConnection({
//     host: 'us-cdbr-east-06.cleardb.net',
//     user: 'beffb000664367',
//     password: 'cbb7b74a',
//     database: 'heroku_443f99716ce7801'
// })

//mysql://beffb000664367:cbb7b74a@us-cdbr-east-06.cleardb.net/heroku_443f99716ce7801?reconnect=true

// con.connect((err) => {
//     if (err) {
//         console.log(err)
//     } else {
//         console.log("Database connection established")
//     }
// })


const verifyToken = (req, res, next) => {
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        jsonwebtoken.verify(req.headers.authorization.split(' ')[1], JWT_SECRET, function (err, decode) {
            if (err) {
                return res.status(400).json({message: "some error occurred for JWT:" + err})
            } else {
                next()
            }
        });
    } else {
        return res.status(400).json({message: "invalid jwt token"})
    }
};


app.listen(process.env.PORT || 3000, (error) => {
    if (error) {
        console.log(error)
    } else {
        console.log("Server coonected on port 3000")
    }
})

app.post('/post-in-queue', (req, res) => {
    const dateCreated = new Date()
    const name = req.body.name;
    const mobile = req.body.mobile;
    const people = req.body.people;
    const bowling = req.body.bowling;
    const billiards = req.body.billiards;
    let game = "";
    console.log(req.body)
    let con = connectionRequest()
    if (bowling === true && billiards === true) {
        game = "Billiards"
        con.query('insert into userdata(dateCreated, name, mobile, people, game) values(?, ?, ?, ?, ?)', [dateCreated, name, mobile, people, game], (error, result) => {
            if (error) {
                res.status(404).json({
                    message: 'Could not enter user data',
                    data: {"error": error}
                }).send()
            }
        })
        game = "Bowling"
        con.query('insert into userdata(dateCreated, name, mobile, people, game) values(?, ?, ?, ?, ?)', [dateCreated, name, mobile, people, game], (error, result) => {
            if (error) {
                res.status(404).json({
                    message: 'Could not enter user data',
                    data: {"error": error}
                }).send()
            }
        })
        res.status(201).json({
            message: 'User data entered successfully',
            data: {}
        }).send()
    } else {
        if (bowling) {
            game = "Bowling"
            con.query('insert into userdata(dateCreated, name, mobile, people, game) values(?, ?, ?, ?, ?)', [dateCreated, name, mobile, people, game], (error, result) => {
                if (error) {
                    res.status(404).json({
                        message: 'Could not enter user data',
                        data: {}
                    }).send()
                    con.destroy()
                } else {
                    res.status(201).json({
                        message: 'User data entered successfully',
                        data: {}
                    }).send()
                    con.destroy()
                }
            })
        }
        else {
            game = "Billiards"
            con.query('insert into userdata(dateCreated, name, mobile, people, game) values(?, ?, ?, ?, ?)', [dateCreated, name, mobile, people, game], (error, result) => {
                if (error) {
                    res.status(404).json({
                        message: 'Could not enter user data',
                        data: {}
                    }).send()
                    con.destroy()
                } else {
                    res.status(201).json({
                        message: 'User data entered successfully',
                        data: {}
                    }).send()
                    con.destroy()
                }
            })
        }
    }
})


app.get('/get-count', (req, res) => {

    var bowl = 0;
    var billiards = 0;
    con = connectionRequest()
    con.query('SELECT SUM(IF(game = "Bowling", 1, 0)) AS bowling, SUM(IF(game = "Billiards", 1, 0)) AS billiards FROM userdata', (error, result) => {
        if (error) {
            res.status(500).json({
                message: 'Server Error.',
                data: {"error": error}
            })
            con.destroy()
        } else {
            bowl = result[0]['bowling']?result[0]['bowling']:0;
            billiards = result[0]['billiards']?result[0]['billiards']:0;
            var data = {"bowling": bowl, "billiards": billiards};
            res.status(201).json({
                message: 'Count of people',
                data: data
            })
            con.destroy()
        }
    })
})


app.get('/get-queue', (req, res) => {
    let game = req.query.game

    if (!game) {
        con = connectionRequest()
        let countbilliards = 0
        let countbowling = 0
        con.query('SELECT * FROM userdata ORDER BY dateCreated', (error, result) => {
            if (error) {
                console.log('Something went wrong ' + error)
            } else {
                var data = result;

                for (i = 0; i < result.length; i++) {
                    if (result[i].game === 'Bowling') {
                        countbowling += 1;
                        result[i].turn = countbowling
                    } else {
                        countbilliards += 1;
                        result[i].turn = countbilliards
                    }
                }

                res.status(201).json({
                    message: 'Success',
                    data: data
                })
                con.destroy()
            }
        })
    } else {
        con = connectionRequest()
        con.query('SELECT * FROM userdata where game =? ORDER BY dateCreated', [game], (error, result) => {
            var count = 0;
            var i = 0;
            if (error) {
                console.log('Something went wrong ' + error)
            } else {
                for (i = 0; i < result.length; i++) {
                    count = count + 1;
                    result[i].turn = count
                }
                var data = result;
                res.status(201).json({
                    message: 'Success',
                    data: data
                })
                con.destroy()
            }
        })
    }
});

app.delete('/remove-queue/:id', verifyToken, (req, res) => {

    var token = req.params.id;
    console.log(token)
    con = connectionRequest()
    con.query('DELETE FROM userdata WHERE token_id = ?', [token], (error, result) => {
        if (error) {
            console.log('Something went wrong ' + error)
            res.status(404).json({
                message: 'Token ID Not Found',
                data: {"error": error}
            })
            con.destroy()

        } else {
            var data = {"message": "success"};
            res.status(200).json({
                message: 'Token data is deleted successfully and removed from the queue',
                data: data
            });
            con.destroy()
        }
    })

})


//const crypto=require("crypto-js")

// // Initializing the original data
// var data = "This is the data that need to be encrypted"

// // Defining the secret key
// var key = "pwd@1234"

// // Encrypting the data using the password key
// var encrypted = crypto.AES.encrypt(data, key).toString();
// console.log("Encrypted data -- ")

// // Printing the encrypted data
// console.log(encrypted)
// console.log("Decrypted data -- ")

// // Decrypting the data using the same password key
// var decrypted = crypto.AES.decrypt(encrypted, key)
//   .toString(crypto.enc.Utf8)
// console.log(decrypted)


var key = "pwd@1234"

// app.post('/register', (req, res) => {
//
//     var username = req.body.name;
//     var password = req.body.password;
//     console.log(password);
//     // Encrypting the data using the password key
//     var encrypted_name = crypto.AES.encrypt(username, key).toString();
//     var encrypted_password = crypto.AES.encrypt(password, key).toString();
//     console.log(encrypted_password)
//
//     con.query('insert into admindata(name, password) values(?, ?)', [encrypted_name, encrypted_password], (error, result) => {
//         if (error) {
//             res.status(404).json({
//                 message: 'Admin registeration failed',
//                 data: {"error": error}
//             })
//         } else {
//             res.status(201).json({
//                 message: 'Admin registered successfully',
//                 data: {}
//             })
//         }
//     })
//
// })

app.post('/login', (req, res) => {
    const {username, password} = req.body;
    console.log(`${username} is trying to login ..`);
    con = connectionRequest()
    con.query('Select name, password from admindata where name = ? and password = ?', [username, password], (error, result) => {
        if (error) {
            res.status(404).json({
                message: 'Admin registration failed',
                data: {"error": error}
            })
            con.destroy()
        } else {
            if (result.length === 1) {

                con.destroy()
                return res.status(201).json({
                    message: 'Admin logged in successfully',
                    data: {
                        token: jsonwebtoken.sign({user: "admin"}, JWT_SECRET, {expiresIn: 86400})
                    }
                })
            } else {

                con.destroy()
                return res.status(201).json({
                    message: "The username and password your provided are invalid",
                    data: "error"
                });
               // con.destroy()
            }
        }
    })
})


app.get('/switch-website', (req, res) => {
    if (process.env.WEB_ON === "true") {
        process.env.WEB_ON = "false"
    } else {
        process.env.WEB_ON = "true"
    }
    res.status(200).json({
        message: 'Toggling website',
        data: process.env.WEB_ON
    })
})

app.get('/get-switch-website-details', (req, res) => {

    res.status(200).json({
        message: 'Success',
        data: process.env.WEB_ON
    })
})


