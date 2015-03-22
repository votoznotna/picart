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
    app.route('/api/exhibition')
        .get(exhibition.list);

    //app.route('/exhibition/express')
    //    .get(exhibition.list);

    app.route('/upload')
        .post(users.requiresLogin, multipartMiddleware, core.hasValidCaptcha, exhibition.save);

    // get the image of a particular exhibit
    app.route('/pic/:id/:name')
        .get(exhibition.pic);

    app.route('/mpic/:id/:name')
        .get(exhibition.mpic);

    app.route('/delete')
        .post(users.requiresLogin, multipartMiddleware, core.hasValidCaptcha, exhibition.delete);

    app.route('/api/exhibition/:exhibitId')
        .get(exhibition.read)
        .put(users.requiresLogin, exhibition.hasAuthorization, exhibition.update)
        .delete(users.requiresLogin, exhibition.hasAuthorization, exhibition.remove);

    // Finish by binding the article middleware
    app.param('exhibitId', exhibition.exhibitByID);
};

