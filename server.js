require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', require('./controller/client/ClientRoutes'))
app.use('/', require('./controller/admin/AdminRoutes'))

app.listen(3001, () => {
    console.log('Server is running at http://localhost:3001')
})