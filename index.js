// const express = require('express');
import express from 'express'
import path from 'path'
import { dirname } from 'path';
const app = express();

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'style.css')));
app.get('/', (req, res)=> res.sendFile(path.join(__dirname, 'index.html')));

const init = async() => {
    try {
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
    }
    catch(ex) {
        console.log(ex);
    }
}

init();