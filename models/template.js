const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const model = new Schema({
  name: String,
  checklist: Object,
  items: [Object]
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  toJSON: {
    versionKey: false,
    transform: (doc, ret) => {
      const payload = {
        type: 'templates',
        id: ret._id,
        attributes: ret,
      }
      delete ret._id;
      return payload;
    }
  }
});

module.exports = mongoose.model('template', model);