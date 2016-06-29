'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.IntlPhoneNumber = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _googleLibphonenumber = require('google-libphonenumber');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var phoneUtil = _googleLibphonenumber.PhoneNumberUtil.getInstance();

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

var IntlPhoneNumber = function () {
    /**
     * @param  {string} phoneNumber
     */

    function IntlPhoneNumber(phoneNumber) {
        _classCallCheck(this, IntlPhoneNumber);

        this.phoneNumber = phoneNumber;
        this.number = phoneUtil.parseAndKeepRawInput(phoneNumber);
    }

    /**
     * Determines if the number is valid.
     * @return {boolean}
     */


    _createClass(IntlPhoneNumber, [{
        key: 'isValid',
        get: function get() {
            return phoneUtil.isValidNumber(this.number) && phoneUtil.isPossibleNumber(this.number);
        }

        /**
         * Returns the country code for the parsed number.
         * @return {string}
         */

    }, {
        key: 'countryCode',
        get: function get() {
            return phoneUtil.getRegionCodeForNumber(this.number);
        }

        /**
         * Returns the e164 format for the parsed number.
         * @return {string}
         */

    }, {
        key: 'e164Format',
        get: function get() {
            return phoneUtil.format(this.number, PhoneNumberFormat.E164);
        }

        /**
         * Returns the national format for the parsed number.
         * @return {string}
         */

    }, {
        key: 'nationalFormat',
        get: function get() {
            return phoneUtil.format(this.number, PhoneNumberFormat.NATIONAL);
        }

        /**
         * Returns the international format for the parsed number.
         * @return {string}
         */

    }, {
        key: 'internationalFormat',
        get: function get() {
            return phoneUtil.format(this.number, PhoneNumberFormat.INTERNATIONAL);
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
            return phoneUtil.isPossibleNumberWithReason(this.number);
        }
    }]);

    return IntlPhoneNumber;
}();

exports.IntlPhoneNumber = IntlPhoneNumber;