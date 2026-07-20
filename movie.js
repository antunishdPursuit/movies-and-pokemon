let movieForm = document.querySelector("#movieForm")
let movieStatus = document.querySelector("#movieStatus")
let movieBox = document.querySelector("#movieBox")
let movieResults = document.querySelector(".movie-results")
let movieSubmitButton = document.querySelector("#movieSubmt")

// Build status and API text as DOM nodes so response values are never parsed as HTML.
function setStatusLines(...lines) {
    movieStatus.replaceChildren()
    lines.forEach((line, index) => {
        if (index > 0) {
            movieStatus.append(document.createElement("br"))
        }
        movieStatus.append(document.createTextNode(line))
    })
}
function createPosterPlaceholder(movieTitle) {
    let placeholder = document.createElement("div")
    placeholder.className = "movie-poster-placeholder"
    placeholder.setAttribute("role", "img")
    placeholder.setAttribute("aria-label", `Poster unavailable for ${movieTitle}`)
    placeholder.textContent = "Poster unavailable"
    return placeholder
}

function createMovieCard(movie) {
    let movieCard = document.createElement("article")
    movieCard.className = "movie-card"

    let posterFrame = document.createElement("div")
    posterFrame.className = "movie-poster-frame"
    if (movie.Poster && movie.Poster !== "N/A") {
        let poster = document.createElement("img")
        poster.className = "movie-poster"
        poster.src = movie.Poster
        poster.alt = `${movie.Title} poster`
        poster.loading = "lazy"
        poster.addEventListener("error", () => {
            poster.replaceWith(createPosterPlaceholder(movie.Title))
        }, { once: true })
        posterFrame.append(poster)
    } else {
        posterFrame.append(createPosterPlaceholder(movie.Title))
    }

    let title = document.createElement("h3")
    title.textContent = movie.Title
    let year = document.createElement("p")
    year.className = "movie-card-year"
    year.textContent = movie.Year

    movieCard.append(posterFrame, title, year)
    if (typeof movie.imdbID === "string" && /^tt\d+$/.test(movie.imdbID)) {
        movieCard.dataset.imdbId = movie.imdbID
        let imdbLink = document.createElement("a")
        imdbLink.className = "movie-card-link"
        imdbLink.href = `https://www.imdb.com/title/${movie.imdbID}/`
        imdbLink.target = "_blank"
        imdbLink.rel = "noopener noreferrer"
        imdbLink.textContent = "View on IMDb"
        imdbLink.setAttribute("aria-label", `View ${movie.Title} on IMDb`)
        movieCard.append(imdbLink)
    }
    return movieCard
}

function orderMovieResults(searchResults, query) {
    let normalizedQuery = query.toLowerCase()
    let startsWithQuery = searchResults.filter((movie) => movie.Title.toLowerCase().startsWith(normalizedQuery))
    let includesQuery = searchResults.filter((movie) => !movie.Title.toLowerCase().startsWith(normalizedQuery))
    return startsWithQuery.concat(includesQuery)
}

function setLoading(isLoading) {
    movieSubmitButton.disabled = isLoading
    movieSubmitButton.textContent = isLoading ? "Searching..." : "Search movies"
    movieForm.setAttribute("aria-busy", String(isLoading))
}

window.onload = () => {
  movieForm.addEventListener("submit", (event) => {
        event.preventDefault()
        let movieTitle = event.target.movie.value.trim()
        let releaseYear = event.target.movieYear.value.trim()

        if (!movieTitle) {
            setStatusLines("Enter a movie title to search.")
            return
        }

        setStatusLines(`Searching for "${movieTitle}"...`)
        movieBox.replaceChildren()
        movieResults.hidden = true
        setLoading(true)

        let apiParameters = new URLSearchParams({
            apikey: "5e8cd208",
            s: movieTitle,
            type: "movie"
        })
        if (releaseYear) {
            apiParameters.set("y", releaseYear)
        }

        fetch(`https://www.omdbapi.com/?${apiParameters}`)
        .then((response) => response.json())
        .then((json) => {
            let searchResults = json.Search
            if(searchResults === undefined || json.Response === "False"){
                setStatusLines(`No movies found for "${movieTitle}".`, "Try another title or release year.")
            } else {
                let visibleResults = orderMovieResults(searchResults, movieTitle).slice(0, 9)
                let formattedTotal = Number(json.totalResults).toLocaleString()
                let resultLabel = Number(json.totalResults) === 1 ? "result" : "results"
                let visibleLabel = visibleResults.length === 1 ? "movie" : "movies"
                setStatusLines(`${formattedTotal} ${resultLabel} found for "${movieTitle}".`, `Showing ${visibleResults.length} ${visibleLabel}.`)
                movieBox.append(...visibleResults.map(createMovieCard))
                movieResults.hidden = false
            }

        })
        .catch(() => {
            movieStatus.textContent = "Unable to load movies. Please try again."
        })
        .finally(() => setLoading(false))
    })
}
