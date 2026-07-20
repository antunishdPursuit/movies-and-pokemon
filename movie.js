let movieForm = document.querySelector("#movieForm")
let movieStatus = document.querySelector("#movieStatus")
let movieBox = document.querySelector("#movieBox")
let movieResultsTitle = document.querySelector("#movieResultsTitle")
let movieResultsSummary = document.querySelector("#movieResultsSummary")
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
    movieCard.dataset.imdbId = movie.imdbID

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
    return movieCard
}

function orderMovieResults(searchResults, query) {
    let normalizedQuery = query.toLowerCase()
    let startsWithQuery = searchResults.filter((movie) => movie.Title.toLowerCase().startsWith(normalizedQuery))
    let includesQuery = searchResults.filter((movie) => !movie.Title.toLowerCase().startsWith(normalizedQuery))
    return startsWithQuery.concat(includesQuery)
}

function setResultsHeading(title, summary) {
    movieResultsTitle.textContent = title
    movieResultsSummary.textContent = summary
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
        setResultsHeading(`Searching for "${movieTitle}"`, "Please wait while the movie results load.")
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
                setResultsHeading(`No results for "${movieTitle}"`, "Try a different title or release year.")
            } else {
                let visibleResults = orderMovieResults(searchResults, movieTitle).slice(0, 9)
                let formattedTotal = Number(json.totalResults).toLocaleString()
                let resultLabel = Number(json.totalResults) === 1 ? "result" : "results"
                let visibleLabel = visibleResults.length === 1 ? "movie" : "movies"
                setStatusLines(`${formattedTotal} ${resultLabel} found for "${movieTitle}".`, `Showing ${visibleResults.length} ${visibleLabel}.`)
                setResultsHeading(`Results for "${movieTitle}"`, `${formattedTotal} ${resultLabel} · Showing ${visibleResults.length}`)
                movieBox.append(...visibleResults.map(createMovieCard))
            }

        })
        .catch(() => {
            movieStatus.textContent = "Unable to load movies. Please try again."
            setResultsHeading("Results unavailable", "Please try the search again.")
        })
        .finally(() => setLoading(false))
    })
}
