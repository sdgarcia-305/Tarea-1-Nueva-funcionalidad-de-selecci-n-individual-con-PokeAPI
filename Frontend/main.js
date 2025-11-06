const container = document.getElementById('pokemon-container');

//Botones de paginación
const firstBtn = document.getElementById('first');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const lastBtn = document.getElementById('last');

//Filtros
const nameInput = document.getElementById('nameFilter');
const idInput = document.getElementById('idFilter');
const typeSelect = document.getElementById('typeFilter');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');

let offset = 0;
const limit = 15;
let totalPokemons = 0;

async function getPokemons(){
    try {
        //Para que ya no me aparezca ningun error le agregue los : despues del http
        let url = `http://localhost:3000/api/pokemons?offset=${offset}&limit=${limit}`;

        if(nameInput.value.trim()) url += `&name=${nameInput.value.trim().toLowerCase()}`;
        if(idInput.value.trim()) url += `&id=${idInput.value.trim()}`;
        if(typeSelect.value) url += `&type=${typeSelect.value}`;

        const res = await fetch(url);
        if(!res.ok) throw new Error('Error al obtener pokemon');
        const data = await res.json();

        totalPokemons = data.total;

        container.innerHTML = '';

        data.results.forEach( p => {
            const card = document.createElement('div');
            card.className = 'bg-white shadow-lg rounded-2xl p-4 text-center hover:scale-105 transition-transfrom cursor-pointer';
            card.innerHTML = `
                <img src="${ p.sprite }" class="mx-auto w-32 h-32">
                <h2 class="text-xl font-semibold capitalize mt-2">${p.name}</h2>
                <p class="text-gray-600">Tipo: ${p.types.map(t => t).join(', ') }</p>
            `;

            card.addEventListener('click', async() => {
            showPokemonDetails(p.name);
        });

            container.appendChild(card);
        });

        //Desabilitar los botones
        prevBtn.disabled = offset === 0;
        nextBtn.disabled = offset + limit >= totalPokemons;
        firstBtn.disabled = offset === 0;
        lastBtn.disabled = offset + limit >= totalPokemons;

    } catch (error) {
        console.error('Error al obtener pokemon: ', error);
    }
}

// Agregue ésta async function para abrir un modal cuando le damos clcik al pokemon
async function showPokemonDetails(name) {
    const modal = document.getElementById('pokeModal');
    const closeBtn = document.getElementById('closeModal');

    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        if(!res.ok) throw new Error('No se pudo obtener el Pokemon');
        const data = await res.json();

        document.getElementById('imgModal').src = data.sprites.other['official-artwork'].front_default;
        document.getElementById('nameModal').textContent = data.name;
        document.getElementById('idModal').textContent = `#${data.id}`;
        document.getElementById('typesModal').textContent = `Tipo: ${data.types.map(t => t.type.name).join(', ')}`;
        document.getElementById('heightModal').textContent = `Altura: ${(data.height / 10) .toFixed(1)} m`;
        document.getElementById('weightModal').textContent = `Peso: ${(data.weight / 10).toFixed(1)} kg`;
        document.getElementById('abilitiesModal').textContent = `Habilidades: ${data.abilities.map(a => a.ability.name).join(', ')}`;
        document.getElementById('movesModal').textContent = `Ataques: ${data.moves.slice(0, 5).map(m => m.move.name).join(', ')}`;

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    } catch (error) {
        console.error('Error al obtener detalles del pokemon:', error);
    }

    closeBtn.onclick = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };

    modal.addEventListener('click', e => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    });
}//

prevBtn.addEventListener('click', () => {
    if(offset >= limit){
        offset -= limit;
        getPokemons();
    }
})

nextBtn.addEventListener('click', () => {
    offset += limit;
    getPokemons();
});

firstBtn.addEventListener('click', () => {
    offset = 0;
    getPokemons();
});

lastBtn.addEventListener('click', () => {
    offset = Math.floor((totalPokemons - 1) / limit) * limit;
    getPokemons();
});

searchBtn.addEventListener('click', () => {
// Agrego un if para que antes de buscar, limpie name y id cuando se seleccione un tipo    
    if (typeSelect.value) {
        nameInput.value = '';
        idInput.value = '';
    }
    offset = 0;
    getPokemons();
});

clearBtn.addEventListener('click', () => {
    nameInput.value = '';
    idInput.value = '';
    typeSelect.value = '';
    offset = 0;
    getPokemons();
});

getPokemons();