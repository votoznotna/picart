/**
 * Created by User on 1/21/2015.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    im = require('imagemagick'),
    fs = require('fs'),
    path = require('path'),
    errorHandler = require('./errors.server.controller'),
    core = require('./core.server.controller'),
    Gallery = mongoose.model('Gallery'),
    _ = require('lodash');



/**
 * Create a galery
 */
exports.create = function(req, res) {
    var gallery = new Gallery(req.body);
    gallery.user = req.user;

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



exports.createGallery = function(req, res) {

    var image = req.files.image;
    var imageName = image.name;
    var imagePath = image.path;

   // code.hasValidCaptcha(req, res)


    if(imagePath) {

        fs.readFile(imagePath, function (err, data) {

            /// If there's an error
            if (!imageName) {
                res.redirect("/");
                res.end();

            } else {

                var picFullSize = path.join(__dirname, '../pictures/fullsize', imageName);
                var picThumbs = path.join(__dirname, '../pictures/thumbs', imageName);

                /// write file to uploads/fullsize folder
                fs.writeFile(picFullSize, data, function (err) {

                    /// write file to uploads/thumbs folder
                    im.resize({
                        srcPath: picFullSize,
                        dstPath: picThumbs,
                        width: 300
                    }, function (err, stdout, stderr) {
                        if(err) {
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        }
                    });
                });
            }
        });
    }

    var gallery = new Gallery(req.body);
    gallery.user = req.user;
    gallery.picture = imageName ? imageName : null;
/*        gallery.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json(gallery);
            }
        });*/
    res.json(gallery);

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
