'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.mongooseIntlPhoneNumber = undefined;

var _intlPhoneNumber = require('./intl-phone-number');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
    internationalFormat: 'internationalFormat',
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
    "internationalFormat": "+1 888-867-5309"
    "countryCode": "US"
}
 ```
 */
/**
 * Attaches the mongoose document hook and parses the phone number that is provided.
 * @param  {object} schema - Mongoose schema
 * @param  {object} [options]
 * @param  {string} [options.hook=validate]
 * @param  {string} [options.phoneNumberField=phoneNumber]
 * @param  {string} [options.nationalFormatField=nationalFormat]
 * @param  {string} [options.internationalFormatField=internationalFormat]
 * @param  {string} [options.countryCodeField=countryCode]
 */
function mongooseIntlPhoneNumber(schema) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$hook = _ref.hook,
        hook = _ref$hook === undefined ? 'validate' : _ref$hook,
        _ref$phoneNumberField = _ref.phoneNumberField,
        phoneNumberField = _ref$phoneNumberField === undefined ? 'phoneNumber' : _ref$phoneNumberField,
        _ref$nationalFormatFi = _ref.nationalFormatField,
        nationalFormatField = _ref$nationalFormatFi === undefined ? 'nationalFormat' : _ref$nationalFormatFi,
        _ref$internationalFor = _ref.internationalFormatField,
        internationalFormatField = _ref$internationalFor === undefined ? 'internationalFormat' : _ref$internationalFor,
        _ref$countryCodeField = _ref.countryCodeField,
        countryCodeField = _ref$countryCodeField === undefined ? 'countryCode' : _ref$countryCodeField,
        _ref$optionalPhoneNum = _ref.optionalPhoneNumber,
        optionalPhoneNumber = _ref$optionalPhoneNum === undefined ? false : _ref$optionalPhoneNum;

    // If paths don't exist in schema add them
    [phoneNumberField, nationalFormatField, internationalFormatField, countryCodeField].forEach(function (path) {
        if (!schema.path(path)) {
            schema.add(_defineProperty({}, path, { type: String }));
        }
    });

    schema.pre(hook, function parsePhoneNumber(next) {
        // Only return validation errors if the document is new or phone number has been modified.
        var phoneNumber = this.get(phoneNumberField);
        if ((this.isNew || this.isDirectModified(phoneNumberField)) && (!optionalPhoneNumber || optionalPhoneNumber && phoneNumber !== undefined && phoneNumber !== "" && phoneNumber !== null)) {
            try {
                var intlPhoneNumber = new _intlPhoneNumber.IntlPhoneNumber(phoneNumber);

                if (intlPhoneNumber.isValid) {
                    this.set(phoneNumberField, intlPhoneNumber.e164Format);
                    this.set(nationalFormatField, intlPhoneNumber.nationalFormat);
                    this.set(internationalFormatField, intlPhoneNumber.internationalFormat);
                    this.set(countryCodeField, intlPhoneNumber.countryCode);
                    next();
                } else {
                    next(new Error(intlPhoneNumber.errorMsg));
                }
            } catch (e) {
                next(e);
            }
        } else {
            next();
        }
    });
}

exports.mongooseIntlPhoneNumber = mongooseIntlPhoneNumber;