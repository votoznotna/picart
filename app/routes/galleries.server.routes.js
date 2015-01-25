/**
 * Created by User on 1/19/2015.
 */
'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
    galleries = require('../../app/controllers/galleries.server.controller');

module.exports = function(app) {
    // Article Routes
    app.route('/galleries')
        .get(galleries.list)
        .post(users.requiresLogin, galleries.create);

    app.route('/galleries/:galleryId')
        .get(galleries.read)
        .put(users.requiresLogin, galleries.hasAuthorization, galleries.update)
        .delete(users.requiresLogin, galleries.hasAuthorization, galleries.delete);

    // Finish by binding the article middleware
    app.param('galleryId', galleries.galleryByID);
};
