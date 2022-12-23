import EventEmitter from 'events';
import {withRetry, getRequest, postRequest} from './requestAPI.js'

// Transform
const transform = (animal) => {
  animal.friends = animal.friends.split(',');
  if (animal.born_at !== null) animal.born_at = new Date(animal.born_at).toISOString();
  return animal;
};

// Fetch & transform animal
const getAnimal = async (id) => {
  const url = `http://localhost:3123/animals/v1/animals/${id}`;
  return transform(await withRetry(getRequest, [url]));
};

// Fetch animals
const getAnimals = async (page) => {
  const params = new URLSearchParams();
  params.append('page', page);
  const url = `http://localhost:3123/animals/v1/animals?${params.toString()}`;
  return await withRetry(getRequest, [url]);
};

// `POST` batches of Animals `/animals/v1/home`, up to 100 at a time
const sendAnimals = async (animals) => {
  const url = 'http://localhost:3123/animals/v1/home';
  withRetry(postRequest, [url, animals]);
};

// Initialize variables
const queue1 = [];
const queue2 = [];
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
      const animal = queue1.shift();
      await queue2.push(await getAnimal(animal.id));
      entriesComplete++;
      myEmitter.emit('newEntryQueue2');
    }
  });
});

myEmitter.on('newEntryQueue2', () => {
  const len = queue2.length;
  if (len >= 100) {
    myEmitter.emit('flushQueue2', 100);
  } else if (fetchComplete && entriesComplete === entriesCount && len > 0) {
    myEmitter.emit('flushQueue2', len);
  }
});

myEmitter.on('flushQueue2', (count) => {
  console.log('flushQueue2:', count, 'entries');
  const batch = [];
  while (count > 0) {
    batch.push(queue2.shift());
    count--;
  }
  sendAnimals(batch);
});

// Exectute
while (page <= totalPages) {
  const batch = await getAnimals(page);
  if (batch.total_pages !== totalPages) totalPages = batch.total_pages;

  batch.items.map((animal) => {
    queue1.push(animal);
    entriesCount++;
    myEmitter.emit('newEntryQueue1');
  });

  page++;
}

fetchComplete = true;
