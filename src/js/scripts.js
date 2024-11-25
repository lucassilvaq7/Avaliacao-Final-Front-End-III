const cardContainer = document.getElementById('card-list')
const prevPage = document.getElementById('prev-page')
const nextPage = document.getElementById('next-page')
const pageButtonsContainer = document.getElementById('page-buttons')

const characterStatus = document.getElementById('character-status')
const locationStatus = document.getElementById('location-status')
const episodeStatus = document.getElementById('episode-status')

let pages = []
let filteredCharacters = []
let currentPage = 1
const perPage = 6

async function fetchAllCharacters() {
    try {
        pages = []

        const res = await api.get(`/character/`)
        const totalPages = res.data.info.pages

        pages.push(...res.data.results)

        const req = []
        for (let i = 2; i <= totalPages; i++) {
            req.push(api.get(`/character/?page=${i}`))
        }

        const responses = await Promise.all(req)
        responses.forEach(response => {
            pages.push(...response.data.results)
        })

        fetchCharacters()
    } catch (error) {
        console.log('Erro ao buscar personagens:', error)
    }
}

fetchAllCharacters()

async function fetchCharacters() {
    try {
        cardContainer.innerHTML = ''

        const start = (currentPage - 1) * perPage
        const end = start + perPage

        const charactersToDisplay = filteredCharacters.length > 0 ? filteredCharacters : pages

        const characters = charactersToDisplay.slice(start, end)

        characters.forEach((character, index)=> {
            const characterCard = document.createElement('div')
            characterCard.classList.add('bg-dark-green', 'border', 'border-black', 'text-light', 'mt-5')

            const globalIndex = start + index;

            characterCard.innerHTML = `
            <div>
                <div class="row character-card">
                    <div class="col-12 col-sm-5">
                        <img src="${character.image}" class="img-fluid">
                    </div>
                    <div class="col-12 col-sm-7 ps-5">
                        <div class="card-body d-flex flex-column gap-2">
                            <h3 class="pt-2">${character.name}</h3>
                            <p>${character.species}</p>
                            <p class="fw-semibold">${changeStatus(character.status)}</p>
                            <button class="characters-modal-status btn bg-btn-light-green text-dark-green fw-semibold w-75 mx-auto"
                             data-bs-toggle="modal" data-bs-target="#exampleModal" data-index="${globalIndex}">Mais informações
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `

            cardContainer.appendChild(characterCard)
        })

        const statusButtons = document.querySelectorAll('.characters-modal-status')
            statusButtons.forEach((button) => {
                button.addEventListener('click', (event) => {
                    const index = event.target.getAttribute('data-index')
                    const character = filteredCharacters.length > 0 ? filteredCharacters[index] : pages[index]

                    const modal = document.getElementById('exampleModal')
                    const modalTitle = modal.querySelector('.modal-title')
                    const modalBody = modal.querySelector('.modal-body')

                    modalTitle.textContent = character.name
                    modalBody.innerHTML = `
                        <p>Status: ${changeStatus(character.status)}</p>
                        <p>Espécie: ${character.species}</p>
                        <p>Gênero: ${changeGender(character.gender)}</p>
                        <p>Origem: ${character.origin.name}</p>
                        <p>Tipo: ${character.type || 'desconhecido'}</p>
                        <p>Última localização: ${character.location.name}</p>
                     `
                })
            })

        updatedPaginationButtons(charactersToDisplay)
    } catch (error) {
        console.log('erro ao listar personagens', error)
    }
}

function changeStatus (status) {
    switch (status) {
        case 'Alive':
            return '🟢 Vivo';
        case 'Dead':
            return '🔴 Morto';
        default:
            return '⚪ desconhecido'
    }
}

function changeGender (gender) {
    switch (gender) {
        case 'Male':
            return 'Masculino';
        case 'Female':
            return 'Feminino';
        default:
            return 'desconhecido'
    }
}

prevPage.addEventListener('click', (e) => {
    e.preventDefault()

    if (currentPage > 1) {
        currentPage--

        fetchCharacters()
    }
})

nextPage.addEventListener('click', (e) => {
    e.preventDefault()

    const totalPages = Math.ceil((filteredCharacters.length > 0 ? filteredCharacters : pages).length / perPage)

    if (currentPage < totalPages) {
        currentPage++
        fetchCharacters()
    }
})

function updatedPaginationButtons(charactersToDisplay) {
    const totalPages = Math.ceil(charactersToDisplay.length / perPage)

    prevPage.disabled = currentPage === 1
    nextPage.disabled = currentPage === totalPages
}

const searchInput = document.getElementById("search-input")

async function characterSearch() {
    const query = searchInput.value.toLowerCase()
    filteredCharacters = pages.filter(character => 
        character.name.toLowerCase().includes(query)
    )

    currentPage = 1
    fetchCharacters()
}

searchInput.addEventListener("input", characterSearch)


async function fetchCharactersStatus() {
    characterStatus.innerText = ''

    const res = await api.get(`/character/`)

    const infoCharacters = res.data.info

    characterStatus.innerText = infoCharacters.count
}

fetchCharactersStatus()

async function fetchLocationsStatus() {
    locationStatus.innerText = ''

    const res = await api.get(`/location/`)

    const infoLocations = res.data.info

    locationStatus.innerText = infoLocations.count
}

fetchLocationsStatus()

async function fetchEpisodesStatus() {
    episodeStatus.innerText = ''

    const res = await api.get(`/episode/`)

    const infoEpisodes = res.data.info

    episodeStatus.innerText = infoEpisodes.count
}

fetchEpisodesStatus()