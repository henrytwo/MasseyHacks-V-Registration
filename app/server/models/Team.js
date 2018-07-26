require('dotenv').load();

var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    validator = require('validator'),
    jwt = require('jsonwebtoken');

var schema = new mongoose.Schema({

    name : {
        type: String,
        required: true
    },
    code : {
        type: String,
        required: true
    },
    memberIDs : {
        type: [String]
    }

});

schema.statics.getByCode = function(code, callback) {
    this.findOne({
        code: code
    }, function(err, team) {
        if (err || !team) {
            if (err) {
                return callback(err);
            }

            return callback({ error: "Error: Team not found" })
        }

        return callback(null, team);
    });
};

schema.set('toJSON', {
    virtuals: true
});

schema.set('toObject', {
    virtuals: true
});

module.exports = mongoose.model('Team', schema);