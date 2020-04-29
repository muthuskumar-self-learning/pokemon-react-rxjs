import React, { useState, useEffect } from 'react';

import { BehaviorSubject, from } from 'rxjs';
import { debounceTime, filter, mergeMap, distinctUntilChanged } from 'rxjs/operators';

import './App.css';

const getPokemonByName = async name => {
  const { results: allPokemons } = await fetch(
    'https://pokeapi.co/api/v2/pokemon/?limit=1000'
  )
  .then(result => result.json());
  return allPokemons.filter(pokemon => pokemon.name.includes(name));
};

const searchSubject = new BehaviorSubject('');

const searchResultObservable = searchSubject.pipe(
  filter( val => val.length > 1),
  debounceTime(750),
  distinctUntilChanged(),
  mergeMap(val => from(getPokemonByName(val)))
)

const useObservable = (observable, setter) => {
  useEffect(() => {
    let subscription = observable.subscribe(result => {
      setter(result);
    });

    return () => subscription.unsubscribe();
  }, [observable, setter]);
};

const App = () => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);

  useObservable(searchResultObservable, setResults);

  const handleSearchChange =  e => {
    const newValue = e.target.value;
    setSearch(newValue);
    searchSubject.next(newValue);
  }
  return (
    <div className="App">
      <input 
        type="text" 
        placeholder="Search a pokemon" 
        value={search} 
        onChange={handleSearchChange}></input>

      {
        results.map(pokemon => (
          <div key={pokemon.name}>{pokemon.name}</div>
        ))
      }
    </div>
  )
}

export default App;
