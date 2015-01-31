/**
 * Created by User on 1/21/2015.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Gallery Schema
 */
var GallerySchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        default: '',
        trim: true,
        required: 'Title cannot be blank'
    },
    title_searchable: {
        type: String,
        default: '',
        trim: true,
        required: 'Title cannot be blank'
    },
    picture: {
        type: String,
        default: '',
        trim: true,
        required: 'Picture cannot be blank'
    },
    content: {
        type: String,
        default: '',
        trim: true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

mongoose.model('Gallery', GallerySchema);
