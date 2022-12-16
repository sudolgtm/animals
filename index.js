"use strict";

import EventEmitter from 'events';
import fetch from 'node-fetch';

// Transform
const transform = (animal) => {
    animal.friends = animal.friends.split(",");
    if (animal.born_at !== null) animal.born_at = new Date(animal.born_at).toISOString();
    return animal;
}

const checkStatus = response => {
	if (response.ok) {
		// response.status >= 200 && response.status < 300
		return response;
	} else {
		throw new Error(`HTTP Error Response: ${response.status} ${response.statusText}`);
	}
}

const getRequest = async (url) => {
    try {
        const response = await fetch(url);
        checkStatus(response);
        let result = await response.json();
        return result;
    } catch (error) {
        console.error(error);
        return await getRequest(url);
    }
}

// Fetch & transform animal
let getAnimal = async (id) => {
    const url = `http://localhost:3123/animals/v1/animals/${id}`;
    return transform(await getRequest(url));
}

// Fetch animals
let getAnimals = async (page) => {
    const params = new URLSearchParams();
    params.append('page', page);
    const url = `http://localhost:3123/animals/v1/animals?${params.toString()}`;
    return await getRequest(url);
}

// `POST` batches of Animals `/animals/v1/home`, up to 100 at a time
let sendAnimals = async (animals) => {
    const options = {
        method: 'post',
        body: JSON.stringify(animals),
        headers: {'Content-Type': 'application/json'}
    }

    const response = await fetch(`http://localhost:3123/animals/v1/home`, options);
    try {
        checkStatus(response);
        const result = await response.json();
        console.log(result.message);
    } catch (error) {
        console.error(error);
        sendAnimals(animals);
    }
}

// Initialize variables
let queue1 = [];
let queue2 = [];
let page = 1;
let totalPages = 1;
let entriesCount = 0;
let entriesComplete = 0;
let fetchComplete = false;

// Create event emitters
const myEmitter = new EventEmitter();

myEmitter.on('newEntryQueue1', () => {
    setImmediate(async () => {
        if (queue1.length > 0) {
            let animal = queue1.shift();
            await queue2.push(await getAnimal(animal.id));
            entriesComplete++;
            myEmitter.emit('newEntryQueue2');
        }
    })
});

myEmitter.on('newEntryQueue2', () => {
    let len = queue2.length;
    if (len >= 100) {
        myEmitter.emit('flushQueue2', 100);
    } else if (fetchComplete && entriesComplete === entriesCount && len > 0) {
        myEmitter.emit('flushQueue2', len);
    }
});

myEmitter.on('flushQueue2', (count) => {
    console.log('flushQueue2:', count, 'entries');
    let batch = [];
    while (count > 0) {
        batch.push(queue2.shift());
        count--;
    }
    sendAnimals(batch);
});

// Exectute
while (page <= totalPages) {
    let batch = await getAnimals(page);
    if (batch.total_pages !== totalPages) totalPages = batch.total_pages;

    batch.items.map(animal => {
        queue1.push(animal);
        entriesCount++;
        myEmitter.emit('newEntryQueue1');
    })

    page++;
}

fetchComplete = true;