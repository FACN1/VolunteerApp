const express = require('express');
const path = require('path');

const app = express();

app.set('port', process.env.PORT || 3000);

const options = {
  dotfiles: 'ignore',
  extensions: ['htm', 'html'],
  index: 'main.html'
};

app.use(express.static(path.join(__dirname, '../public'), options));

app.listen(app.get('port'), () => {
  console.log('Express server running on port: ', app.get('port'));
});
