# Movies and Pokemon

A small vanilla JavaScript API playground with two interactive experiences:

- a first-to-six Pokemon battle using live data from [PokeAPI](https://pokeapi.co/);
- a movie search using the [OMDb API](https://www.omdbapi.com/).

Live site: [antunishdpursuit.github.io/movies-and-pokemon](https://antunishdpursuit.github.io/movies-and-pokemon/)

## Features

- Choose a starter Pokemon, select a team member, and resolve each round by hovering over the battle artwork.
- Restart a completed battle and play using keyboard-accessible controls.
- Search OMDb for movies, with loading, empty-result, and request-failure feedback.
- Preserve the original Bootstrap-based visual design while using plain HTML, CSS, and JavaScript.

## Run locally

This is a static site. From the repository root, serve the files with any static server, for example:

```powershell
python -m http.server 4174
```

Then open `http://127.0.0.1:4174` in a browser.

## Technical notes

- The project uses browser `fetch`, direct DOM updates, and regular functions; it does not use a JavaScript framework or class architecture.
- The OMDb key is intentionally a public, rate-limited demo key because GitHub Pages is a static deployment. A server-side proxy would be required to keep a production key secret.
- PokeAPI and OMDb availability are external dependencies, so the interface includes recovery guidance when movie requests fail.

## Current limitations

- Pokemon data is loaded live and may be unavailable if PokeAPI is unreachable.
- Movie search results depend on OMDb's availability and daily rate limit.
- Browser tests cover the core game flow and movie-search success and failure states. GitHub Actions runs the build and test suite for pull requests and updates to `main`.
