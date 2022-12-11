const express = require('express')
const mysql = require('mysql2')
const app = express()
const http = require('http')
const jsonwebtoken = require("jsonwebtoken");
const JWT_SECRET =
    "goK!pusp6ThEdURUtRenOwUhAsWUCLheBazl!uJLPlS8EbreWLdrupIwabRAsiBu";

const port = 3000

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

const con = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'janamjanam',
    database: 'userdata'
})


con.connect((err) =>{
    if(err){
        console.log(err)
    }
    else{
        console.log("Database connection established")
    }
})


const verifyToken = (req, res, next) => {
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        jsonwebtoken.verify(req.headers.authorization.split(' ')[1], JWT_SECRET, function (err, decode) {
            if (err) {
                return res.status(400).json({message:"some error occurred for JWT:" + err})
            }
            else
            {
                next()
            }
        });
    } else {
        return res.status(400).json({message:"invalid jwt token"})
    }
};


app.listen(3000, (error)=>{
    if(error){
        console.log(error)
    } else{
        console.log("Server coonected on port 3000")
    }
})

app.post('/post-in-queue', (req, res) =>{
    const dateCreated = new Date()
    const name = req.body.name;
    const mobile = req.body.mobile;
    const people = req.body.people;
    const game = req.body.game

    con.query('insert into userdata(dateCreated, name, mobile, people, game) values(?, ?, ?, ?, ?)',[dateCreated, name, mobile, people, game], (error, result)=>{
        if(error){
            res.status(404).json({
                message: 'Could not enter user data',
                data : {}
            })
        } else{
            res.status(201).json({
                message: 'User data entered successfully',
                data : {}
            })
        }
    })
})


app.get('/get-count', (req, res) =>{

    var bowl = 0;
    var billiards = 0;

    con.query('SELECT SUM(IF(game = "Bowling", 1, 0)) AS bowling, SUM(IF(game = "Billiards", 1, 0)) AS billiards FROM userdata', (error, result)=>{
        if(error){
            res.status(500).json({
                message: 'Server Error.',
                data: {}
            })
        } else{
            bowl = result[0]['bowling'];
            billiards = result[0]['billiards'];
            var data = {"message": "success", "bowling": bowl, "billiards": billiards};
            res.status(201).json({
                message: 'Count of people',
                data : data
            })
        }
    })
})

app.get('/get-queue',verifyToken, (req, res) =>{

    con.query('SELECT * FROM userdata ORDER BY dateCreated', (error, result)=>{
        if(error){
            console.log('Something went wrong ' + error)
        } else{
            var data = result;
            res.status(201).json({
                message: 'Success',
                data : data
            })
        }
    })
})


app.delete('/remove-queue/:id', (req, res) =>{

    var token = req.params.id;
    console.log(token)

    con.query('DELETE FROM userdata WHERE token_id = ?',[token], (error, result)=>{
        if(error){
            console.log('Something went wrong ' + error)
            res.status(404).json({
                message: 'Token ID Not Found',
                data: null
            })

        } else{
            var data = {"message": "success"};
            res.status(200).json({
                message: 'Token data is deleted successfully and removed from the queue',
                data : data
            });
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

app.post('/register', (req, res) =>{

    var username = req.body.name;
    var password = req.body.password;
    console.log(password);
    // Encrypting the data using the password key
    var encrypted_name = crypto.AES.encrypt(username, key).toString();
    var encrypted_password = crypto.AES.encrypt(password, key).toString();
    console.log(encrypted_password)

    con.query('insert into admindata(name, password) values(?, ?)',[encrypted_name, encrypted_password], (error, result)=>{
        if(error){
            res.status(404).json({
                message: 'Admin registeration failed',
                data: error
            })
        } else{
            res.status(201).json({
                message: 'Admin registered successfully',
                data : {}
            })
        }
    })

})

app.get('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`${username} is trying to login ..`);

    if (username === "admin" && password === "admin") {
        return res.json({
            token: jsonwebtoken.sign({ user: "admin" }, JWT_SECRET, { expiresIn: 86400})
        });
    }
    return res
        .status(401)
        .json({ message: "The username and password your provided are invalid" });
})
