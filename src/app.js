import 'dotenv/config.js';

import express from 'express';

import { rotas } from './rotas.js';

const servidor = express();

let PORT = process.env.PORT;

servidor.use(express.json())

rotas(servidor);




servidor.listen(PORT, () => {console.log(`Porta aberta: ${PORT}`)});