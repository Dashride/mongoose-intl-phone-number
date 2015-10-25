'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _libphonenumber = require('libphonenumber');

var PhoneNumberFormat = {
    E164: 0,
    INTERNATIONAL: 1,
    NATIONAL: 2,
    RFC3966: 3
};

var PhoneNumberErrorCodes = {
    IS_POSSIBLE: 0,
    INVALID_COUNTRY_CODE: 1,
    TOO_SHORT: 2,
    TOO_LONG: 3
};

var PhoneNumberErrorReasons = ['Number is unknown.', 'Country code is invalid.', 'Number is too short.', 'Number is too long.'];

/**
 * @class IntlPhoneNumber
 */

var IntlPhoneNumber = (function () {
    /**
     * @param  {string} phoneNumber
     */

    function IntlPhoneNumber(phoneNumber) {
        _classCallCheck(this, IntlPhoneNumber);

        this.phoneNumber = phoneNumber;
        this.number = _libphonenumber.phoneUtil.parseAndKeepRawInput(phoneNumber);
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

    /**
     * Determines if the number is valid.
     * @return {boolean}
     */

    _createClass(IntlPhoneNumber, [{
        key: 'isValid',
        get: function get() {
            return _libphonenumber.phoneUtil.isValidNumber(this.number) && _libphonenumber.phoneUtil.isPossibleNumber(this.number);
        }

        /**
         * Returns the country code for the parsed number.
         * @return {string}
         */
    }, {
        key: 'countryCode',
        get: function get() {
            return _libphonenumber.phoneUtil.getRegionCodeForNumber(this.number);
        }

        /**
         * Returns the e164 format for the parsed number.
         * @return {string}
         */
    }, {
        key: 'e164Format',
        get: function get() {
            return _libphonenumber.phoneUtil.format(this.number, PhoneNumberFormat.E164);
        }

        /**
         * Returns the national format for the parsed number.
         * @return {string}
         */
    }, {
        key: 'nationalFormat',
        get: function get() {
            return _libphonenumber.phoneUtil.format(this.number, PhoneNumberFormat.NATIONAL);
        }

        /**
         * Determines the proper error message based on the error code.
         * @return {string}
         */
    }, {
        key: 'errorMsg',
        get: function get() {
            var message = 'Phone number is not valid.';

            var errorCode = this.errorCode;
            var reason = PhoneNumberErrorReasons[errorCode];

            message += ' ' + reason;

            return message;
        }

        /**
         * Determines the error code for a number that was not able to be parsed.
         * @return {number}
         */
    }, {
        key: 'errorCode',
        get: function get() {
            return _libphonenumber.phoneUtil.isPossibleNumberWithReason(this.number);
        }
    }]);

    return IntlPhoneNumber;
})();

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
            var intlPhoneNumber = new IntlPhoneNumber(phoneNumber);

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