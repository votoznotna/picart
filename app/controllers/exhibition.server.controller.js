/**
 * Created by User on 2/1/2015.
 */
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
    rimraf = require("rimraf"),
    path = require('path'),
    mkdirp = require('mkdirp'),
    errorHandler = require('./errors.server.controller'),
    core = require('./core.server.controller'),
    config = require('../../config/config'),
    Exhibit = mongoose.model('Exhibit'),
    _ = require('lodash');

/**
 * Create an exhibit
 */

exports.create = function(req, res) {

    var image = req.files.image;
    var imageName = image.name;
    var imagePath = image.path;

    var picFullSize = path.join(__dirname, config.picturesRoot + '/fullsize', imageName);
    var picThumbs = path.join(__dirname, config.picturesRoot + '/thumbs', imageName);

    if(imagePath && imageName) {

        var exhibit = new Exhibit(req.body);
        exhibit.title_searchable = req.body.title.toLowerCase();
        exhibit.user = req.user;
        exhibit.picture = imageName;
        var galRet = exhibit.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {

                fs.readFile(imagePath, function (err, data) {

                    /// write file to uploads/fullsize folder

                    var picFullSizePath = path.join(__dirname, config.picturesRoot + '/fullsize/' + exhibit._id);
                    var picThumbsPath = path.join(__dirname, config.picturesRoot + '/thumbs/' + exhibit._id);
                    var picFullSize = path.join(picFullSizePath, imageName);
                    var picThumbs = path.join(picThumbsPath, imageName);

                    mkdirp(picFullSizePath, function (err) {

                        if (err) {
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            })
                        }
                        else {

                            mkdirp(picThumbsPath, function (err) {

                                if (err) {
                                    return res.status(400).send({
                                        message: errorHandler.getErrorMessage(err)
                                    })
                                }
                                else {

                                    fs.writeFile(picFullSize, data, function (err) {

                                        /// write file to uploads/thumbs folder
                                        im.resize({
                                            srcPath: picFullSize,
                                            dstPath: picThumbs,
                                            quality: 1,
                                            width: 1000
                                        }, function (err, stdout, stderr) {
                                            rimraf(picFullSizePath, function (er) {
                                                if (er) {
                                                    console.log(er)
                                                }
                                            })
                                            if (err) {
                                                return res.status(400).send({
                                                    message: errorHandler.getErrorMessage(err)
                                                });
                                            }
                                        });
                                    });
                                }
                                // path was created unless there was error

                            });
                        }
                        // path was created unless there was error
                    });
                    res.json(exhibit);
                });
            }
        });
    }
    else{
        return res.status(400).send({
            message: errorHandler.getErrorMessage("Picture is missing")
        })
    }
};



/**
 * Show the current exhibit
 */
exports.read = function(req, res) {
    res.json(req.exhibit);
};

/**
 * Update a exhibit
 */
exports.update = function(req, res) {
    var exhibit = req.exhibit;

    exhibit = _.extend(exhibit, req.body);

    exhibit.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(exhibit);
        }
    });
};

/**
 * Delete an exhibit
 */
exports.delete = function(req, res) {
    var exhibit = req.exhibit;

    exhibit.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(exhibit);
        }
    });
};

/**
 * List of Exhibit
 */
exports.list = function(req, res) {
    Exhibit.find().sort('-created').populate('user', 'displayName').exec(function(err, exhibition) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(exhibition);
        }
    });
};

/**
 * Exhibit middleware
 */
exports.exhibitByID = function(req, res, next, id) {
    Exhibit.findById(id).populate('user', 'displayName').exec(function(err, exhibit) {
        if (err) return next(err);
        if (!exhibit) return next(new Error('Failed to load exhibit ' + id));
        req.exhibit = exhibit;
        next();
    });
};

/**
 * Exhibit authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.exhibit.user.id !== req.user.id) {
        return res.status(403).send({
            message: 'User is not authorized'
        });
    }
    next();
};

