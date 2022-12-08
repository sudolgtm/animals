Here is hopefully a simple and realistic programming exercise in the spirit of ETL (extract, transform, load) across an HTTP API.

## Setup

The needs are minimal to get started. Make sure you have:
* Docker, or some way to run our provided container
* A programming language of some kind. If you're applying for a Python position, probably use that!


1. Start by downloading the Docker image:
   https://storage.googleapis.com/lp-dev-hiring/images/lp-programming-challenge-1-1625758668.tar.gz
1. Load the container: `docker load -i lp-programming-challenge-1-1625610904.tar.gz`.
1. The output there should tell you what it imported. Go ahead and run it, and be sure to expose port `3123`
   so you can access it: `docker run --rm -p 3123:3123 -ti lp-programming-challenge-1`
1. Try opening  `http://localhost:3123/` to see if things are working.


## The API

The `animals` API is running on port `3123` and it has a few endpoints:

### `/animals/v1/animals`
Make a `GET` here to list the collection of animals. It's a paginated endpoint, so you'll need to
use the `page` param to unroll the whole list.

### `/animals/v1/animals/<id>`
Make a `GET` here to get the details for an animal.
`<id>` should be the `id` in the listing response.

### `/animals/v1/home`
This endpoint accepts `POST` request with a JSON array of Animal detail responses, with some minor changes:
1. The `friends` field must be translated to an array from a comma-delimited string.
1. The `born_at` field, if populated, must be translated into an ISO8601 timestamp in UTC.

Think of this one as a separate server, but bundled here for simplicity.

### `/docs`
The OpenAPI docs for the server. Take a look through here to see schema details.


## The Exercise

The ask is pretty simple:
1. Fetch all Animal details
1. Transform a few fields
1. `POST` batches of Animals `/animals/v1/home`, up to 100 at a time

There is a pain point to contend with:
* The server can randomly pause for 5-15 seconds
* The server can randomly return HTTP 500, 502, 503 or 504

The goal is to write code that can reliably load every animal.
You are free to use whatever libraries or tools you need to complete the task.

This exercise isn't timed, but we're thinking it should take less than 3 hours.
Provide some basic notes on how to set up and run your project, and come
prepared to talk about your design!

Please let us know if you have additional questions!
