import connection from "./connection.js";

export async function cadastrarUsuario(usuario) {

    let comando = `INSERT into usuario(nome, email, senha)
     VALUES(?,?, MD5(?));`;

     let [info] = await connection.query(comando, [usuario.nome, usuario.email, usuario.senha]);

     return info.insertId;
    
}

export async function verificalUsuario(usuario) {

    // ✅ Adicionar id_usuario AS id
    let comando = `SELECT id_usuario AS id, nome, email 
                   FROM usuario 
                   WHERE email = ? AND senha = MD5(?)`;

    let [info] = await connection.query(comando, [usuario.email, usuario.senha]);

    console.log('Usuario encontrado:', info[0]); // ← Debug

    return info[0];
}