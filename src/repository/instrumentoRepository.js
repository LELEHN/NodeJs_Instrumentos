import connection from "./connection.js";

export async function inserirInstrumento(usuario, instrumento) {
    let comando = `
        INSERT INTO instrumento(id_usuario, nome, preco, descricao, disponibilidade, data, imagem) 
        VALUES(?, ?, ?, ?, ?, NOW(), ?)
    `;

    let disponibilidade = instrumento.disponibilidade !== undefined 
        ? instrumento.disponibilidade 
        : true;

    let [info] = await connection.query(comando, [
        usuario, 
        instrumento.nome, 
        parseFloat(instrumento.preco), 
        instrumento.descricao || null, 
        disponibilidade,
        instrumento.imagem || null
    ]);

    return info.insertId;
}

export async function listarInstrumentosDisponiveis(usuarioId, nome, precoMin, precoMax) {
    let comando = `
        SELECT 
            i.id_instrumento AS id,
            i.id_usuario,
            i.nome,
            i.preco,
            i.descricao,
            i.disponibilidade,
            i.data,
            i.imagem,
            u.id_usuario AS dono_id,
            u.nome AS dono_nome,
            u.email AS dono_email
        FROM instrumento i
        INNER JOIN usuario u ON i.id_usuario = u.id_usuario
        WHERE i.disponibilidade = true 
        AND i.id_usuario != ?
    `;

    let params = [usuarioId];

    if (nome) {
        comando += ` AND i.nome LIKE ?`;
        params.push(`%${nome}%`);
    }

    if (precoMin) {
        comando += ` AND i.preco >= ?`;
        params.push(parseFloat(precoMin));
    }

    if (precoMax) {
        comando += ` AND i.preco <= ?`;
        params.push(parseFloat(precoMax));
    }

    comando += ` ORDER BY i.data DESC`;

    let [linhas] = await connection.query(comando, params);

    return linhas;
}

export async function listarInstrumentosUsuario(usuarioId) {
    let comando = `
        SELECT 
            id_instrumento AS id,
            nome,
            preco,
            descricao,
            disponibilidade,
            data,
            imagem
        FROM instrumento
        WHERE id_usuario = ?
        ORDER BY data DESC
    `;

    let [linhas] = await connection.query(comando, [usuarioId]);

    return linhas;
}

export async function buscarInstrumentoPorId(id) {
    let comando = `
        SELECT 
            i.id_instrumento AS id,
            i.id_usuario,
            i.nome,
            i.preco,
            i.descricao,
            i.disponibilidade,
            i.data,
            i.imagem,
            u.nome AS dono_nome,
            u.email AS dono_email
        FROM instrumento i
        INNER JOIN usuario u ON i.id_usuario = u.id_usuario
        WHERE i.id_instrumento = ?
    `;

    let [linhas] = await connection.query(comando, [id]);

    return linhas[0];
}

export async function atualizarInstrumento(id, dados) {
    let campos = [];
    let valores = [];

    if (dados.nome !== undefined) {
        campos.push('nome = ?');
        valores.push(dados.nome);
    }

    if (dados.preco !== undefined) {
        campos.push('preco = ?');
        valores.push(parseFloat(dados.preco));
    }

    if (dados.descricao !== undefined) {
        campos.push('descricao = ?');
        valores.push(dados.descricao);
    }

    if (dados.disponibilidade !== undefined) {
        campos.push('disponibilidade = ?');
        valores.push(dados.disponibilidade);
    }

    if (dados.imagem !== undefined) {
        campos.push('imagem = ?');
        valores.push(dados.imagem);
    }

    if (campos.length === 0) {
        return;
    }

    valores.push(id);

    let comando = `UPDATE instrumento SET ${campos.join(', ')} WHERE id_instrumento = ?`;

    await connection.query(comando, valores);
}

export async function deletarInstrumento(id) {
    let comando = `DELETE FROM instrumento WHERE id_instrumento = ?`;

    await connection.query(comando, [id]);
}

export async function marcarInstrumentoIndisponivel(id) {
    let comando = `UPDATE instrumento SET disponibilidade = false WHERE id_instrumento = ?`;

    await connection.query(comando, [id]);
}