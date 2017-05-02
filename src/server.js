const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const mongodb = require('mongodb');
require('env2')('./config.env');

const app = express();

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
app.listen(app.get('port'), () => {
  console.log('Express server running on port: ', app.get('port'));
});
