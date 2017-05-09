module.exports = (req, text) => {
  const schema = {
    'org_name': {
      notEmpty: true,
      errorMessage: text.orgNameError
    },
    'org_desc': {
      notEmpty: true,
      errorMessage: 'Organisation description required'
    },
    'user_phone': {
      notEmpty: {
        errorMessage: 'Phone number required'
      },
      isInt: {
        errorMessage: 'Phone number not valid (must only contain numbers'
      },
      isLength: {
        options: [{
          min: 9,
          max: 11
        }],
        errorMessage: 'Phone number not valid (must only contain 10 digits'
      }
    },
    'user_mail': {
      notEmpty: {
        errorMessage: 'Email required'
      },
      isEmail: {
        errorMessage: 'Email not valid'
      }
    },
    'role_name': {
      notEmpty: true,
      errorMessage: 'Role name required'
    },
    'role_desc': {
      notEmpty: true,
      errorMessage: 'Role description required'
    },
    'start_date': {
      notEmpty: {
        errorMessage: 'Start Date required'
      },
      isISO8601: {
        errorMessage: 'Start Date in incorrect format'
      },
      isAfter: {
        errorMessage: 'Start Date cannot be in the past'
      }
    },
    'end_date': {
      notEmpty: {
        errorMessage: 'End Date required'
      },
      isISO8601: {
        errorMessage: 'End Date in incorrect format'
      },
      isAfter: {
        options: [req.body.start_date],
        errorMessage: 'End Date cannot be before the start date'
      }
    },
    'num_vol': {
      notEmpty: {
        errorMessage: 'Number of volunteers needed required'
      },
      isInt: {
        options: [{
          gt: 0
        }],
        errorMessage: 'Volunteer number must be greater than 0'
      }
    }
  };
  return schema;
};
