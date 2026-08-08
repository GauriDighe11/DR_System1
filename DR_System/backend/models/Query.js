const mongoose = require('mongoose');
const sanitize = require('mongo-sanitize');

const QuerySchema = new mongoose.Schema({
  consumerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Consumer ID is required'],
    index: true
  },
  query: {
    type: String,
    required: [true, 'Query content is required'],
    trim: true,
    maxlength: [500, 'Query cannot exceed 500 characters'],
    index: 'text'
  },
  status: {
    type: String,
    enum: {
      values: ['unread', 'read', 'archived'],
      message: 'Invalid status value'
    },
    default: 'unread',
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: -1
  }
}, {
  bufferCommands: false,
  autoIndex: process.env.NODE_ENV !== 'production' // Auto-index only in dev
});

// Security middleware - sanitize inputs
QuerySchema.pre('save', function(next) {
  this.query = sanitize(this.query);
  next();
});

// Compound index for better performance
QuerySchema.index({ status: 1, timestamp: -1 });

// Security: Remove version key and transform _id
QuerySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Query', QuerySchema);