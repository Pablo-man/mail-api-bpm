import express from 'express';
import router from './src/routes/mail.routes.js';
import morgan from 'morgan'


const app = express();
const PORT = process.env.PORT || 3000
app.use(express.json());
app.use(morgan('dev'))

app.use(router)

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
