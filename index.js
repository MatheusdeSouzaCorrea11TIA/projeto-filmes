import express from "express";
import cors from "cors";
import mysql from "mysql2"

const app = express()
app.use(express.json())
app.use(cors())

const database = mysql.createPool({
    host: "benserverplex.ddns.net",
    user: "alunos",
    password: "senhaAlunos",
    database: "alunos_filmes_03MA"
})

app.get("/", (request,response) => {
    const selectCommand = `SELECT * FROM filmes_MatheusSouza`
    
    database.query(selectCommand, (err, filmes) => {
        if (err) {
            console.log(err)
            response.json({ message: "Erro ao buscar filmes" })
            return
        }

        response.json(filmes)
    })
})

app.post("/adicionar-filme", (request, response) => {
    const { title, genre, duration, ageRating } = request.body

    const insertCommand = `INSERT INTO 
    filmes_MatheusSouza(title, genre, duration, ageRating) 
    VALUES(?,?,?,?)`
    
    database.query(insertCommand,[title,genre,duration,ageRating], (err) => {
        if (err) {
            console.log(err)
            response.json({ message: "Erro ao criar filme" })
            return
        }

        response.json({ message: "Filme criado com sucesso!" })
    })
})

app.put("/editar-filme/:id", (request, response) => {
    const id = request.params.id
    const { title, genre, duration, ageRating } = request.body

    const editCommand = `
    UPDATE filmes_MatheusSouza
    SET
        title = ?,
        genre = ?,
        duration = ?,
        ageRating = ?
    WHERE id = ?;
    `
    
    database.query(editCommand,[title,genre,duration,ageRating, id], (err) => {
        if (err) {
            console.log(err)
            response.json({ message: "Erro ao editar filme" })
            return
        }

        response.json({ message: "Filme editado com sucesso!" })
    })
})

app.delete("/deletar-filme/:id", (request, response) => {
    const id = request.params.id

    const deleteCommand = `
    DELETE FROM filmes_MatheusSouza
    WHERE id = ?
    `
    
    database.query(deleteCommand,[id], (err) => {
        if (err) {
            console.log(err)
            return
        }

        response.json({ message: "Filme deletado com sucesso!" })
    })
})

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000")
})