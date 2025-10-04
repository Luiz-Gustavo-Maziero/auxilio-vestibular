// backend.js
const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;

app.use(express.static('public')); // para servir seu front-end

// Conexão com o MongoDB
const uri = "mongodb://meuUsuario:minhaSenha123@localhost:27017/Provas";
const client = new MongoClient(uri);
let collection;

async function connectDB() {
    await client.connect();
    const db = client.db('Provas');
    collection = db.collection('tcc');
    console.log("Conectado ao MongoDB");
}
connectDB();

// Rota para buscar todas as questões
app.get('/questoes', async (req, res) => {
    try {
        const questoes = await collection.find({}).toArray();
        res.json(questoes);
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao buscar questões");
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
