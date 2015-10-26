import mongoose from 'mongoose';
import { expect } from 'chai';
import { mongooseIntlPhoneNumber } from './mongoose-intl-phone-number';

var Schema = mongoose.Schema,
    connection;

function customerSchema() {
    return new Schema({
        firstName: { type: String },
        lastName: { type: String },
        customerType: { type: String },
        phoneNumber: { type: String },
        countryCode: { type: String },
        nationalFormat: { type: String },
        email: { type: String }
    });
}

describe('Mongoose plugin: mongoose-intl-phone-number', function() {
    before((done) => {
        connection = mongoose.createConnection('mongodb://localhost/unit_test');
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
                    expect(customer.countryCode).to.equal('US');
                    done();
                }
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
        let testSchema, CustomerOverrides;

        before(function() {
            testSchema = customerSchema();
            CustomerOverrides = connection.model('CustomerOverrides', testSchema);
            testSchema.plugin(mongooseIntlPhoneNumber, {
                hook: 'save',
                phoneNumberField: 'phoneNumber',
                nationalFormatField: 'ntlFormat',
                countryCodeField: 'ccode',
            });
        });

        it('should parse the phone number and store the data to the specified fields', function(done) {
            let customer = new CustomerOverrides({
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
                    expect(customer.ntlFormat).to.equal('(888) 867-5309');
                    expect(customer.ccode).to.equal('US');
                    done();
                }
            });
        });
    });
});
