const express = require('express')
const cors = require('cors')
const connectDb = require('./conn')
const router = require('./routes/authRoutes')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 3000

connectDb()

app.use(cors());
app.use(express.json())
app.use("/api/auth",router)

app.get('/', (req, res) => {
  res.send('Hello World!')
})



app.listen(port, () => {
  console.log(`App is listening on port ${port}`)
})