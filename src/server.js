const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const mongodb = require('mongodb');
const ObjectId = require('mongodb').ObjectID;
require('env2')('./config.env');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const app = express();
const MongoClient = mongodb.MongoClient;
const url = process.env.MONGODB_URI;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// set up expressValidator
app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
    let namespace = param.split('.');
    let root = namespace.shift();
    let formParam = root;
    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));
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
      // Find the volunteer roles, sorted by start date
      collection.find({}).sort({'start_date': 1}).toArray((err, result) => {
        if (err) res.send(err);
        else if (result.length) {
          // loop through the dates to make them look the same
          result.forEach((item, index) => {
            const goodsDate = new Date(item.start_date).toDateString();
            result[index].start_date = goodsDate;
            const goodeDate = new Date(item.end_date).toDateString();
            result[index].end_date = goodeDate;
          });
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
  req.checkBody('org_name', 'Organisation name required').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    console.log(errors);
    res.redirect('/orgform');
  } else {
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
          'start_date': new Date(req.body.start_date),
          'end_date': new Date(req.body.end_date),
          'date_added': new Date()
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
  }
});
app.post('/addvolunteer', (req, res) => {
  // validate the form
  req.checkBody('user_fname', 'First Name required').notEmpty();
  req.checkBody('user_fname', 'First Name not valid (must only contain letters)').isAlpha();

  req.checkBody('user_lname', 'Last Name required').notEmpty();
  req.checkBody('user_lname', 'Last Name not valid (must only contain letters)').isAlpha();

  req.checkBody('user_age', 'Age required (must 15 or older)').notEmpty().isInt({gt: 15});

  req.checkBody('user_message', 'Please fill in avaliability').notEmpty();

  req.checkBody('user_phone', 'Please insert phone number').notEmpty();
  req.checkBody('user_phone', 'Phone Number not valid').isNumeric();

  req.checkBody('user_mail', 'Email required').notEmpty();
  req.checkBody('user_mail', 'Email not valid').isEmail();

  req.checkBody('role_id', 'Role Id is not a Mongo DB ID').isMongoId();

  // get the result asynchonously
  req.getValidationResult().then((result) => {
    // only look at first error
    const errors = result.useFirstErrorOnly().array();

    // do something with the validation result
    // errors comes as an array, [] returns as true
    if (errors.length) {
      MongoClient.connect(url, (err, db) => {
        if (err) return ('err: ', err);
        else {
          const collection = db.collection('vol_roles');
          // find collection document where id is equal to the role id
          // make result an array to read easily, take the first element of array
          collection.find({
            '_id': ObjectId(req.body.role_id)
          }).toArray((err, docs) => {
            if (err) return err;
            const data = docs[0];
            // must send as an array to handlebars
            const prefilled = [req.body];
            console.log(prefilled);
            console.log(errors);
            // render form with error data and already filled in inputs
            res.render('form', {
              role: data,
              error: errors,
              prefilled: prefilled
            });
            db.close();
          });
        }
      });
    } else {
      MongoClient.connect(url, (err, db) => {
        if (err) return ('Error connection to DB: ', err);
        else {
          console.log('connection made');
          // object take the data from html page and put in this object
          const role = {
            'user_fname': req.body.user_fname,
            'user_lname': req.body.user_lname,
            'user_age': req.body.user_age,
            'user_message': req.body.user_message,
            'user_phone': req.body.user_phone,
            'user_mail': req.body.user_mail,
            'role_id': req.body.role_id
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
    }
  });
});

app.listen(app.get('port'), () => {
  console.log('Express server running on port: ', app.get('port'));
});
