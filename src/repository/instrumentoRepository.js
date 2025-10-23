import connection from "./connection.js";

export async function inserirInstrumento(usuario, instrumento) {

    let comando = `INSERT into instrumento(id_usuario, nome, preco, descricao, disponivel, data) VALUES(?, ?, ?, ?, ?, NOW())`;

    let [info] = await connection.query(comando, [usuario, instrumento.nome, instrumento.preco, instrumento.descricao, instrumento.disponivel]);

    return info.insertId;
    
}