import clearBackground from "./clearBackground.png"
import defeatImage from "./defeat.gif"
import fightImage from "./fight.gif"
import leftImage from "./left.png"
import pokeballImage from "./pokeball.png"
import rightImage from "./right.png"

let teamPokemonIds = [3, 6, 9, 12, 15, 18]
let playerTeamPokemon = document.querySelectorAll(".playerPokemon")
let teamPokemonChoices = document.querySelectorAll(".pokemon-choice")
let opponentPortrait = document.getElementById("randomShinyPokemon")
let opponentTeamPokemon = Array.from(document.querySelectorAll(".opponent-team-pokemon"))
let playerChoices = document.querySelectorAll(".player-choice")
let playerChoiceContainer = document.getElementById("playerChoiceContainer")
let playerBattlePokemon = document.querySelector("#gardevoir")
let battleResult = document.querySelector("#lopunny")
let battleControl = document.getElementById("battleControl")
let opponentBattlePokemon = document.querySelector("#primarina")
let battleStatus = document.getElementById("changeText")
let roundStatus = document.getElementById("roundStatus")
let playerBattleScoreOutput = document.getElementById("playerBattleScore")
let opponentBattleScoreOutput = document.getElementById("opponentBattleScore")
let playerMatchScoreOutput = document.getElementById("playerMatchScore")
let opponentMatchScoreOutput = document.getElementById("opponentMatchScore")
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

// Preload swapped battle art so fallback text does not flash during a round result.
;[defeatImage, leftImage, rightImage].forEach((source) => {
  let image = new Image()
  image.src = source
})

// PokeAPI failures should leave the page recoverable instead of blocking a new match.
function loadPokemon(id, image, sprite = "front_default") {
  fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`)
    .then((response) => response.json())
    .then((json) => {
      image.src = json.sprites[sprite]
    })
    .catch(() => {
      roundStatus.textContent = "Unable to load Pokemon. Please try again."
    })
}

function updateScoreDisplays() {
  playerBattleScoreOutput.textContent = playerBattleScore
  opponentBattleScoreOutput.textContent = opponentBattleScore
  playerMatchScoreOutput.textContent = playerMatchScore
  opponentMatchScoreOutput.textContent = opponentMatchScore
}

function setMatchStatus(message) {
  updateScoreDisplays()
  battleStatus.textContent = message
}

function setRoundStatus(message) {
  updateScoreDisplays()
  roundStatus.textContent = message
}

function updatePlayerChoiceState() {
  playerChoices.forEach((choice) => {
    let playerName = choice.dataset.player
    let displayName = choice.querySelector("span").textContent
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

    if (state === "active") {
      choice.setAttribute("aria-label", `${displayName} is the current player`)
    } else if (state === "completed") {
      choice.setAttribute("aria-label", `${displayName} has completed a battle`)
    } else if (state === "locked") {
      choice.setAttribute("aria-label", `${displayName} is unavailable`)
    } else {
      choice.setAttribute("aria-label", `Choose ${displayName} as your player`)
    }
  })

  if (matchOver) {
    playerChoiceContainer.dataset.selectionState = "match-over"
  } else if (battleInProgress) {
    playerChoiceContainer.dataset.selectionState = "battle"
  } else if (completedPlayers.size > 0) {
    playerChoiceContainer.dataset.selectionState = "between-battles"
  } else {
    playerChoiceContainer.dataset.selectionState = "ready"
  }
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
  playerBattlePokemon.alt = ""
  battleResult.src = fightImage
  battleResult.alt = "Fight"
  opponentBattlePokemon.src = clearBackground
  opponentBattlePokemon.alt = ""
  battleControl.disabled = true
  resetPokemonCycle()

  let selectedPlayerChoice = Array.from(playerChoices).find((choice) => choice.dataset.player === playerName)
  let selectedPlayerImage = selectedPlayerChoice.querySelector("img")
  selectedPlayerImage.alt = `${selectedPlayerChoice.querySelector("span").textContent}, current player`
  loadPokemon(playerName, selectedPlayerImage, "front_shiny")

  let opponentIds = Array.from({ length: 7 }, () => Math.ceil(Math.random() * 1010))
  loadPokemon(opponentIds[0], opponentPortrait)
  opponentTeamPokemon.forEach((pokemon, index) => loadPokemon(opponentIds[index + 1], pokemon))
  playerTeamPokemon.forEach((pokemon, index) => loadPokemon(teamPokemonIds[index], pokemon))

  updatePlayerChoiceState()
  setMatchStatus("Battle in progress.")
  setRoundStatus(`${playerName} is ready. Choose a Pokemon from the team.`)
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
  playerBattlePokemon.alt = "Player's selected Pokemon"
  opponentBattlePokemon.src = opponent.src
  opponentBattlePokemon.alt = "Opponent's selected Pokemon"
  battleResult.src = fightImage
  battleResult.alt = "Fight"
  roundReady = true
  battleControl.disabled = false
  setRoundStatus("Hover over or select Fight to resolve this round.")
}

function finishMatch(winner) {
  matchOver = true
  battleInProgress = false
  roundReady = false
  currentPlayer = ""
  resetButton.hidden = false
  battleControl.disabled = true
  lockTeamChoices()
  updatePlayerChoiceState()

  if (winner === "Player") {
    setMatchStatus("Congratulations, you won the match! Want to play again?")
  } else {
    setMatchStatus("You lost the match. Try again?")
  }
  roundStatus.textContent = "The match is over."
}

function finishBattle(winner) {
  let finishedPlayer = currentPlayer
  completedPlayers.add(finishedPlayer)
  battleInProgress = false
  roundReady = false
  battleControl.disabled = true
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
  setMatchStatus(`${finishedPlayer}'s battle is over. Choose another player.`)
  roundStatus.textContent = "Battle complete."
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

  playerChoices.forEach((choice) => {
    choice.querySelector("img").src = pokeballImage
    choice.querySelector("img").alt = ""
  })
  playerBattlePokemon.src = clearBackground
  playerBattlePokemon.alt = ""
  battleResult.src = fightImage
  battleResult.alt = "Fight"
  opponentBattlePokemon.src = clearBackground
  opponentBattlePokemon.alt = ""
  opponentPortrait.src = clearBackground
  battleControl.disabled = true
  resetPokemonCycle(false)

  updatePlayerChoiceState()
  setMatchStatus("Choose a player to begin the first battle.")
  roundStatus.textContent = "Choose a player, then choose a team Pokemon."
}

function resolveBattle() {
  // Mouseover can fire repeatedly; a new team choice is required for each score change.
  if (!roundReady || !battleInProgress || matchOver) {
    return
  }

  roundReady = false
  battleControl.disabled = true
  let playerWon = Math.random() >= 0.5

  if (playerWon) {
    playerBattleScore++
    battleResult.src = rightImage
    battleResult.alt = ""
    opponentBattlePokemon.src = defeatImage
    opponentBattlePokemon.alt = ""
  } else {
    opponentBattleScore++
    battleResult.src = leftImage
    battleResult.alt = ""
    playerBattlePokemon.src = defeatImage
    playerBattlePokemon.alt = ""
  }

  if (playerBattleScore === 6) {
    finishBattle("Player")
  } else if (opponentBattleScore === 6) {
    finishBattle("Opponent")
  } else if (usedTeamPokemon.size === teamPokemonChoices.length) {
    resetPokemonCycle()
    setRoundStatus("All six Pokemon have battled. The teams are ready for another cycle.")
  } else {
    setRoundStatus(`${playerWon ? "Player" : "Opponent"} won this round.`)
  }
}

window.onload = () => {
  playerChoices.forEach((choice) => {
    choice.addEventListener("click", () => startBattle(choice.dataset.player))
  })
  teamPokemonChoices.forEach((pokemon) => pokemon.addEventListener("click", selectTeamPokemon))
  battleControl.addEventListener("mouseover", resolveBattle)
  battleControl.addEventListener("click", resolveBattle)
  resetButton.addEventListener("click", resetMatch)
  resetMatch()
}
