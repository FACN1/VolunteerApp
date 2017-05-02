const mongodb = require('mongodb');
require('env2')('./config.env');

const MongoClient = mongodb.MongoClient;

const url = process.env.MONGODB_URI;

MongoClient.connect(url, (err, db) => {
  if (err) return ('Error connection to DB: ', err);
  else {
    console.log('connection made');

    const collection = db.collection('vol_roles');

    const role1 = {
      'org_name': 'FAC',
      'org_desc': 'Cool coding bootcamp',
      'phone_num': '0123456789',
      'email': 'fac@fac.fac',
      'role_name': 'mentor',
      'role_desc': 'help people learn coding',
      'num_vlntr_req': '10',
      'start_date': new Date(2017, 6, 1),
      'end_date': new Date(2017, 12, 1)
    };
    const role2 = {
      'org_name': 'Hiba Slave',
      'org_desc': 'Do stuff for hiba',
      'phone_num': '0123456789',
      'email': 'tour@naz.com',
      'role_name': 'slave',
      'role_desc': 'Everything hiba asks, you must do',
      'num_vlntr_req': '4',
      'start_date': new Date(2017, 6, 15),
      'end_date': new Date(2017, 8, 15)
    };
    const role3 = {
      'org_name': 'Naz Middle School',
      'org_desc': 'Best school in Nazareth',
      'phone_num': '0123456789',
      'email': 'school@naz.com',
      'role_name': 'TA',
      'role_desc': 'help teach people',
      'num_vlntr_req': '7',
      'start_date': new Date(2017, 9, 1),
      'end_date': new Date(2018, 3, 1)
    };

    const allRoles = [role1, role2, role3];

    collection.insert(allRoles, {w: 1}, (err, result) => {
      if (err) return ('Error inserting to DB: ', err);
      db.close();
    });
  }
});
