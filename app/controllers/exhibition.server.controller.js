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
    rimraf = require('rimraf'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    errorHandler = require('./errors.server.controller'),
    core = require('./core.server.controller'),
    config = require('../../config/config'),
    Exhibit = mongoose.model('Exhibit'),
    _ = require('lodash');

var dataRoot = config.dataRoot ?  config.dataRoot : __dirname;
/**
 * Create an exhibit
 */

exports.save = function(req, res) {

    var exhibit = new Exhibit(req.body);
    exhibit.title_searchable = req.body.title.toLowerCase();
    var exhibitId = req.body._id;
    var image = req.files.image;

    if(exhibitId){

        exhibit._id = exhibitId ;

        if(!image) {

            Exhibit.findByIdAndUpdate(exhibit._id,
                {
                    title: exhibit.title,
                    title_searchable: exhibit.title_searchable,
                    content: exhibit.content
                }, function (err, exhibit) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    }
                    if (!exhibit) return next(new Error('Failed to load exhibit ' + exhibitId));
                    else res.json(exhibit);
                });
        }
        else {

            var imageName = image.name;
            var imagePath = image.path;

            fs.readFile(imagePath, 'binary', function (err, bdata) {

                var picMaxPath = path.join(dataRoot, config.picturesRoot + '/max/' + exhibit._id);
                var picMinPath = path.join(dataRoot, config.picturesRoot + '/min/' + exhibit._id);
                var picMax = path.join(picMaxPath, imageName);
                var picMin = path.join(picMinPath, imageName);
                var maxPicData = null, minPicData = null;

                mkdirp(picMaxPath, function (err) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    }
                    else {
                        mkdirp(picMinPath, function (err) {
                            if (err) {
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            }
                            else{
                                /// write file to uploads/thumbs folder
                                im.resize({
                                    srcData: bdata,
                                    dstPath: picMax,
                                    quality: 1,
                                    width: config.picMaxWidth
                                }, function (err, stdout, stderr) {

                                    if (stderr) {
                                        return res.status(400).send({
                                            message: errorHandler.getErrorMessage(err)
                                        });
                                    }
                                    else {

                                        fs.readFile(picMax, function (err, data) {
                                            if (err) {
                                                return res.status(400).send({
                                                    message: errorHandler.getErrorMessage(err)
                                                });
                                            }
                                            else {
                                                maxPicData = new Buffer(data);

                                                im.resize({
                                                        srcData: bdata,
                                                        dstPath: picMin,
                                                        quality: 1,
                                                        width: config.picMinWidth
                                                    },
                                                    function (err, stdout, stderr) {

                                                        if (stderr) {
                                                            return res.status(400).send({
                                                                message: errorHandler.getErrorMessage(err)
                                                            });
                                                        }
                                                        else {

                                                            fs.readFile(picMin, function (err, data) {
                                                                if (err) {
                                                                    return res.status(400).send({
                                                                        message: errorHandler.getErrorMessage(err)
                                                                    });
                                                                }
                                                                else {
                                                                    minPicData = new Buffer(data);

                                                                    Exhibit.findByIdAndUpdate(exhibit._id,
                                                                        {
                                                                            title: exhibit.title,
                                                                            title_searchable: exhibit.title_searchable,
                                                                            content: exhibit.content,
                                                                            pic: {
                                                                                name: image.name,
                                                                                size: maxPicData.length,
                                                                                msize: minPicData.length,
                                                                                mime: image.type,
                                                                                mdata: minPicData,
                                                                                data: maxPicData //.toString('base64')
                                                                            }
                                                                        },
                                                                        function (err, exhibit) {
                                                                            if (err) {
                                                                                return res.status(400).send({
                                                                                    message: errorHandler.getErrorMessage(err)
                                                                                });
                                                                            }
                                                                            else {
                                                                                rimraf(picMaxPath, function (er) {
                                                                                    if (er) {
                                                                                        console.log(er);
                                                                                    }
                                                                                });
                                                                                rimraf(picMinPath, function (er) {
                                                                                    if (er) {
                                                                                        console.log(er);
                                                                                    }
                                                                                });
                                                                                res.json(exhibit);
                                                                            }
                                                                        }
                                                                    );
                                                                }
                                                            });
                                                        }
                                                    }
                                                );
                                            }
                                        });
                                    }
                                });
                            }
                        })
                    }
                });
            });
        }
    }

    else {

        exhibit.user = req.user;

        if (image) {

            var imageName = image.name;
            var imagePath = image.path;

            var galRet = exhibit.save(function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {

                    fs.readFile(imagePath, 'binary', function (err, bdata) {

                        var picMaxPath = path.join(dataRoot, config.picturesRoot + '/max/' + exhibit._id);
                        var picMinPath = path.join(dataRoot, config.picturesRoot + '/min/' + exhibit._id);
                        var picMax = path.join(picMaxPath, imageName);
                        var picMin = path.join(picMinPath, imageName);
                        var maxPicData = null, minPicData = null;

                        mkdirp(picMaxPath, function (err) {

                            if (err) {
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            }
                            else {
                                mkdirp(picMinPath, function (err) {
                                    if (err) {
                                        return res.status(400).send({
                                            message: errorHandler.getErrorMessage(err)
                                        });
                                    }
                                    else{
                                        /// write file to uploads/thumbs folder
                                        im.resize({
                                            srcData: bdata,
                                            dstPath: picMax,
                                            quality: 1,
                                            width: config.picMaxWidth
                                        }, function (err, stdout, stderr) {

                                            if (stderr) {
                                                return res.status(400).send({
                                                    message: errorHandler.getErrorMessage(err)
                                                });
                                            }
                                            else {
                                                fs.readFile(picMax, function (err, data) {
                                                    if (err) {
                                                        return res.status(400).send({
                                                            message: errorHandler.getErrorMessage(err)
                                                        });
                                                    }
                                                    else {
                                                        maxPicData = new Buffer(data);

                                                        im.resize(
                                                            {
                                                                srcData: bdata,
                                                                dstPath: picMin,
                                                                quality: 1,
                                                                width: config.picMinWidth
                                                            },
                                                            function (err, stdout, stderr) {

                                                                if (stderr) {
                                                                    return res.status(400).send({
                                                                        message: errorHandler.getErrorMessage(err)
                                                                    });
                                                                }
                                                                else {
                                                                    minPicData = new Buffer(data);

                                                                    Exhibit.findByIdAndUpdate(exhibit._id,
                                                                        {
                                                                            title: exhibit.title,
                                                                            title_searchable: exhibit.title_searchable,
                                                                            content: exhibit.content,
                                                                            pic: {
                                                                                name: image.name,
                                                                                size: maxPicData.length,
                                                                                msize: minPicData.length,
                                                                                mime: image.type,
                                                                                mdata: minPicData,
                                                                                data: maxPicData //.toString('base64')
                                                                            }
                                                                        },
                                                                        function (err, exhibit) {
                                                                            if (err || !exhibit) {
                                                                                return res.status(400).send({
                                                                                    message: errorHandler.getErrorMessage(err)
                                                                                });
                                                                            }
                                                                            else {
                                                                                rimraf(picMaxPath, function (er) {
                                                                                    if (er) {
                                                                                        console.log(er);
                                                                                    }
                                                                                });
                                                                                rimraf(picMinPath, function (er) {
                                                                                    if (er) {
                                                                                        console.log(er);
                                                                                    }
                                                                                });
                                                                                res.json(exhibit);
                                                                            }
                                                                        }
                                                                    );
                                                                }
                                                            }
                                                        );
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    });
                }
            });

        }
        else {
            return res.status(400).send({
                message: errorHandler.getErrorMessage("Picture is missing")
            })
        }
    }
};



/**
 * Show the current exhibit
 */
exports.read = function(req, res) {
    res.json(req.exhibit);
};

var picture = function(req, res, min) {

    var select = 'pic.mime pic.';

    if(min)
        select +=  'mdata';
    else
        select += 'data';

    var arr =  req.url.split('/');
    var exhibitId = arr[arr.length - 2];
    Exhibit.findById(exhibitId).select(select).exec(function(err, exhibit) {
        if (err || !exhibit)
            return res.status(400).send({
                message: 'Failed to load picture ' + req.params.exhibitId
            });
        res.contentType(exhibit.pic.mime);
        if(min)
            res.end(exhibit.pic.mdata, "binary");
        else
            res.end(exhibit.pic.data, "binary");
    });
}


exports.pic = function(req, res) {
    picture(req, res);
};

exports.mpic = function(req, res) {
    picture(req, res, true);
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
exports.remove = function(req, res) {
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

exports.delete = function(req, res) {

    var exhibit = new Exhibit(req.body);
    var exhibitId = req.body._id;

    if(exhibitId) {

        exhibit._id = exhibitId;
        Exhibit.findByIdAndRemove(exhibit._id, function (err, exhibit) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            if (!exhibit) return next(new Error('Failed to load exhibit ' + exhibitId));
            else {
                res.json(exhibit);
            }
        });

    }  else{
        res.json(exhibit);
    }

};
/**
 * List of Exhibit
 */

exports.list = function(req, res) {
    Exhibit.find().select('_id title title_searchable content pic.name pic.size user').sort('-created').populate('user', 'displayName').exec(function(err, exhibition) {
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
    Exhibit.findById(id).select('_id title content pic.name user').populate('user', 'displayName').exec(function(err, exhibit) {
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
