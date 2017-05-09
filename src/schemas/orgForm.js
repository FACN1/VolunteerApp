module.exports = (req, text) => {
  const schema = {
    'org_name': {
      notEmpty: true,
      errorMessage: text.orgNameError
    },
    'org_desc': {
      notEmpty: true,
      errorMessage: text.orgDescError
    },
    'user_phone': {
      notEmpty: {
        errorMessage: text.orgPhoneEmptyError
      },
      isInt: {
        errorMessage: text.orgPhoneIsIntError
      },
      isLength: {
        options: [{
          min: 9,
          max: 11
        }],
        errorMessage: text.orgPhoneLengthError
      }
    },
    'user_mail': {
      notEmpty: {
        errorMessage: text.orgEmailError
      },
      isEmail: {
        errorMessage: text.orgIsEmailError
      }
    },
    'role_name': {
      notEmpty: true,
      errorMessage: text.orgRolenameError
    },
    'role_desc': {
      notEmpty: true,
      errorMessage: text.orgRoleDescError
    },
    'start_date': {
      notEmpty: {
        errorMessage: text.orgStartdateError
      },
      isISO8601: {
        errorMessage: text.orgStartdateFormtError
      },
      isAfter: {
        errorMessage: text.orgStartdateIsAfterError
      }
    },
    'end_date': {
      notEmpty: {
        errorMessage: text.orgEnddateError
      },
      isISO8601: {
        errorMessage: text.orgEnddateFormtError
      },
      isAfter: {
        options: [req.body.start_date],
        errorMessage: text.orgEnddateIsAfterError
      }
    },
    'num_vol': {
      notEmpty: {
        errorMessage: text.orgVolnumError
      },
      isInt: {
        options: [{
          gt: 0
        }],
        errorMessage: text.orgVolnumIntError
      }
    }
  };
  return schema;
};
