import * as _ from 'lodash';
import { phoneUtil } from 'libphonenumber';

const PhoneNumberFormat = {
   E164: 0,
   INTERNATIONAL: 1,
   NATIONAL: 2,
   RFC3966: 3
};

const PhoneNumberErrorCodes = {
    IS_POSSIBLE: 0,
    INVALID_COUNTRY_CODE: 1,
    TOO_SHORT: 2,
    TOO_LONG: 3
};

const PhoneNumberErrorReasons = [
    'Number is unknown.',
    'Country code is invalid.',
    'Number is too short.',
    'Number is too long.'
];

/**
 * @class IntlPhoneNumber
 */
class IntlPhoneNumber {
    /**
     * @param  {string} phoneNumber
     */
    constructor(phoneNumber) {
        this.phoneNumber = phoneNumber;
        this.number = phoneUtil.parseAndKeepRawInput(phoneNumber);
    }

    /**
     * Determines if the number is valid.
     * @return {boolean}
     */
    get isValid() {
        return phoneUtil.isValidNumber(this.number) && phoneUtil.isPossibleNumber(this.number);
    }

    /**
     * Returns the country code for the parsed number.
     * @return {string}
     */
    get countryCode() {
        return phoneUtil.getRegionCodeForNumber(this.number);
    }

    /**
     * Returns the e164 format for the parsed number.
     * @return {string}
     */
    get e164Format() {
        return phoneUtil.format(this.number, PhoneNumberFormat.E164);
    }

    /**
     * Returns the national format for the parsed number.
     * @return {string}
     */
    get nationalFormat() {
        return phoneUtil.format(this.number, PhoneNumberFormat.NATIONAL);
    }

    /**
     * Determines the proper error message based on the error code.
     * @return {string}
     */
    get errorMsg() {
        let message = 'Phone number is not valid.';

        let errorCode = this.errorCode;
        let reason = PhoneNumberErrorReasons[errorCode];

        message += ' ' + reason;

        return message;
    }

    /**
     * Determines the error code for a number that was not able to be parsed.
     * @return {number}
     */
    get errorCode() {
        return phoneUtil.isPossibleNumberWithReason(this.number);
    }
}

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
            let phoneNumber = this[options.phoneNumberField];
            let intlPhoneNumber = new IntlPhoneNumber(phoneNumber);

            if(intlPhoneNumber.isValid) {
                let countryCode = intlPhoneNumber.countryCode;
                let e164Format = intlPhoneNumber.e164Format;
                let nationalFormat = intlPhoneNumber.nationalFormat;

                this[options.phoneNumberField] = e164Format;
                this[options.nationalFormatField] = nationalFormat;
                this[options.countryCodeField] = countryCode;
                next();

            } else {
                next(new Error(intlPhoneNumber.errorMsg));
            }

        } catch(e) {
            next(new Error(e));
        }
    });
};
