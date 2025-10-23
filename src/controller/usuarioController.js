import { Router } from "express";

import { cadastrarUsuario, verificalUsuario} from "../repository/usuarioRepository.js";

import { gerarToken } from "../services/jwt.js";

const endPoints = Router();

endPoints.post('/usuario/cadastro', async (req, resp) => {

    try{

    let usuario =  req.body;

    if(!usuario){

        resp.status(400).send({erro: 'Usuario esta nulo'});
    }

    let saida = await cadastrarUsuario(usuario);

    if(!saida){

        resp.status(400).send({erro: 'Não foi possivel inserir no banco'})
    }

    resp.send(saida);

    }catch(err){

        console.error('Falhou', err);
    }
});

endPoints.post('/usuario/login', async(req, resp) => {

    try {
        let usuario = req.body;

        
        if (!usuario.email || !usuario.senha) {
            return resp.status(400).send({ erro: "Email e senha são obrigatórios" });
        }

        let saida = await verificalUsuario(usuario);

        if (!saida) {
            return resp.status(401).send({ erro: "Email ou senha incorretos" }); 
        }

        let token = gerarToken(saida);

        resp.send({
            token: token,
            usuario: {
                id: saida.id,
                nome: saida.nome,
                email: saida.email
            }
        }); 

    } catch (err) {
        console.error('Erro no login:', err);
        resp.status(500).send({ erro: 'Erro ao fazer login' });
    }
});

export default endPoints;