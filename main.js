let pokeArr = ["gardevoir", "lopunny", "primarina"]
let randomPokemon = document.getElementById("randomPokemon")
let starterPokemonsters = [3, 6, 9, 12, 15, 18]
let playerPokemons = document.querySelectorAll(".playerPokemon")
let playerChoices = document.querySelectorAll(".pokemon-choice")
let trainerPokemons = document.querySelectorAll(".trainerPokemon")
let starterPokeballs = document.querySelectorAll(".pokeball")
let gardevoir = document.querySelector("#gardevoir")
let lopunny = document.querySelector("#lopunny")
let primarina = document.querySelector("#primarina")
let pokeballContainer = document.querySelector("#pokeballContainer")
let changeText = document.getElementById("changeText")
let resetButton = document.getElementById("resetGame")

let playerScore = 0
let enemyScore = 0
let gameStarted = false
let gameOver = false
let roundReady = false
let selectedStarter = ""

function loadPokemon(id, image, sprite = "front_default") {
  fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`)
    .then((response) => response.json())
    .then((json) => {
      image.src = json.sprites[sprite]
    })
    .catch(() => {
      changeText.textContent = "Unable to load Pokemon. Please try starting a new game."
    })
}

function updateBattleText(result = "") {
  changeText.replaceChildren()
  changeText.append(document.createTextNode(`Player: ${playerScore} Vs Enemy: ${enemyScore} => Win Condition: First to six!`))
  changeText.append(document.createElement("br"))

  let instructions = document.createElement("strong")
  instructions.textContent = "Instructions:"
  changeText.append(instructions, document.createElement("br"))
  changeText.append(document.createTextNode("Now we will showcase the mouseover event listner."), document.createElement("br"))
  changeText.append(document.createTextNode("After clicking on one of the pokemon on the left side, the chosen pokemon will move to the middle as well as a random pokemon from the right side."), document.createElement("br"))
  changeText.append(document.createTextNode("Move your mouse over the fight gif and it will show you who won the pokemon battle."), document.createElement("br"))
  changeText.append(document.createTextNode("Click on another pokemon from the left to have another pokemon battle."))

  if (result) {
    changeText.append(document.createElement("br"), document.createTextNode(result))
  }
}

function resetStarterPokeballs() {
  starterPokeballs.forEach((pokeball) => {
    pokeball.querySelector("img").src = "pokeball.png"
  })
  pokeballContainer.classList.remove("justify-content-between")
  pokeballContainer.classList.add("justify-content-center")
}

function startGame(starterName) {
  playerScore = 0
  enemyScore = 0
  gameStarted = true
  gameOver = false
  roundReady = false
  selectedStarter = starterName
  resetButton.hidden = true

  pokeballContainer.classList.remove("justify-content-center")
  pokeballContainer.classList.add("justify-content-between")
  gardevoir.src = "clearBackground.png"
  lopunny.src = "fight.gif"
  primarina.src = "clearBackground.png"

  loadPokemon(starterName, randomPokemon, "front_shiny")

  let randomSevenNumbers = Array.from({ length: 7 }, () => Math.ceil(Math.random() * 1010))
  trainerPokemons.forEach((pokemon, index) => loadPokemon(randomSevenNumbers[index], pokemon))
  playerPokemons.forEach((pokemon, index) => loadPokemon(starterPokemonsters[index], pokemon))

  updateBattleText()
}

function selectPlayerPokemon(event) {
  if (!gameStarted || gameOver) {
    return
  }

  let opponentTeam = Array.from(trainerPokemons).slice(1)
  let opponent = opponentTeam[Math.floor(Math.random() * opponentTeam.length)]

  gardevoir.src = event.currentTarget.querySelector(".playerPokemon").src
  primarina.src = opponent.src
  lopunny.src = "fight.gif"
  roundReady = true
}

function finishGame(winner) {
  gameOver = true
  roundReady = false
  resetStarterPokeballs()
  resetButton.hidden = false
  updateBattleText(`${winner} wins the game! Click a Pokeball to start a new game.`)
}

function resetGame() {
  if (selectedStarter) {
    startGame(selectedStarter)
  }
}

function resolveBattle() {
  if (!roundReady || gameOver) {
    return
  }

  roundReady = false
  let playerWon = Math.random() >= 0.5

  if (playerWon) {
    playerScore++
    lopunny.src = "right.png"
    gardevoir.src = "defeat.gif"
  } else {
    enemyScore++
    lopunny.src = "left.png"
    primarina.src = "defeat.gif"
  }

  if (playerScore === 6) {
    finishGame("Player")
  } else if (enemyScore === 6) {
    finishGame("Enemy")
  } else {
    updateBattleText()
  }
}

window.onload = () => {
  starterPokeballs.forEach((pokeball, index) => {
    pokeball.addEventListener("click", () => startGame(pokeArr[index]))
  })
  playerChoices.forEach((pokemon) => pokemon.addEventListener("click", selectPlayerPokemon))
  lopunny.addEventListener("mouseover", resolveBattle)
  resetButton.addEventListener("click", resetGame)
}
