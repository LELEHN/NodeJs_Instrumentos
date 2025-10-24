import connection from "./connection.js";

export async function inserirProposta(compradorId, instrumentoId, preco) {
    let comando = `
        INSERT INTO proposta(id_comprador, id_instrumento, preco, status) 
        VALUES(?, ?, ?, 'pendente')
    `;

    let [info] = await connection.query(comando, [
        compradorId, 
        instrumentoId, 
        parseFloat(preco)
    ]);

    return info.insertId;
}

export async function listarPropostasInstrumento(instrumentoId) {
    let comando = `
        SELECT 
            p.id_proposta AS id,
            p.id_instrumento,
            p.id_comprador,
            p.preco,
            p.status,
            p.data_proposta,
            u.nome AS comprador_nome,
            u.email AS comprador_email
        FROM proposta p
        INNER JOIN usuario u ON p.id_comprador = u.id_usuario
        WHERE p.id_instrumento = ?
        ORDER BY p.data_proposta DESC
    `;

    let [linhas] = await connection.query(comando, [instrumentoId]);

    return linhas;
}

export async function listarMinhasPropostas(compradorId) {
    let comando = `
        SELECT 
            p.id_proposta AS id,
            p.id_instrumento,
            p.preco,
            p.status,
            p.data_proposta,
            i.nome AS instrumento_nome,
            i.preco AS preco_original,
            i.imagem AS instrumento_imagem,
            i.disponibilidade,
            u.nome AS vendedor_nome,
            u.email AS vendedor_email
        FROM proposta p
        INNER JOIN instrumento i ON p.id_instrumento = i.id_instrumento
        INNER JOIN usuario u ON i.id_usuario = u.id_usuario
        WHERE p.id_comprador = ?
        ORDER BY p.data_proposta DESC
    `;

    let [linhas] = await connection.query(comando, [compradorId]);

    return linhas;
}

export async function buscarPropostaPorId(id) {
    let comando = `
        SELECT 
            id_proposta AS id,
            id_comprador,
            id_instrumento,
            preco,
            status
        FROM proposta
        WHERE id_proposta = ?
    `;

    let [linhas] = await connection.query(comando, [id]);

    return linhas[0];
}

export async function atualizarStatusProposta(id, status) {
    let comando = `UPDATE proposta SET status = ? WHERE id_proposta = ?`;

    await connection.query(comando, [status, id]);
}