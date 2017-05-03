const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const mongodb = require('mongodb');
require('env2')('./config.env');
const bodyParser = require('body-parser');
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs'
}));

app.set('port', process.env.PORT || 8080);
app.set('view engine', '.hbs');

const options = {
  dotfiles: 'ignore',
  extensions: ['htm', 'html'],
  index: false
};

app.use(express.static(path.join(__dirname, '../public'), options));

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/form', (req, res) => {
  res.render('form');
});

app.get('/list', (req, res) => {
  const MongoClient = mongodb.MongoClient;
  const url = process.env.MONGODB_URI;

  MongoClient.connect(url, (err, db) => {
    if (err) return ('err: ', err);
    else {
      console.log('connection made');
      const collection = db.collection('vol_roles');
      collection.find({}).toArray((err, result) => {
        if (err) res.send(err);
        else if (result.length) {
          res.render('list', {
            'roleList': result
          });
        } else {
          res.send('No roles found');
        }
        db.close();
      });
    }
  });
});

app.get('/orgform', (req, res) => {
  res.render('orgform');
});

app.post('/addrole', (req, res) => {
  const mongodb = require('mongodb');
  require('env2')('./config.env');

  const MongoClient = mongodb.MongoClient;

  const url = process.env.MONGODB_URI;

  MongoClient.connect(url, (err, db) => {
    if (err) return ('Error connection to DB: ', err);
    else {
      console.log('connection made');
      // object take the data from html page and put in this object
      const role = {
        'org_name': req.body.org_name,
        'org_desc': req.body.org_desc,
        'phone_num': req.body.user_phone,
        'email': req.body.user_mail,
        'role_name': req.body.role_name,
        'role_desc': req.body.role_desc,
        'num_vlntr_req': req.body.num_vol,
        'start_date': req.body.start_date,
        'end_date': req.body.end_date
      };
      // connect to the table called vol_roles
      const collection = db.collection('vol_roles');
      // insert the data in db
      collection.insert(role, {w: 1}, (err, result) => {
        if (err) return ('Error inserting to DB: ', err);
        db.close();
        // redirect the information to the list page also
        res.redirect('/list');
      });
    }
  });
});

app.listen(app.get('port'), () => {
  console.log('Express server running on port: ', app.get('port'));
});
