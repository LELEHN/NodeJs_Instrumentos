import jwt from 'jsonwebtoken';

const SECRET_KEY = 'ehSegredo';

//gera um token no momento do login

export function gerarToken(usuario) {

    const token = jwt.sign({
        id: usuario.id,
        email: usuario.email
    },
        SECRET_KEY,
        { expiresIn: '1h' });

        return token;

}

// verifica se o token é valido e decodifica ele

export function verificarToken(token){
    try{

        return jwt.verify(token, SECRET_KEY);
    }catch(err){

        throw new Error('token invalido ou expirado');
    }
}

// Apenas decodifica o token, sem verificar se eé valido

export function decodificarToken(token){

    return jwt.decode(token);
}