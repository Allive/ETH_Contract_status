import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join( '', 'public-flutter')));

export default app;