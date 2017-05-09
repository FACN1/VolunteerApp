module.exports = (req, text) => {
  const schema = {
    'user_fname': {
      notEmpty: true,
      errorMessage: text.volFormFNErorr
    },
    'user_lname': {
      notEmpty: true,
      errorMessage: text.volFormLNErorr
    },
    'user_age': {
      notEmpty: {
        errorMessage: text.volFormAgeErorr
      },
      isInt: {
        options: [{
          gt: 15
        }],
        errorMessage: text.volFormAgeISintErorr
      }
    },
    'user_message': {
      notEmpty: true,
      errorMessage: text.volFormAvailErorr
    },
    'user_phone': {
      notEmpty: {
        errorMessage: text.volFormPhoneEmptyErorr
      },
      isInt: {
        errorMessage: text.volFormPhoneIsIntError
      },
      isLength: {
        options: [{
          min: 9,
          max: 11
        }],
        errorMessage: text.volFormPhoneLengthError
      }
    },
    'user_mail': {
      notEmpty: {
        errorMessage: text.volFormEmailError
      },
      isEmail: {
        errorMessage: text.volFormIsEmailError
      }
    }
  };
  return schema;
};
