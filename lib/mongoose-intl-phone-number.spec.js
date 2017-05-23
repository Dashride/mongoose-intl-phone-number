'use strict';

const mongoose = require('mongoose');
const expect = require('chai').expect;
const mongooseIntlPhoneNumber = require('./mongoose-intl-phone-number').mongooseIntlPhoneNumber;

const Schema = mongoose.Schema;
let connection;

mongoose.Promise = global.Promise;

function customerSchema() {
    return new Schema({
        firstName: { type: String },
        lastName: { type: String },
        customerType: { type: String },
        phoneNumber: { type: String },
        countryCode: { type: String },
        nationalFormat: { type: String },
        internationalFormat: { type: String },
        email: { type: String }
    });
}

function customerSubocOverrideSchema() {
    return new Schema({
        firstName: { type: String },
        lastName: { type: String },
        customerType: { type: String },
        contact: {
            phoneNumber: { type: String },
            email: { type: String }
        }
    });
}

describe('Mongoose plugin: mongoose-intl-phone-number', function() {
    before((done) => {
        connection = mongoose.createConnection(process.env.MONGO_URL || 'mongodb://localhost/unit_test');
        connection.once('connected', done);
    });

    after((done) => {
        connection.db.dropDatabase(() => {
            connection.close(done);
        });
    });

    describe('with default settings', function() {
        let testSchema;
        let Customer;

        before(function() {
            testSchema = customerSchema();
            testSchema.plugin(mongooseIntlPhoneNumber);
            Customer = connection.model('Customer', testSchema);
        });

        it('should parse the phone number and store the data to their default fields', function() {
            const customer = new Customer({
                firstName: 'test',
                lastName: 'customer',
                customerType: 'testing',
                phoneNumber: '+18888675309',
                email: 'test@testing.com'
            });

            return customer.save(function(customer) {
                expect(customer.phoneNumber).to.equal('+18888675309');
                expect(customer.nationalFormat).to.equal('(888) 867-5309');
                expect(customer.internationalFormat).to.equal('+1 888-867-5309');
                expect(customer.countryCode).to.equal('US');
            });
        });

        it('should not throw an error if the number was incorrect and not directly modified', function() {
            const customer = new Customer({
                firstName: 'test',
                lastName: 'customer',
                customerType: 'testing',
                phoneNumber: '+18888675309',
                email: 'test@testing.com'
            });

            return customer.save().then((customer) => {
                return Customer.findOneAndUpdate({
                    _id: customer._id
                }, {
                    $set: {
                        phoneNumber: '+188886753099'
                    }
                }, {
                    new: true
                }).exec();
            }).then((customer) => {
                customer.firstName = 'testing';
                return customer.save();
            }).then((customer) => {
                expect(customer.phoneNumber).to.equal('+188886753099');
                expect(customer.firstName).to.equal('testing');
            });
        });

        it('should throw an error if the number was directly modified and incorrect', function() {
            const customer = new Customer({
                firstName: 'test',
                lastName: 'customer',
                customerType: 'testing',
                phoneNumber: '+18888675309',
                email: 'test@testing.com'
            });

            return customer.save().then((customer) => {
                customer.phoneNumber = '+188886753099';
                return customer.save();
            }).then((customer) => {
                throw new Error('No error was thrown');
            }).catch((err) => {
                expect(err.message).to.equal('Phone number is not valid. Number is too long.');
            });
        });

        it('should throw an error if the number is too long', function() {
            const customer = new Customer({
                firstName: 'test',
                lastName: 'customer',
                customerType: 'testing',
                phoneNumber: '+188886753099',
                email: 'test@testing.com'
            });

            return customer.save().then((customer) => {
                throw new Error('no error was thrown');
            }).catch((err) => {
                expect(err.message).to.equal('Phone number is not valid. Number is too long.');
            });
        });

        it('should throw an error if the number is too short', function() {
            const customer = new Customer({
                firstName: 'test',
                lastName: 'customer',
                customerType: 'testing',
                phoneNumber: '+1888867',
                email: 'test@testing.com'
            });

            return customer.save().then((customer) => {
                throw new Error('no error was thrown');
            }).catch((err) => {
                expect(err.message).to.equal('Phone number is not valid. Number is too short.');
            });
        });

        it('should throw an error if the number does not have a valid country code', function() {
            const customer = new Customer({
                firstName: 'test',
                lastName: 'customer',
                customerType: 'testing',
                phoneNumber: '8888675309',
                email: 'test@testing.com'
            });

            return customer.save().then((customer) => {
                throw new Error('no error was thrown');
            }).catch((err) => {
                expect(err.message).to.equal('Invalid country calling code');
            });
        });

        it('should throw an error if the number is unknown', function() {
            const customer = new Customer({
                firstName: 'test',
                lastName: 'customer',
                customerType: 'testing',
                phoneNumber: '+19999999999',
                email: 'test@testing.com'
            });

            return customer.save().then((customer) => {
                throw new Error('no error was thrown');
            }).catch((err) => {
                expect(err.message).to.equal('Phone number is not valid. Number is unknown.');
            });
        });

        it('should throw an error if the number is an unknown local number', function() {
            const customer = new Customer({
                firstName: 'test',
                lastName: 'customer',
                customerType: 'testing',
                phoneNumber: '+1 2530000',
                email: 'test@testing.com'
            });

            return customer.save().then((customer) => {
                throw new Error('no error was thrown');
            }).catch((err) => {
                expect(err.message).to.equal('Phone number is not valid. Number is an unknown local number.');
            });
        });
    });

    describe('with default overrides', function() {
        let testSchema;
        let CustomerOverrides;

        before(function() {
            testSchema = customerSchema();
            testSchema.plugin(mongooseIntlPhoneNumber, {
                hook: 'save',
                phoneNumberField: 'phoneNumber',
                nationalFormatField: 'ntlFormat',
                internationalFormatField: 'intlFormat',
                countryCodeField: 'ccode',
            });
            CustomerOverrides = connection.model('CustomerOverrides', testSchema);
        });

        it('should parse the phone number and store the data to the specified fields', function() {
            const customer = new CustomerOverrides({
                firstName: 'test',
                lastName: 'customer',
                customerType: 'testing',
                phoneNumber: '+18888675309',
                email: 'test@testing.com'
            });

            return customer.save().then(() => {
                expect(customer.phoneNumber).to.equal('+18888675309');
                expect(customer.ntlFormat).to.equal('(888) 867-5309');
                expect(customer.intlFormat).to.equal('+1 888-867-5309');
                expect(customer.ccode).to.equal('US');
            });
        });
    });

    describe('with subdoc and default overrides', function() {
        let testSchema;
        let CustomerSubdocOverrides;

        before(function() {
            testSchema = customerSubocOverrideSchema();
            testSchema.plugin(mongooseIntlPhoneNumber, {
                hook: 'save',
                phoneNumberField: 'contact.phoneNumber',
                nationalFormatField: 'contact.nationalFormat',
                internationalFormatField: 'contact.internationalFormat',
                countryCodeField: 'contact.countryCode',
            });
            CustomerSubdocOverrides = connection.model('CustomerSubdocOverrides', testSchema);
        });

        it('should parse the phone number and store the data to the specified fields', function() {
            const customer = new CustomerSubdocOverrides({
                firstName: 'test',
                lastName: 'customer',
                customerType: 'testing',
                contact: {
                    phoneNumber: '+18888675309',
                    email: 'test@testing.com'
                }
            });

            return customer.save().then(() => {
                expect(customer.contact.phoneNumber).to.equal('+18888675309');
                expect(customer.contact.nationalFormat).to.equal('(888) 867-5309');
                expect(customer.contact.internationalFormat).to.equal('+1 888-867-5309');
                expect(customer.contact.countryCode).to.equal('US');
            });
        });
    });
});
