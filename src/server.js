const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const mongodb = require('mongodb');
const ObjectId = require('mongodb').ObjectID;
require('env2')('./config.env');
const bodyParser = require('body-parser');
const app = express();

const MongoClient = mongodb.MongoClient;

const url = process.env.MONGODB_URI;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  helpers: {
    // turn the id into an anchor link with href as querylink to form page
    link: function (id) {
      return '<a href="form?id=' + id + '">متطوع</a>';
    }
  }
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
  const MongoClient = mongodb.MongoClient;
  const url = process.env.MONGODB_URI;

  MongoClient.connect(url, (err, db) => {
    if (err) return ('err: ', err);
    else {
      const collection = db.collection('vol_roles');

      // find collection document where id is equal to the role id
      // make result an array to read easily, take the first element of array
      collection.find({
        '_id': ObjectId(req.query.id)
      }).toArray((err, docs) => {
        if (err) return err;
        const data = docs[0];
        res.render('form', {
          // make object with role as a key and data as value to pass to view
          role: data
        });
        db.close();
      });
    }
  });
});

app.get('/list', (req, res) => {
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
app.post('/addvolunteer', (req, res) => {
  MongoClient.connect(url, (err, db) => {
    if (err) return ('Error connection to DB: ', err);
    else {
      console.log('connection made');
    // object take the data from html page and put in this object
      const role = {
        'user_name': req.body.user_name,
        'user_age': req.body.user_age,
        'user_message': req.body.user_message,
        'user_phone': req.body.user_phone,
        'user_mail': req.body.user_mail
      };
    // connect to the table called vol_volunteer
      const collection = db.collection('vol_volunteer');
    // insert the data in db
      collection.insert(role, {w: 1}, (err, result) => {
        if (err) return ('Error inserting to DB: ', err);
        db.close();
      // redirect the information to the datasubmit page also
        res.render('datasubmit');
      });
    }
  });
});

app.listen(app.get('port'), () => {
  console.log('Express server running on port: ', app.get('port'));
});
