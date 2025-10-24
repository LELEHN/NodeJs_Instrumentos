import 'dotenv/config.js';

import express from 'express';

import { rotas } from './rotas.js';

const servidor = express();

let PORTA = process.env.PORTA;

servidor.use(express.json())

rotas(servidor);




servidor.listen(PORTA, () => {console.log(`Porta aberta: ${PORTA}`)});