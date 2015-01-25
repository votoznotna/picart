/**
 * Created by User on 1/21/2015.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Gallery = mongoose.model('Gallery'),
    _ = require('lodash');

/**
 * Create a galery
 */
exports.create = function(req, res) {
    var galery = new Gallery(req.body);
    galery.user = req.user;

    galery.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(galery);
        }
    });
};

/**
 * Show the current gallery
 */
exports.read = function(req, res) {
    res.json(req.gallery);
};

/**
 * Update a gallery
 */
exports.update = function(req, res) {
    var gallery = req.gallery;

    gallery = _.extend(gallery, req.body);

    gallery.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(gallery);
        }
    });
};

/**
 * Delete an gallery
 */
exports.delete = function(req, res) {
    var gallery = req.gallery;

    gallery.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(gallery);
        }
    });
};

/**
 * List of Galleries
 */
exports.list = function(req, res) {
    Gallery.find().sort('-created').populate('user', 'displayName').exec(function(err, galleries) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(galleries);
        }
    });
};

/**
 * Gallery middleware
 */
exports.galleryByID = function(req, res, next, id) {
    Gallery.findById(id).populate('user', 'displayName').exec(function(err, gallery) {
        if (err) return next(err);
        if (!gallery) return next(new Error('Failed to load gallery ' + id));
        req.gallery = gallery;
        next();
    });
};

/**
 * Gallery authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.gallery.user.id !== req.user.id) {
        return res.status(403).send({
            message: 'User is not authorized'
        });
    }
    next();
};
