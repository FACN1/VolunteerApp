const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const app = express();

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs'
}));

app.set('port', process.env.PORT || 3000);
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

app.listen(app.get('port'), () => {
  console.log('Express server running on port: ', app.get('port'));
});
