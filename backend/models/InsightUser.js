const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const insightUserSchema = new mongoose.Schema({
  fullName:  { type: String, required: true },
  username:  { type: String, required: true, unique: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  plan:      { type: String, default: 'Free' },
  emailAISummary: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
})

insightUserSchema.pre('save', async function() {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

insightUserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model('InsightUser', insightUserSchema)