const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const format = require('date-fns/format');

const model = new Schema({
  object_domain: {
    type: String,
    required: true
  },
  object_id: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  is_completed: {
    type: Boolean,
    default: false
  },
  completed_at: {
    type: Date,
    default: null
  },
  updated_by: {
    type: String,
    default: null
  },
  due: {
    type: Date,
    default: null
  },
  urgency: {
    type: Number,
    default: null
  },
  items: [{
    type: Schema.Types.ObjectId,
    ref: 'item'
  }]
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      const payload = {
        type: 'checklists',
        id: ret._id,
        attributes: ret,
        links: {
          self: `${process.env.BASE_URL}/checklists/${ret._id}/`
        }
      }
      delete ret._id;
      const due = format(ret.due, 'yyyy-MM-dd HH:mm:ss');
      ret.due = due;
      return payload;
    }
  }
});

module.exports = mongoose.model('checklist', model);