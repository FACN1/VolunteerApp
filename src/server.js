const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const mongodb = require('mongodb');
const ObjectId = require('mongodb').ObjectID;
const favicon = require('serve-favicon');
const schema = require('./schemas/index.js');
const functions = require('./functions.js');

require('env2')('./config.env');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const app = express();
const MongoClient = mongodb.MongoClient;
const url = process.env.MONGODB_URI;

// import the languages object and set the default language and text dir for arabic
const languages = require('./languages.js');
let language = 'arabic';
let text = languages[language];
let dir = 'rtl';

// set the port
app.set('port', process.env.PORT || 8080);

// set the local variables of the language
app.locals.dir = dir;
app.locals.text = text;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// serve the favicon
app.use(favicon(path.join(__dirname, '../public/assets/', 'favicon.ico')));

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

// set up handlebars
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  helpers: {
    // turn the id into an anchor link with href as querylink to form page
    link: function (id) {
      return '<a class="altbg shadow-2 w3 mw4 tc brown link grow f5 ba br3 pa2 bg-leave" href="form?id=' + id + '">' + text.applyButton + '</a>';
    }
  }
}));
app.set('view engine', '.hbs');

// serve static files
const options = {
  dotfiles: 'ignore',
  extensions: ['htm', 'html'],
  index: false
};
app.use(express.static(path.join(__dirname, '../public'), options));

// set the response locals to the same as the app locals
app.use((req, res, next) => {
  res.locals = app.locals;
  next();
});

app.get('/', (req, res) => {
  res.render('home');
});

// Handler for the language change radio button
app.post('/langChange', (req, res) => {
  // Get the language selected
  language = req.body.language;
  // set text to the language selected
  text = languages[language];
  // change the text direction for the language
  if (language === 'english') {
    dir = 'ltr';
  } else {
    dir = 'rtl';
  }
  // change the locals
  app.locals.dir = dir;
  app.locals.text = text;

  // redirect back to the page the post request came from unless from 2 specific pages
  if (req.headers.referer === 'http://localhost:8080/addvolunteer') {
    res.redirect('list');
  } else if ((req.headers.referer === 'http://localhost:8080/orgform') || (req.headers.referer === 'http://localhost:8080/addrole')) {
    res.redirect('login');
  } else {
    res.redirect(req.headers.referer);
  }
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
        const goodSDate = functions.convertDate(data.start_date);
        data.start_date = goodSDate;
        const goodEDate = functions.convertDate(data.end_date);
        data.end_date = goodEDate;
        res.render('form', {
          // make object with role as a key and data as value to pass to view
          role: data,
          headline: text.formHeader
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
            const goodSDate = functions.convertDate(item.start_date);
            result[index].start_date = goodSDate;
            const goodEDate = functions.convertDate(item.end_date);
            result[index].end_date = goodEDate;
          });
          res.render('list', {
            'roleList': result,
            'headline': text.listHeader
          });
        } else {
          res.send('No roles found');
        }
        db.close();
      });
    }
  });
});
// addrole- its deal with orgform and we validate orgform
app.post('/addrole', (req, res) => {
  req.checkBody(schema.orgForm(req, text));

  req.getValidationResult().then((result) => {
    const errors = result.useFirstErrorOnly().array();
    // if the length of the errors array its big than zero its mean we have error validate in the form and we have to deal with this errors
    if (errors.length) {
      // take the information we filled and put in array
      const prefilled = [req.body];
      res.render('orgform', {
        error: errors,
        prefilled: prefilled,
        headline: text.orgFormHeader
      });
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
             // add the date that the client fill the form
            'date_added': new Date()
          };
          // connect to the table called vol_roles
          const collection = db.collection('vol_roles');
          // insert the data in db
          collection.insert(role, {w: 1}, (err, result) => {
            if (err) return ('Error inserting to DB: ', err);
            db.close();
            // redirect the information to the list page also
            res.redirect('/list', {
              headline: text.listHeader
            });
          });
        }
      });
    }
  });
});
app.post('/addvolunteer', (req, res) => {
  // validate the form
  req.checkBody(schema.volForm(req, text));

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
            // render form with error data and already filled in inputs
            res.render('form', {
              role: data,
              error: errors,
              prefilled: prefilled,
              headline: text.formHeader
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
            res.render('datasubmit', {
              headline: text.submitHeader
            });
          });
        }
      });
    }
  });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/orgform', (req, res) => {
  if (req.body.password === process.env.PASSWORD) {
    res.render('orgform', {
      headline: text.orgFormHeader
    });
  } else {
    res.render('login', {
      error: text.wrongPassword
    });
  }
});

app.listen(app.get('port'), () => {
  console.log('Express server running on port: ', app.get('port'));
});
