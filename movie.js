let movieForm = document.querySelector("#movieForm")
let movieStatus = document.querySelector("#movieStatus")
let movieBox = document.querySelector("#movieBox")
let movieSubmitButton = document.querySelector("#movieSubmt")
let count = 0

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
function createMovieField(label, value) {
    let field = document.createElement("p")
    let fieldLabel = document.createElement("strong")
    fieldLabel.textContent = `${label}:`
    field.append(fieldLabel, document.createTextNode(` ${value}`))
    return field
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

        count++
        setStatusLines(`Searching for "${movieTitle}"...`)
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
            let needToRemove = document.querySelectorAll(".remove")
            if(count > 1){
                for (let index = 0; index < needToRemove.length; index++) {
                    const element = needToRemove[index];
                    element.remove()

                }
            }
            if(searchResults === undefined || json.Response === "False"){
            setStatusLines(`No movies found for "${movieTitle}".`, "Try another title or release year.")
            } else {
            let formattedTotal = Number(json.totalResults).toLocaleString()
            let resultLabel = Number(json.totalResults) === 1 ? "result" : "results"
            let pageResultLabel = searchResults.length === 1 ? "result" : "results"
            setStatusLines(`${formattedTotal} ${resultLabel} found for "${movieTitle}".`, `Showing ${searchResults.length} ${pageResultLabel} on this page.`)
                let normalizedQuery = movieTitle.toLowerCase()
                for (let index = 0; index < searchResults.length; index++) {
                    const element = searchResults[index];
                    let lowerCased = element.Title.toLowerCase()
                    if(lowerCased.indexOf(normalizedQuery) === 0){
                        let movieSearched = document.createElement("div")
                        movieSearched.classList.add("col-md-4")
                        movieSearched.classList.add("col-sm-4")
                        movieSearched.classList.add("col-lg-4")
                        movieSearched.classList.add("remove")
                        movieSearched.classList.add("movieBoxes")
                        let poster = document.createElement("img")
                        poster.alt = element.Title
                        poster.classList.add("poster")
                        poster.src = element.Poster
                        let title = createMovieField("Title", element.Title)
                        let type = createMovieField("Type", element.Type)
                        let year = createMovieField("Year", element.Year)
                        let imdbID = createMovieField("ImdbID", element.imdbID)
                        movieSearched.append(poster)
                        movieSearched.append(title)
                        movieSearched.append(type)
                        movieSearched.append(year)
                        movieSearched.append(imdbID)
                        movieBox.append(movieSearched)
                    }
                }
                for (let index = 0; index < searchResults.length; index++) {
                    const element = searchResults[index];
                    let lowerCased = element.Title.toLowerCase()
                    if(lowerCased.indexOf(normalizedQuery) !== 0){
                        let movieSearched = document.createElement("div")
                        movieSearched.classList.add("col-md-4")
                        movieSearched.classList.add("col-sm-4")
                        movieSearched.classList.add("col-lg-4")
                        movieSearched.classList.add("remove")
                        movieSearched.classList.add("movieBoxes")
                        let poster = document.createElement("img")
                        poster.alt = element.Title
                        poster.classList.add("poster")
                        poster.src = element.Poster
                        let title = createMovieField("Title", element.Title)
                        let type = createMovieField("Type", element.Type)
                        let year = createMovieField("Year", element.Year)
                        let imdbID = createMovieField("ImdbID", element.imdbID)
                        movieSearched.append(poster)
                        movieSearched.append(title)
                        movieSearched.append(type)
                        movieSearched.append(year)
                        movieSearched.append(imdbID)
                        movieBox.append(movieSearched)
                    }
                }
            }

        })
        .catch(() => {
            movieStatus.textContent = "Unable to load movies. Please try again."
        })
        .finally(() => setLoading(false))
    })
}
