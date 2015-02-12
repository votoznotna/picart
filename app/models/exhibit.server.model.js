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
var ExhibitSchema = new Schema({
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
/*    pic: {
     name: { type: String, default: '', trim: true, required: 'Picture Name cannot be blank' },
     size: { type: Number, default: 0 },
     mime: { type: String, default: '', required: 'Picture MIME cannot be blank'},
     data: { type: Buffer, default: null,  required: 'Picture cannot be blank'}
     },*/
    pic: {
         name: { type: String, default: '', trim: true },
         size: { type: Number, default: 0 },
         mime: { type: String, default: ''},
         data: { type: Buffer, default: null}
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

mongoose.model('Exhibit', ExhibitSchema);

