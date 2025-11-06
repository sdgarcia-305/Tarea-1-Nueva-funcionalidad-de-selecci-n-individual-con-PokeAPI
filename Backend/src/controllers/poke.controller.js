export const getPokemons = async (req, res) =>{
    try {
        const limit = parseInt(req.query.limit) || 15;
        const offset = parseInt(req.query.offset) || 0;
        const { name, id, type } = req.query;

// Obteniendo la informacion base de un pokemon
        const fetchPokemon = async (identifier) => {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${identifier.toLowerCase()}`);
            if(!response.ok) throw new Error('Pokemon no encontrado');
            const data = await response.json();
            return {
                id: data.id,
                name: data.name,
                sprite: data.sprites.other['official-artwork'].front_default,
                types: data.types.map(t => t.type.name)
            }
        }

        //Filtro por Id o por nombre
        if(id || name){
            const query = id || name;
            const pokemon = await fetchPokemon(query);
            return res.json({ ok: true, results: [pokemon] })
        }

        // Filtro por tipo
        if(type) {
            //Estaba mala la url del fetch, le faltaba la /api despues del .co
            const typeRes = await fetch(`https://pokeapi.co/api/v2/type/${type.toLowerCase()}`);
            if(!typeRes.ok) throw new Error('Tipo no encontrado');
            const typeData = await typeRes.json();

            const pokemonsSlice = typeData.pokemon.slice(offset, offset + limit);
            const results = await Promise.all(
                pokemonsSlice.map( p => fetchPokemon(p.pokemon.name))
            );

            return res.json({
                ok: true,
                total: typeData.pokemon.length,
                offset,
                limit,
                results
            })
        }

        // Obteniendo los pokemon paginados 
        const listRes = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
        const listData = await listRes.json();

        const results = await Promise.all(
            listData.results.map(p => fetchPokemon(p.name))
        )
// En esta parte agregue res.json() al return para que me mostrara los datos de la api
        return res.json({
            ok: true,
            offset,
            limit,
            total: listData.count,
            next: listData.next,
            previous: listData.previous,
            results
        });

    } catch (error) {
        res.status(500).json({ok: false, message: error.message});
    }
}