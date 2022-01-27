import express, { json } from 'express';
import cors from 'cors';

const app = express();

app.use(json());
app.use(cors());

app.get('/hello', (req, res) => {
    res.send('teste')
});

app.listen(5000, () => {
    console.log('Running app in http://localhost:5000')
});