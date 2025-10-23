import { verificarToken } from '../services/jwt.js';

export default function autenticar(req, resp, next) {
  try {
    const authHeader = req.headers['authorization'];
    
    console.log('=== DEBUG AUTENTICAÇÃO ===');
    console.log('1. Header recebido:', authHeader);
    
    if (!authHeader) {
      return resp.status(401).send({ erro: "Token não fornecido" });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('2. Token extraído:', token);

    const decoded = verificarToken(token);
    console.log('3. Token decodificado:', decoded);
    
    req.usuario = decoded;
    console.log('4. req.usuario setado:', req.usuario);
    console.log('=========================');
    
    next();

  } catch (err) {
    console.error('ERRO na autenticação:', err.message);
    return resp.status(401).send({ 
      erro: "Token inválido ou expirado",
      detalhes: err.message 
    });
  }
}