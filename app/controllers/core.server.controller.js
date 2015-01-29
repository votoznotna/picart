'use strict';

var http = require('http'),
	https = require('https'),
	querystring = require('querystring'),
	errorHandler = require('./errors.server.controller'),
	_ = require('lodash'),
	config = require('../../config/config');

var PUBLIC_KEY  = config.recaptcha.siteKey,
	PRIVATE_KEY = config.recaptcha.secretKey;
/**
 * Module dependencies.
 */
exports.index = function(req, res) {
	res.render('index', {
		user: req.user || null,
		request: req
	});
};

exports.hasValidCaptcha = function(req, res, next){

	var API_HOST      = 'www.google.com',
		API_END_POINT = '/recaptcha/api/siteverify';

	// Add the private_key to the request.
	var data = {};
	data['secret'] = PRIVATE_KEY;
	data['response'] = req.body.recaptcha;
	data['remoteip'] = req.connection.remoteAddress;
	var data_str = querystring.stringify(data);

	var req_options = {
		host: API_HOST,
		path: API_END_POINT,
		port: 443,
		method: 'GET',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': data_str.length
		}
	};


	var request = https.request(req_options, function(response) {
		var body = '', errorMsg = '';

		response.on('error', function(err) {
			errorMsg =  'Invalid CAPTCHA: ' + errorHandler.getErrorMessage(err);
			console.log(errorMsg);
			return res.status(403).send({
				message: errorMsg
			});
		});

		response.on('data', function(chunk) {
			body += chunk;
		});

		response.on('end', function() {
			var success, error, parts;

			parts = _.without(body.split('\n'), '');
			success = parts[0];
			error = parts[parts.length - 1].replace(/^\s+|\s+$/gm,'').replace(/<[^>]+>/ig,'');

			if (success !== 'true') {
				errorMsg = 'Invalid CAPTCHA: ' + error;
				console.log(errorMsg);
				return res.status(403).send({
					message: errorMsg
				});
			}
			else {
				next();
			}

		});
	});

	request.write(data_str, 'utf8');
	request.end();

}
