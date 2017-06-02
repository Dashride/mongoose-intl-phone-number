'use strict';

const PhoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil;

const phoneUtil = PhoneNumberUtil.getInstance();

const PhoneNumberFormat = {
    E164: 0,
    INTERNATIONAL: 1,
    NATIONAL: 2,
    RFC3966: 3
};

// https://github.com/seegno/google-libphonenumber/blob/4a210137662fd1d4c2d9d37f54c3f6c366458985/src/phonenumberutil.js#L965
const PhoneNumberErrorCodes = {
    IS_POSSIBLE: 0,
    INVALID_COUNTRY_CODE: 1,
    TOO_SHORT: 2,
    TOO_LONG: 3,
    IS_POSSIBLE_LOCAL_ONLY: 4,
    INVALID_LENGTH: 5,
};

const PhoneNumberErrorReasons = [
    'Number is unknown.',
    'Country code is invalid.',
    'Number is too short.',
    'Number is too long.',
    'Number is an unknown local number.',
    'Number length is invalid for this region.',
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
     * Returns the international format for the parsed number.
     * @return {string}
     */
    get internationalFormat() {
        return phoneUtil.format(this.number, PhoneNumberFormat.INTERNATIONAL);
    }

    /**
     * Determines the proper error message based on the error code.
     * @return {string}
     */
    get errorMsg() {
        let message = 'Phone number is not valid.';

        const errorCode = this.errorCode;
        const reason = PhoneNumberErrorReasons[errorCode];

        if (reason) {
            message += ' ' + reason;
        }

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

exports.IntlPhoneNumber = IntlPhoneNumber;
