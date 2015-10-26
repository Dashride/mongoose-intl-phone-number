'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _intlPhoneNumber = require('./intl-phone-number');

/**
 * @module mongooseIntlPhoneNumber
 * @desc Validates a phone number against google's libphonenumber, otherwise returns a validation error.
 * @example
 ```js
var mongooseIntlPhoneNumber = require('mongoose-intl-phone-number');
var schema = Schema({...});

schema.plugin(mongooseIntlPhoneNumber, {
    hook: 'validate',
    phoneNumberField: 'phoneNumber',
    nationalFormatField: 'nationalFormat',
    countryCodeField: 'countryCode',
});
```
Use it with a model...
```js
var Customer = mongoose.model('Customer');

var customer = new Customer({
    firstName: 'test',
    lastName: 'customer',
    customerType: 'testing',
    phoneNumber: '+18888675309',
    email: 'test@testing.com'
});

customer.save();
```

Resulting document...
```js
{
    "firstName": "test",
    "lastName": "customer",
    "customerType": "testing",
    "phoneNumber": "+18888675309",
    "nationalFormat": "(888) 867-5309",
    "countryCode": "US"
}
 ```
 */
module.exports = function mongooseIntlPhoneNumber(schema, options) {
    /**
    * @param  {object} options
    * @param  {string} options.hook=validate
    * @param  {string} options.phoneNumberField=phoneNumber
    * @param  {string} options.nationalFormatField=nationalFormat
    * @param  {string} options.phoneNumberField=countryCode
    */
    options = _.merge({
        hook: 'validate',
        phoneNumberField: 'phoneNumber',
        nationalFormatField: 'nationalFormat',
        countryCodeField: 'countryCode'
    }, options || {});

    schema.pre(options.hook, function parsePhoneNumber(next) {
        try {
            var phoneNumber = this[options.phoneNumberField];
            var intlPhoneNumber = new _intlPhoneNumber.IntlPhoneNumber(phoneNumber);

            if (intlPhoneNumber.isValid) {
                var countryCode = intlPhoneNumber.countryCode;
                var e164Format = intlPhoneNumber.e164Format;
                var nationalFormat = intlPhoneNumber.nationalFormat;

                this[options.phoneNumberField] = e164Format;
                this[options.nationalFormatField] = nationalFormat;
                this[options.countryCodeField] = countryCode;
                next();
            } else {
                next(new Error(intlPhoneNumber.errorMsg));
            }
        } catch (e) {
            next(new Error(e));
        }
    });
};