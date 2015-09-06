/**
 *  Copyright (c) 2015 Salama AB
 *  All rights reserved
 *  Contact: aksalj@aksalj.me
 *  Website: http://www.aksalj.me
 *
 *  Project : pesajs
 *  File : app
 *  Date : 9/5/15 1:14 PM
 *  Description :
 *
 */
'use strict';
var express = require("express");
var bodyParser = require('body-parser');
var randomstring = require("randomstring");
var pesajs = require("../index");

var MPesa = pesajs.MPESA({
    ID: "898945",
    PassKey: "SuperSecretPassKey",
    debug: true
});


var checkoutService = new MPesa.CheckoutService();

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('static'));


app.post('/checkout/:action(request|confirm)', function (req, res, next) {
    

    switch(req.params.action) {
        case "request":

            var transaction = randomstring.generate();
            var ref = req.body.reference;
            var phone = req.body.phone;
            var amount = req.body.amount;


            var cart = new MPesa.Cart(transaction, ref, phone, amount, "http://awesome-store.co.ke/ipn");
            cart.Details = "Additional transaction details if any";

            checkoutService.requestCheckout(cart, function(err, resp) {
                console.error(err);
                var data = resp.toJSON().body;

                // Now if ok show message to user and allow them to confirm
                // ...

                res.send({
                    message: "To complete this transaction, enter YOUR PIN on YOUR handset."
                });
            });

            break;
        case "confirm":

            var args = {
                Transaction: req.body.transaction,
                TXN_MPESA: req.body.mpesa_transaction
            };

            checkoutService.confirmCheckout(args, function(err, resp) {
                console.error(err);
                console.info(resp.toJSON().body);

                res.send({
                    message: "Thank you for doing business with us. Buy some more stuff while we wait for payment to be processed!"
                });
            });

            break;
        default:
            next();
            break;
    }

});

app.all("/ipn", checkoutService.paymentNotification, function(req, res) {
    // Do whatever with payment info like confirm purchase, init shipping, send download link, etc.
    var ipn = req.payment;
    console.log(ipn);
});


var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});