/**
 * Created by User on 1/19/2015.
 */
'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
    multipart = require('connect-multiparty'),
    exhibition =  require('../../app/controllers/exhibition.server.controller'),
    core = require('../../app/controllers/core.server.controller');

var multipartMiddleware = multipart();

module.exports = function(app) {
    // Article Routes
    app.route('/exhibition')
        .get(exhibition.list)

    app.route('/upload')
        .post(users.requiresLogin, multipartMiddleware, core.hasValidCaptcha, exhibition.save);

    app.route('/exhibition/:exhibitId')
        .get(exhibition.read)
        .put(users.requiresLogin, exhibition.hasAuthorization, exhibition.update)
        .delete(users.requiresLogin, exhibition.hasAuthorization, exhibition.delete);

    // Finish by binding the article middleware
    app.param('exhibitId', exhibition.exhibitByID);
};

