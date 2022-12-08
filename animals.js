"use strict";

import fetch from 'node-fetch';

const checkStatus = response => {
	if (response.ok) {
		// response.status >= 200 && response.status < 300
		return response;
	} else {
		throw new Error(response);
	}
}

// Fetch all animals
let getAnimal = async (id) => {
    const response = await fetch(`http://localhost:3123/animals/v1/animals/${id}`);
    try {
        checkStatus(response);
    } catch (error) {
        console.error(error);
        // retry
    }
    const result = await response.json();
    return result;
}


let getAnimals = async (page) => {
    const params = new URLSearchParams();
    params.append('page', page);

    const response = await fetch(`http://localhost:3123/animals/v1/animals?"${params.toString()}`);
    try {
        checkStatus(response);
    } catch (error) {
        console.error(error);
        // retry
    }
    const result = await response.json();
    return result;
}
console.log(await getAnimals(2));
console.log(await getAnimal(2));

// Transform
const transform = (animal) => {
    animal.friends = animal.friends.split(",");
    if (animal.born_at !== null) animal.born_at = animal.born_at.toISOString();
    return animal;
}
console.log(transform(await getAnimal(2)))

// `POST` batches of Animals `/animals/v1/home`, up to 100 at a time

