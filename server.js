const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const data = fs.readFileSync('./database.json');
const conf = JSON.parse(data);
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: conf.host,
    user: conf.user,
    password: conf.password,
    prot: conf.port,
    database: conf.database
});

connection.connect();

const multer = require('multer');
const upload = multer({
    dest: './upload'
})


app.get('/api/customers', (req,res)=>{
    connection.query("select * from customer where isDeleted=0", (err, rows, fields)=>{
        res.send(rows);
    })
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use('/image', express.static('./upload'));
app.post('/api/customers', upload.single('image'), (req, res) => {
    let sql = 'Insert into customer values (null, ?, ?, ?, ?, now(), 0)';
    let image = '/image/' + req.file.filename;
    let name = req.body.name;
    let gender = req.body.gender;
    let job = req.body.job;
    let params = [image, name, gender, job];
    connection.query(sql, params, (err, rows, fields) => {
        res.send(rows);
    })
});

app.delete('/api/customers/:id', (req,res)=>{
    let sql = 'UPDATE customer SET isDeleted = 1 WHERE _id = ?';
    let params = [req.params.id];
    connection.query(sql, params, (err, rows, fields) => {
        res.send(rows);
    })
})

app.get('/', (req, res) => {
    res.redirect("http://justinjungkorea.github.io/management_client/");
});
app.listen(PORT,()=>console.log(`✅Listening on port ${PORT}`));