import usuarioController from './controller/usuarioController.js';

import instrumentoController from './controller/instrumentoController.js'

export function rotas(servidor){

    servidor.use(usuarioController); 

    servidor.use(instrumentoController);

    
}