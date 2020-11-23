const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const format = require('date-fns/format');

const model = new Schema({
  description: {
    type: String,
    required: true
  },
  is_completed: {
    type: Boolean,
    default: false
  },
  completed_at: {
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
  updated_by: {
    type: String,
    default: null
  },
  assignee_id: {
    type: String,
    default: null
  },
  task_id: {
    type: Number,
    default: null
  },
  checklist_id: {
    type: Schema.Types.ObjectId,
    ref: 'checklist'
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  toJSON: {
    versionKey: false,
    transform: (doc, ret) => {
      const due = format(ret.due, 'yyyy-MM-dd HH:mm:ss');
      ret.due = due;
      const payload = {
        type: 'items',
        id: ret._id,
        attributes: ret,
        links: {
          self: `${process.env.BASE_URL}/items/${ret._id}/`
        }
      }
      return payload;
    }
  }
});

module.exports = mongoose.model('item', model);