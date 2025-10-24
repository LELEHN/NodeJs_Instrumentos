import { Router } from "express";
import autenticar from "../middlewares/auth.js";
import {
    inserirProposta,
    listarPropostasInstrumento,
    buscarPropostaPorId,
    atualizarStatusProposta,
    listarMinhasPropostas
} from "../repository/propostaRepository.js";
import { buscarInstrumentoPorId, marcarInstrumentoIndisponivel } from "../repository/instrumentoRepository.js";

const endPoints = Router();

// POST - Fazer proposta
endPoints.post('/proposta', autenticar, async (req, resp) => {
    try {
        const compradorId = req.usuario.id;
        const { id_instrumento, preco } = req.body;

        if (!id_instrumento || !preco) {
            return resp.status(400).send({
                erro: "ID do instrumento e preço são obrigatórios"
            });
        }

        // Verificar se o instrumento existe e está disponível
        const instrumento = await buscarInstrumentoPorId(id_instrumento);

        if (!instrumento) {
            return resp.status(404).send({ erro: 'Instrumento não encontrado' });
        }

        if (!instrumento.disponibilidade) {
            return resp.status(400).send({ erro: 'Instrumento não está disponível' });
        }

        if (instrumento.id_usuario === compradorId) {
            return resp.status(400).send({ 
                erro: 'Você não pode fazer proposta no seu próprio instrumento' 
            });
        }

        const id = await inserirProposta(compradorId, id_instrumento, preco);

        resp.status(201).send({
            mensagem: "Proposta enviada com sucesso",
            id: id
        });

    } catch (err) {
        console.error('Erro ao fazer proposta:', err);
        resp.status(500).send({ erro: 'Erro ao fazer proposta' });
    }
});

// GET - Listar propostas de um instrumento (dono do instrumento)
endPoints.get('/instrumento/:id/propostas', autenticar, async (req, resp) => {
    try {
        const instrumentoId = req.params.id;
        const usuarioId = req.usuario.id;

        // Verificar se o instrumento pertence ao usuário
        const instrumento = await buscarInstrumentoPorId(instrumentoId);

        if (!instrumento) {
            return resp.status(404).send({ erro: 'Instrumento não encontrado' });
        }

        if (instrumento.id_usuario !== usuarioId) {
            return resp.status(403).send({ 
                erro: 'Você só pode ver propostas dos seus instrumentos' 
            });
        }

        const propostas = await listarPropostasInstrumento(instrumentoId);

        resp.send(propostas);

    } catch (err) {
        console.error('Erro ao listar propostas:', err);
        resp.status(500).send({ erro: 'Erro ao listar propostas' });
    }
});

// GET - Listar minhas propostas (como comprador)
endPoints.get('/propostas/minhas', autenticar, async (req, resp) => {
    try {
        const compradorId = req.usuario.id;
        const propostas = await listarMinhasPropostas(compradorId);

        resp.send(propostas);

    } catch (err) {
        console.error('Erro ao listar minhas propostas:', err);
        resp.status(500).send({ erro: 'Erro ao listar minhas propostas' });
    }
});

// PUT - Aceitar/Rejeitar proposta
endPoints.put('/proposta/:id', autenticar, async (req, resp) => {
    try {
        const propostaId = req.params.id;
        const usuarioId = req.usuario.id;
        const { status } = req.body;

        if (!status || !['aceita', 'recusada'].includes(status)) {
            return resp.status(400).send({ 
                erro: 'Status inválido. Use "aceita" ou "recusada"' 
            });
        }

        // Buscar proposta e verificar permissões
        const proposta = await buscarPropostaPorId(propostaId);

        if (!proposta) {
            return resp.status(404).send({ erro: 'Proposta não encontrada' });
        }

        if (proposta.status !== 'pendente') {
            return resp.status(400).send({ erro: 'Esta proposta já foi respondida' });
        }

        // Verificar se o usuário é o dono do instrumento
        const instrumento = await buscarInstrumentoPorId(proposta.id_instrumento);

        if (instrumento.id_usuario !== usuarioId) {
            return resp.status(403).send({ 
                erro: 'Você não tem permissão para responder esta proposta' 
            });
        }

        // Atualizar status da proposta
        await atualizarStatusProposta(propostaId, status);

        // Se aceitar, marcar instrumento como indisponível
        if (status === 'aceita') {
            await marcarInstrumentoIndisponivel(proposta.id_instrumento);
        }

        resp.send({ 
            mensagem: `Proposta ${status} com sucesso` 
        });

    } catch (err) {
        console.error('Erro ao atualizar proposta:', err);
        resp.status(500).send({ erro: 'Erro ao atualizar proposta' });
    }
});

export default endPoints;