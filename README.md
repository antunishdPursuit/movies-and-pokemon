# Movies and Pokemon

A responsive vanilla JavaScript project with a Pokemon battle and an OMDb movie search.

## Live Application

[Open Movies and Pokemon](https://antunishdpursuit.github.io/movies-and-pokemon/)

## Features

- Choose Gardevoir, Lopunny, or Primarina as a player
- Select Pokemon and resolve each round with the Fight control
- Play a best-of-three match built from first-to-six battles
- Restart after a completed match and use keyboard-accessible controls
- Search OMDb by movie title and optional release year
- View up to nine movie results in a responsive card grid
- Open each valid result on IMDb
- Receive clear loading, empty, and error feedback
- Use the project across desktop and mobile layouts

## Built With

- HTML
- CSS
- Vanilla JavaScript
- [PokeAPI](https://pokeapi.co/)
- [OMDb API](https://www.omdbapi.com/)
- Vite for local development and production builds
- Cypress for end-to-end testing
- GitHub Actions for automated build and test checks
- GitHub Pages for deployment

## Run Locally

Requirements:

- Node.js 24 or a compatible maintained release
- npm

```bash
npm ci
npm run dev
```

Open `http://127.0.0.1:4173`.

## Testing

```bash
npm run build
npm test
```

`npm run build` creates the production build. `npm test` starts the local Vite server and runs the Cypress end-to-end suite with controlled API responses rather than relying on live services.

The repository's Quality workflow runs these checks for pushes to `main` and pull requests.

## Technical Notes

- The browser application remains framework-free; Vite provides development and build tools rather than a runtime UI framework.
- Remote API text is rendered with DOM methods instead of being inserted as HTML.
- Pokemon game state, scores, player choices, and resets use regular functions and explicit state.
- The interface supports keyboard focus, responsive layouts, and clear status messages.
- The OMDb API key is public by design. This is a static, client-side portfolio app hosted on GitHub Pages, so any key sent by the browser can be inspected. The key accesses public movie metadata and remains subject to OMDb usage limits. We treat it as a replaceable demo credential, not a secret. Keeping a true secret would require a server-side service, which is outside this project's scope. This is an accepted limitation, not an unresolved client-side fix.

## Limitations

- Pokemon data depends on PokeAPI availability.
- Movie results depend on OMDb availability, matching, and usage limits.
- Movie searches show at most nine results and do not include pagination.
- Missing poster artwork uses a text placeholder.
- The exposed OMDb demo key is not suitable for a private or paid production service.

## Credits

- Pokemon data: [PokeAPI](https://pokeapi.co/)
- Movie data: [OMDb API](https://www.omdbapi.com/)
- Movie detail links: [IMDb](https://www.imdb.com/)
