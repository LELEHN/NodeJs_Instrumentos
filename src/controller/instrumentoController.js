import { Router } from "express";
import autenticar from "../middlewares/auth.js";
import { inserirInstrumento } from "../repository/instrumentoRepository.js";

let endPoints = Router();


endPoints.post('/instrumento/post', autenticar, async (req, resp) => {

    let usuario = req.usuario.id;

    let instrumento = req.body;

    if (!usuario) {

        return resp.status(400).send({ erro: "Falta usuario" })
    }

    if (!instrumento.nome || !instrumento.preco) {
        return resp.status(400).send({
            erro: "Nome e preço do instrumento são obrigatórios"
        });
    }

    let saida = await inserirInstrumento(usuario, instrumento);

    resp.send(saida);

});


export default endPoints;