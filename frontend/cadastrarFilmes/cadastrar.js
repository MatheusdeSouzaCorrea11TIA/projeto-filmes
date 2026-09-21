const titleInput = document.getElementById("titulo")
const genreInput = document.getElementById("genero")
const ageInput = document.getElementById("faixa-etaria")
const durationInput = document.getElementById("duracao")

async function cadastrarFilme(event) {
    event.preventDefault()

    const dataSend = {
        title: titleInput.value, 
        genre: genreInput.value, 
        duration: Number(durationInput.value),
        ageRating: ageInput.value
    }

    console.log(dataSend)

    const response = await fetch("https://projeto-filmes-backend-16i9n5m3i.vercel.app/adicionar-filme", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(dataSend)
    }).then(response => response.json())

    if (response.message) {
        alert(response.message)
        return
    }
}