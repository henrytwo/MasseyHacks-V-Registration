var mongoose = require('mongoose');

JWT_SECRET = process.env.JWT_SECRET;

var schema = new mongoose.Schema({
    timestamp : {
        type: Number,
        required: true
    },
    from : {
        type: String,
        required: true
    },
    to : {
        type: String,
        required: true
    },
    message : {
        type: String,
        required: true
    }
});

schema.set('toJSON', {
    virtuals: true
});

schema.set('toObject', {
    virtuals: true
});

schema.virtual('timestampHuman').get(function() {
    return new Date(this.timestamp);
});

schema.statics.getLog = function(callback){
    this
        .find({})
        .exec(function (err, log) {
            if (err || !log) {
                if (err) {
                    return callback(err);
                }

                return callback(null, { log : [] });
            }
            return callback(null, {log : log});
        });
};

module.exports = mongoose.model('Logs', schema);