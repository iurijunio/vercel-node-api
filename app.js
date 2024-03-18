// app.js
const express = require('express');
const app = express();
const port = 3000;

const formularioRoutes = require('./routes/form');
const apiRoutes = require('./routes/api');
app.use(express.static(__dirname+'/'));
app.use(express.static(__dirname+'/assets'));
app.use(express.static(__dirname + '/public'));

app.use(formularioRoutes);
app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
