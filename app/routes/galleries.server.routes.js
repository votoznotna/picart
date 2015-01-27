/**
 * Created by User on 1/19/2015.
 */
'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
    multipart = require('connect-multiparty'),
    galleries = require('../../app/controllers/galleries.server.controller');

var multipartMiddleware = multipart();

module.exports = function(app) {
    // Article Routes
    app.route('/galleries')
        .get(galleries.list)
        .post(users.requiresLogin, galleries.create);

    app.route('/upload')
        .post(users.requiresLogin, multipartMiddleware, galleries.createGallery);

    app.route('/galleries/:galleryId')
        .get(galleries.read)
        .put(users.requiresLogin, galleries.hasAuthorization, galleries.update)
        .delete(users.requiresLogin, galleries.hasAuthorization, galleries.delete);

    // Finish by binding the article middleware
    app.param('galleryId', galleries.galleryByID);
};
