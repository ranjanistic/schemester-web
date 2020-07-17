const express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    view = require('./hardcodes/views'),
    code = require('./hardcodes/events'),
    auth = require('./workers/session'),
    jwt = require("jsonwebtoken"),
    admin = require('./routes/admin'),
    teacher = require('./routes/teacher'),
    database = require("./config/db"),
    session = require("./workers/session"),
    app = express();

// Initiate Mongo Server
database.getServer()
    .then(db=>console.log(`Connected: ${db.connection.name}`))
    .catch(error=>console.log(error));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'));
app.use('/admin', admin);
app.use('/teacher',teacher);

app.get('/', (req,res)=>{
    res.render(view.loader);
});
app.get('/home', (req,res)=>{
    view.render(res,view.homepage);
});

app.get('/plans/',(_request,res)=>{
    view.render(res,view.plans);
});


app.get('/404', (req, res, next)=>{
    next();
});
app.get('/403', (req, res, next)=>{
    var err = new Error('not allowed!');
    err.status = 403;
    next(err);
});
app.get('/500', (req, res, next)=>{
    next(new Error('keyboard cat!'));
});

app.use((req, res, next)=>{
    res.status(404);
    res.format({
        html: function () {
        res.render('404', { url: req.url })
        },
        json: function () {
        res.json({ error: 'Not found' })
        },
        default: function () {
        res.type('txt').send('Not found')
        }
    })
});

app.use((err, req, res, next)=>{
    res.status(err.status || 500);
    res.render('500', { error: err });
});

app.listen(3000, _=> {
    console.log('listening on 3000');
})