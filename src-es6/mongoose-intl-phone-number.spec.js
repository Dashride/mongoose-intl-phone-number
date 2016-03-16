import mongoose from 'mongoose';
import { expect } from 'chai';
import { mongooseIntlPhoneNumber } from './mongoose-intl-phone-number';

var Schema = mongoose.Schema,
    connection;

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
        connection = mongoose.createConnection('mongodb://192.168.99.100:32780/unit_test');
        connection.once('connected', () => {
            done();
        });
    });

    after((done) => {
        connection.db.dropDatabase(() => {
            connection.close(() => {
                done();
            });
        });
    });

    describe('with default settings', function() {
        var testSchema, Customer;

        before(function() {
            testSchema = customerSchema();
            Customer = connection.model('Customer', testSchema);
            testSchema.plugin(mongooseIntlPhoneNumber);
        });

        it('should parse the phone number and store the data to their default fields', function(done) {
            let customer = new Customer({
                firstName: 'test',
                lastName: 'customer',
                customerType: 'testing',
                phoneNumber: '+18888675309',
                email: 'test@testing.com'
            });

            customer.save((err) => {
                if(err) {
                    done(err);
                } else {
                    expect(customer.phoneNumber).to.equal('+18888675309');
                    expect(customer.nationalFormat).to.equal('(888) 867-5309');
                    expect(customer.internationalFormat).to.equal('+1 888-867-5309');
                    expect(customer.countryCode).to.equal('US');
                    done();
                }
            });
        });

        it('should not throw an error if the number was incorrect and not directly modified', function(done) {
            let customer = new Customer({
                firstName: 'test',
                lastName: 'customer',
                customerType: 'testing',
                phoneNumber: '+18888675309',
                email: 'test@testing.com'
            });

            customer.save().then((customer) => {
                return Customer.findOneAndUpdate({
                    _id: customer._id
                }, {
                    $set: {
                        phoneNumber: '+188886753099'
                    }
                }, {
                    new: true
                }).exec();
            })
            .then((customer) => {
                customer.firstName = 'testing';
                return customer.save();
            })
            .then((customer) => {
                expect(customer.phoneNumber).to.equal('+188886753099');
                expect(customer.firstName).to.equal('testing');
                done();
            })
            .catch((err) => {
                done(err);
            });
        });

        it('should throw an error if the number was directly modified and incorrect', function(done) {
            let customer = new Customer({
                firstName: 'test',
                lastName: 'customer',
                customerType: 'testing',
                phoneNumber: '+18888675309',
                email: 'test@testing.com'
            });

            customer.save().then((customer) => {
                customer.phoneNumber = '+188886753099';
                return customer.save();
            })
            .then((customer) => {
                done(new Error('No error was thrown'));
            })
            .catch((err) => {
                expect(err.message).to.equal('Phone number is not valid. Number is too long.');
                done();
            });
        });

        it('should throw an error if the number is too long', function(done) {
            let customer = new Customer({
                firstName: 'test',
                lastName: 'customer',
                customerType: 'testing',
                phoneNumber: '+188886753099',
                email: 'test@testing.com'
            });

            customer.save((err) => {
                if(err) {
                    expect(err.message).to.equal('Phone number is not valid. Number is too long.');
                    done();
                } else {
                    done(new Error('no error was thrown'));
                }
            });
        });

        it('should throw an error if the number is too short', function(done) {
            let customer = new Customer({
                firstName: 'test',
                lastName: 'customer',
                customerType: 'testing',
                phoneNumber: '+1888867',
                email: 'test@testing.com'
            });

            customer.save((err) => {
                if(err) {
                    expect(err.message).to.equal('Phone number is not valid. Number is too short.');
                    done();
                } else {
                    done(new Error('no error was thrown'));
                }
            });
        });

        it('should throw an error if the number does not have a valid country code', function(done) {
            let customer = new Customer({
                firstName: 'test',
                lastName: 'customer',
                customerType: 'testing',
                phoneNumber: '8888675309',
                email: 'test@testing.com'
            });

            customer.save((err) => {
                if(err) {
                    expect(err.message).to.equal('Invalid country calling code');
                    done();
                } else {
                    done(new Error('no error was thrown'));
                }
            });
        });

        it('should throw an error if the number is unknown', function(done) {
            let customer = new Customer({
                firstName: 'test',
                lastName: 'customer',
                customerType: 'testing',
                phoneNumber: '+19999999999',
                email: 'test@testing.com'
            });

            customer.save((err) => {
                if(err) {
                    expect(err.message).to.equal('Phone number is not valid. Number is unknown.');
                    done();
                } else {
                    done(new Error('no error was thrown'));
                }
            });
        });
    });

    describe('with default overrides', function() {
        var testSchema, CustomerOverrides;

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
            var customer = new CustomerOverrides({
                firstName: 'test',
                lastName: 'customer',
                customerType: 'testing',
                phoneNumber: '+18888675309',
                email: 'test@testing.com'
            });

            return customer.save().then(function () {
                expect(customer.phoneNumber).to.equal('+18888675309');
                expect(customer.ntlFormat).to.equal('(888) 867-5309');
                expect(customer.intlFormat).to.equal('+1 888-867-5309');
                expect(customer.ccode).to.equal('US');
            });
        });
    });

    describe('with subdoc and default overrides', function() {
        var testSchema, CustomerSubdocOverrides;

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
            var customer = new CustomerSubdocOverrides({
                firstName: 'test',
                lastName: 'customer',
                customerType: 'testing',
                contact: {
                    phoneNumber: '+18888675309',
                    email: 'test@testing.com'
                }
            });

            return customer.save().then(function () {
                expect(customer.contact.phoneNumber).to.equal('+18888675309');
                expect(customer.contact.nationalFormat).to.equal('(888) 867-5309');
                expect(customer.contact.internationalFormat).to.equal('+1 888-867-5309');
                expect(customer.contact.countryCode).to.equal('US');
            });
        });
    });
});
