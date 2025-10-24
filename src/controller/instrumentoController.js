import { Router } from "express";
import autenticar from "../middlewares/auth.js";
import multer from "multer";
import path from "path";
import { 
    inserirInstrumento, 
    listarInstrumentosDisponiveis,
    listarInstrumentosUsuario,
    buscarInstrumentoPorId,
    atualizarInstrumento,
    deletarInstrumento
} from "../repository/instrumentoRepository.js";

const endPoints = Router();

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Apenas imagens são permitidas (jpg, jpeg, png, gif)'));
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// POST - Criar instrumento
endPoints.post('/instrumento', autenticar, upload.single('imagem'), async (req, resp) => {
    try {
        const usuario = req.usuario.id;
        const instrumento = req.body;

        if (!instrumento.nome || !instrumento.preco) {
            return resp.status(400).send({
                erro: "Nome e preço do instrumento são obrigatórios"
            });
        }

        // Adicionar caminho da imagem se foi enviada
        if (req.file) {
            instrumento.imagem = `/uploads/${req.file.filename}`;
        }

        const id = await inserirInstrumento(usuario, instrumento);

        resp.status(201).send({
            mensagem: "Instrumento criado com sucesso",
            id: id
        });

    } catch (err) {
        console.error('Erro ao criar instrumento:', err);
        resp.status(500).send({ erro: 'Erro ao criar instrumento' });
    }
});

// GET - Listar instrumentos disponíveis (com filtros)
endPoints.get('/instrumentos', autenticar, async (req, resp) => {
    try {
        const { nome, precoMin, precoMax } = req.query;
        const usuarioId = req.usuario.id;

        const instrumentos = await listarInstrumentosDisponiveis(
            usuarioId, 
            nome, 
            precoMin, 
            precoMax
        );

        resp.send(instrumentos);

    } catch (err) {
        console.error('Erro ao listar instrumentos:', err);
        resp.status(500).send({ erro: 'Erro ao listar instrumentos' });
    }
});

// GET - Listar meus instrumentos
endPoints.get('/instrumentos/meus', autenticar, async (req, resp) => {
    try {
        const usuarioId = req.usuario.id;
        const instrumentos = await listarInstrumentosUsuario(usuarioId);

        resp.send(instrumentos);

    } catch (err) {
        console.error('Erro ao listar meus instrumentos:', err);
        resp.status(500).send({ erro: 'Erro ao listar meus instrumentos' });
    }
});

// GET - Buscar instrumento específico
endPoints.get('/instrumento/:id', autenticar, async (req, resp) => {
    try {
        const id = req.params.id;
        const instrumento = await buscarInstrumentoPorId(id);

        if (!instrumento) {
            return resp.status(404).send({ erro: 'Instrumento não encontrado' });
        }

        resp.send(instrumento);

    } catch (err) {
        console.error('Erro ao buscar instrumento:', err);
        resp.status(500).send({ erro: 'Erro ao buscar instrumento' });
    }
});

// PUT - Atualizar instrumento
endPoints.put('/instrumento/:id', autenticar, upload.single('imagem'), async (req, resp) => {
    try {
        const id = req.params.id;
        const usuarioId = req.usuario.id;
        const dados = req.body;

        // Verificar se o instrumento pertence ao usuário
        const instrumento = await buscarInstrumentoPorId(id);
        
        if (!instrumento) {
            return resp.status(404).send({ erro: 'Instrumento não encontrado' });
        }

        if (instrumento.id_usuario !== usuarioId) {
            return resp.status(403).send({ 
                erro: 'Você não tem permissão para alterar este instrumento' 
            });
        }

        // Adicionar caminho da imagem se foi enviada
        if (req.file) {
            dados.imagem = `/uploads/${req.file.filename}`;
        }

        await atualizarInstrumento(id, dados);

        resp.send({ mensagem: 'Instrumento atualizado com sucesso' });

    } catch (err) {
        console.error('Erro ao atualizar instrumento:', err);
        resp.status(500).send({ erro: 'Erro ao atualizar instrumento' });
    }
});

// DELETE - Deletar instrumento
endPoints.delete('/instrumento/:id', autenticar, async (req, resp) => {
    try {
        const id = req.params.id;
        const usuarioId = req.usuario.id;

        // Verificar se o instrumento pertence ao usuário
        const instrumento = await buscarInstrumentoPorId(id);
        
        if (!instrumento) {
            return resp.status(404).send({ erro: 'Instrumento não encontrado' });
        }

        if (instrumento.id_usuario !== usuarioId) {
            return resp.status(403).send({ 
                erro: 'Você não tem permissão para deletar este instrumento' 
            });
        }

        await deletarInstrumento(id);

        resp.send({ mensagem: 'Instrumento deletado com sucesso' });

    } catch (err) {
        console.error('Erro ao deletar instrumento:', err);
        resp.status(500).send({ erro: 'Erro ao deletar instrumento' });
    }
});

export default endPoints;