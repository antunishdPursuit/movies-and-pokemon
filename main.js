import clearBackground from "./clearBackground.png"
import defeatImage from "./defeat.gif"
import fightImage from "./fight.gif"
import leftImage from "./left.png"
import rightImage from "./right.png"

let playerPortrait = document.getElementById("randomPokemon")
let teamPokemonIds = [3, 6, 9, 12, 15, 18]
let playerTeamPokemon = document.querySelectorAll(".playerPokemon")
let teamPokemonChoices = document.querySelectorAll(".pokemon-choice")
let opponentPokemon = document.querySelectorAll(".trainerPokemon")
let opponentTeamPokemon = Array.from(opponentPokemon).slice(1)
let playerChoices = document.querySelectorAll(".starter-choice")
let playerBattlePokemon = document.querySelector("#gardevoir")
let battleResult = document.querySelector("#lopunny")
let opponentBattlePokemon = document.querySelector("#primarina")
let battleStatus = document.getElementById("changeText")
let resetButton = document.getElementById("resetGame")

let playerBattleScore = 0
let opponentBattleScore = 0
let playerMatchScore = 0
let opponentMatchScore = 0
let currentPlayer = ""
let completedPlayers = new Set()
let usedTeamPokemon = new Set()
let usedOpponentPokemon = new Set()
let battleInProgress = false
let matchOver = false
let roundReady = false

// PokeAPI failures should leave the page recoverable instead of blocking a new match.
function loadPokemon(id, image, sprite = "front_default") {
  fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`)
    .then((response) => response.json())
    .then((json) => {
      image.src = json.sprites[sprite]
    })
    .catch(() => {
      battleStatus.textContent = "Unable to load Pokemon. Please try again."
    })
}

function setBattleStatus(message) {
  battleStatus.replaceChildren()
  battleStatus.append(document.createTextNode(`Match: Player ${playerMatchScore} vs Opponent ${opponentMatchScore}`))

  if (battleInProgress) {
    battleStatus.append(
      document.createElement("br"),
      document.createTextNode(`Current battle: Player ${playerBattleScore} vs Opponent ${opponentBattleScore}`)
    )
  }

  if (message) {
    battleStatus.append(document.createElement("br"), document.createTextNode(message))
  }
}

function updatePlayerChoiceState() {
  playerChoices.forEach((choice) => {
    let playerName = choice.dataset.starter
    let state = "available"

    if (matchOver) {
      state = completedPlayers.has(playerName) ? "completed" : "locked"
    } else if (battleInProgress) {
      state = playerName === currentPlayer ? "active" : "locked"
    } else if (completedPlayers.has(playerName)) {
      state = "completed"
    }

    choice.dataset.playerState = state
    choice.disabled = state !== "available"
    choice.setAttribute("aria-pressed", String(state === "active"))
  })
}

function resetPokemonCycle(teamEnabled = true) {
  usedTeamPokemon.clear()
  usedOpponentPokemon.clear()

  teamPokemonChoices.forEach((choice) => {
    choice.dataset.teamState = "available"
    choice.disabled = !teamEnabled
  })
  opponentTeamPokemon.forEach((pokemon) => {
    pokemon.dataset.teamState = "available"
  })
}

function lockTeamChoices() {
  teamPokemonChoices.forEach((choice) => {
    choice.disabled = true
  })
}

function startBattle(playerName) {
  if (battleInProgress || matchOver || completedPlayers.has(playerName)) {
    return
  }

  currentPlayer = playerName
  playerBattleScore = 0
  opponentBattleScore = 0
  battleInProgress = true
  roundReady = false
  resetButton.hidden = true

  playerBattlePokemon.src = clearBackground
  battleResult.src = fightImage
  opponentBattlePokemon.src = clearBackground
  resetPokemonCycle()

  loadPokemon(playerName, playerPortrait, "front_shiny")

  let opponentIds = Array.from({ length: 7 }, () => Math.ceil(Math.random() * 1010))
  opponentPokemon.forEach((pokemon, index) => loadPokemon(opponentIds[index], pokemon))
  playerTeamPokemon.forEach((pokemon, index) => loadPokemon(teamPokemonIds[index], pokemon))

  updatePlayerChoiceState()
  setBattleStatus(`${playerName} is ready. Choose a Pokemon from the team.`)
}

function selectTeamPokemon(event) {
  if (!battleInProgress || matchOver) {
    return
  }

  let teamChoice = event.currentTarget
  if (usedTeamPokemon.has(teamChoice)) {
    return
  }

  let availableOpponents = opponentTeamPokemon.filter((pokemon) => !usedOpponentPokemon.has(pokemon))
  let opponent = availableOpponents[Math.floor(Math.random() * availableOpponents.length)]

  usedTeamPokemon.add(teamChoice)
  usedOpponentPokemon.add(opponent)
  teamChoice.dataset.teamState = "used"
  teamChoice.disabled = true
  opponent.dataset.teamState = "used"

  playerBattlePokemon.src = teamChoice.querySelector(".playerPokemon").src
  opponentBattlePokemon.src = opponent.src
  battleResult.src = fightImage
  roundReady = true
}

function finishMatch(winner) {
  matchOver = true
  battleInProgress = false
  roundReady = false
  currentPlayer = ""
  resetButton.hidden = false
  lockTeamChoices()
  updatePlayerChoiceState()

  if (winner === "Player") {
    setBattleStatus("Congratulations, you won the match! Want to play again?")
  } else {
    setBattleStatus("You lost the match. Try again?")
  }
}

function finishBattle(winner) {
  let finishedPlayer = currentPlayer
  completedPlayers.add(finishedPlayer)
  battleInProgress = false
  roundReady = false
  lockTeamChoices()

  if (winner === "Player") {
    playerMatchScore++
  } else {
    opponentMatchScore++
  }

  if (playerMatchScore === 2 || opponentMatchScore === 2) {
    finishMatch(playerMatchScore === 2 ? "Player" : "Opponent")
    return
  }

  currentPlayer = ""
  updatePlayerChoiceState()
  setBattleStatus(`${finishedPlayer}'s battle is over. Choose another player.`)
}

function resetMatch() {
  playerBattleScore = 0
  opponentBattleScore = 0
  playerMatchScore = 0
  opponentMatchScore = 0
  currentPlayer = ""
  completedPlayers.clear()
  battleInProgress = false
  matchOver = false
  roundReady = false
  resetButton.hidden = true

  playerPortrait.src = clearBackground
  playerBattlePokemon.src = clearBackground
  battleResult.src = fightImage
  opponentBattlePokemon.src = clearBackground
  resetPokemonCycle(false)

  updatePlayerChoiceState()
  setBattleStatus("Choose a player to begin the first battle.")
}

function resolveBattle() {
  // Mouseover can fire repeatedly; a new team choice is required for each score change.
  if (!roundReady || !battleInProgress || matchOver) {
    return
  }

  roundReady = false
  let playerWon = Math.random() >= 0.5

  if (playerWon) {
    playerBattleScore++
    battleResult.src = rightImage
    playerBattlePokemon.src = defeatImage
  } else {
    opponentBattleScore++
    battleResult.src = leftImage
    opponentBattlePokemon.src = defeatImage
  }

  if (playerBattleScore === 6) {
    finishBattle("Player")
  } else if (opponentBattleScore === 6) {
    finishBattle("Opponent")
  } else if (usedTeamPokemon.size === teamPokemonChoices.length) {
    resetPokemonCycle()
    setBattleStatus("All six Pokemon have battled. The teams are ready for another cycle.")
  } else {
    setBattleStatus("Choose another team Pokemon for the next round.")
  }
}

window.onload = () => {
  playerChoices.forEach((choice) => {
    choice.addEventListener("click", () => startBattle(choice.dataset.starter))
  })
  teamPokemonChoices.forEach((pokemon) => pokemon.addEventListener("click", selectTeamPokemon))
  battleResult.addEventListener("mouseover", resolveBattle)
  resetButton.addEventListener("click", resetMatch)
  resetMatch()
}
