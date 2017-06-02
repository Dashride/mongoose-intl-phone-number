mongoose-intl-phone-number
====================
[![Build Status](https://travis-ci.org/Dashride/mongoose-intl-phone-number.svg?branch=master)](https://travis-ci.org/Dashride/mongoose-intl-phone-number)
[![Coverage Status](https://coveralls.io/repos/Dashride/mongoose-intl-phone-number/badge.svg?branch=master&service=github)](https://coveralls.io/github/Dashride/mongoose-intl-phone-number?branch=master)
[![Dependency Status](https://david-dm.org/Dashride/mongoose-intl-phone-number.svg)](https://david-dm.org/Dashride/mongoose-intl-phone-number)
[![npm version](https://badge.fury.io/js/mongoose-intl-phone-number.svg)](http://badge.fury.io/js/mongoose-intl-phone-number)

This module takes a string of numbers and determines their validity as well as returns data about the phone numbers. This module is based on Google's [libphonenumber](https://github.com/mattbornski/libphonenumber).

## How it works
A phone number is provided on the document, during the pre-save/validate hook (you can specify), it runs the phone number through [libphonenumber](https://github.com/mattbornski/libphonenumber) and stores the data returned onto fields in the document model.

## Use Case
Applications that accept international phone numbers should use this plugin to gather and store information about the number such as country code, national format, etc.

## Installation

`npm install --save mongoose-intl-phone-number`

## API Reference
<a name="module_mongooseIntlPhoneNumber"></a>

## mongooseIntlPhoneNumber
Validates a phone number against google's libphonenumber, otherwise returns a validation error.

**Example**  
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
<a name="module_mongooseIntlPhoneNumber..mongooseIntlPhoneNumber"></a>

### mongooseIntlPhoneNumber~mongooseIntlPhoneNumber(schema, [options])
Attaches the mongoose document hook and parses the phone number that is provided.

**Kind**: inner method of <code>[mongooseIntlPhoneNumber](#module_mongooseIntlPhoneNumber)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| schema | <code>object</code> |  | Mongoose schema |
| [options] | <code>object</code> |  |  |
| [options.hook] | <code>string</code> | <code>&quot;validate&quot;</code> |  |
| [options.phoneNumberField] | <code>string</code> | <code>&quot;phoneNumber&quot;</code> |  |
| [options.nationalFormatField] | <code>string</code> | <code>&quot;nationalFormat&quot;</code> |  |
| [options.internationalFormatField] | <code>string</code> | <code>&quot;internationalFormat&quot;</code> |  |
| [options.countryCodeField] | <code>string</code> | <code>&quot;countryCode&quot;</code> |  |

