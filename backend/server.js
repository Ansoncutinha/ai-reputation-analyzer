const express  = require('express')
const mongoose = require('mongoose')
const cors     = require('cors')
const dotenv   = require('dotenv')
dotenv.config()

const app = express()

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
  ],
  credentials: true
}))

app.use(express.json())

app.use('/api/auth',           require('./routes/auth'))
app.use('/api/feedback',       require('./routes/feedback'))
app.use('/api/site-users',     require('./routes/siteUsers'))
app.use('/api/dashboard',      require('./routes/dashboard'))
app.use('/api/sites',          require('./routes/sites'))
app.use('/api/insights',       require('./routes/insights'))
app.use('/api/reset-password', require('./routes/resetPassword'))

app.get('/', (req, res) => res.json({ message: 'InsightFlow API is running ✅' }))

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(process.env.PORT, () =>
      console.log(`✅ Server running on http://localhost:${process.env.PORT}`)
    )
  })
  .catch(err => {
    console.warn('⚠️ Main MongoDB connection failed (likely DNS issue). Trying fallback...')
    mongoose.connect(process.env.MONGO_URI_FALLBACK)
      .then(() => {
        console.log('✅ MongoDB connected via FALLBACK')
        app.listen(process.env.PORT, () =>
          console.log(`✅ Server running on http://localhost:${process.env.PORT}`)
        )
      })
      .catch(fallbackErr => {
        console.error('❌ Both MongoDB connections failed:', fallbackErr.message)
        process.exit(1)
      })
  })