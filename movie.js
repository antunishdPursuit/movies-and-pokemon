//
let movieForm = document.querySelector("#movieForm")
let error = document.querySelector("h4")
let movieBox = document.querySelector("#movieBox")
let movieSubmitButton = document.querySelector("#movieSubmt")
let count = 0

function setStatusLines(...lines) {
    error.replaceChildren()
    lines.forEach((line, index) => {
        if (index > 0) {
            error.append(document.createElement("br"))
        }
        error.append(document.createTextNode(line))
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
    movieSubmitButton.textContent = isLoading ? "Searching..." : "Movie Search"
}

window.onload = () => {
  movieForm.addEventListener("submit", (event) => {
    count++
        event.preventDefault()
        let movieType = event.target.movie.value.toLowerCase()
        const symbols = /[^\w]/g
        if(movieType.split(" ")[0].length < 3 || movieType.split(" ")[0].search(symbols) >= 0){
            setStatusLines("More than 3 Letters", "And no symbols")
        } else {
            error.textContent = "Movie Search"
            setLoading(true)
        fetch(`https://www.omdbapi.com/?apikey=5e8cd208&s=${movieType}`)
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
            error.textContent = "No Search Results, Please Try again"
            } else {
            setStatusLines(`Total Movies: ${json.totalResults}`, "Only displaying the top 10")
                for (let index = 0; index < searchResults.length; index++) {
                    const element = searchResults[index];
                    let lowerCased = element.Title.toLowerCase()
                    if(lowerCased.indexOf(movieType) === 0){
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
                    if(lowerCased.indexOf(movieType) !== 0){
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
            error.textContent = "Unable to load movies. Please try again."
        })
        .finally(() => setLoading(false))
        }
        event.target.movie.value = ""

    })
}
