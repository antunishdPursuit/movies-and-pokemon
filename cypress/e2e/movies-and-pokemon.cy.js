const pokemonResponse = {
  sprites: {
    front_default: "clearBackground.png",
    front_shiny: "clearBackground.png"
  }
}

// Stub external APIs so these tests verify this project's UI and state behavior deterministically.
describe("Movies and Pokemon", () => {
  it("ends the Pokemon match when the player wins two battles", () => {
    cy.intercept("GET", "https://pokeapi.co/api/v2/pokemon/**", pokemonResponse)
    cy.visit("/")

    cy.get('button[aria-label="Choose Gardevoir as your player"]').focus().type("{enter}")
    cy.get('.player-choice[data-player-state="active"]').should("have.length", 1)
    cy.get('.player-choice[data-player-state="active"] img').should("have.attr", "alt", "Gardevoir, current player")
    cy.get('.player-choice[data-player-state="locked"]').should("have.length", 2)

    cy.window().then((window) => {
      cy.stub(window.Math, "random").returns(0.9)
    })

    for (let round = 0; round < 6; round++) {
      cy.get(".pokemon-choice").eq(round).click()
      cy.get(".pokemon-choice").eq(round).should("be.disabled").and("have.attr", "data-team-state", "used")
      cy.get('[aria-labelledby="opponent-team-title"] .trainerPokemon[data-team-state="used"]').should("have.length", round + 1)
      cy.get("#lopunny").trigger("mouseover")
    }

    cy.get("#changeText").should("contain", "Match: Player 1 vs Opponent 0")
    cy.get('.player-choice[data-player-state="completed"]').should("have.length", 1)
    cy.get('.player-choice[data-player-state="available"]').should("have.length", 2)

    cy.get('.player-choice[data-player="lopunny"]').click()
    for (let round = 0; round < 6; round++) {
      cy.get(".pokemon-choice").eq(round).click()
      cy.get("#lopunny").trigger("mouseover")
    }

    cy.get("#changeText").should("contain", "Match: Player 2 vs Opponent 0")
    cy.get("#changeText").should("contain", "Congratulations, you won the match!")
    cy.get("#resetGame").should("be.visible").click()
    cy.get("#resetGame").should("not.be.visible")
    cy.get("#changeText").should("contain", "Match: Player 0 vs Opponent 0")
    cy.get('.player-choice[data-player-state="available"]').should("have.length", 3)
    cy.get(".pokemon-choice").should("be.disabled")
  })

  it("restores both Pokemon teams after an unresolved six-Pokemon cycle", () => {
    cy.intercept("GET", "https://pokeapi.co/api/v2/pokemon/**", pokemonResponse)
    cy.visit("/")
    cy.get('.player-choice[data-player="gardevoir"]').click()

    cy.window().then((window) => {
      let randomCall = 0
      cy.stub(window.Math, "random").callsFake(() => {
        randomCall++
        if (randomCall % 2 === 1) {
          return 0
        }
        return randomCall % 4 === 2 ? 0.9 : 0.1
      })
    })

    for (let round = 0; round < 6; round++) {
      cy.get(".pokemon-choice").eq(round).click()
      cy.get("#lopunny").trigger("mouseover")
    }

    cy.get("#changeText").should("contain", "All six Pokemon have battled")
    cy.get('.pokemon-choice[data-team-state="available"]').should("have.length", 6).and("be.enabled")
    cy.get('[aria-labelledby="opponent-team-title"] .trainerPokemon[data-team-state="used"]').should("not.exist")
  })

  it("renders OMDb text as text and reports a successful search", () => {
    cy.intercept("GET", "https://www.omdbapi.com/**", {
      Response: "True",
      totalResults: "1",
      Search: [
        {
          Title: "<img src=x onerror=alert(1)>",
          Type: "movie",
          Year: "2026",
          imdbID: "tt1234567",
          Poster: "N/A"
        }
      ]
    })
    cy.visit("/about.html")

    cy.get("#movie").type("Batman")
    cy.get("#movieForm").submit()

    cy.get("#movieStatus").should("contain", "Total Movies: 1")
    cy.get(".movieBoxes").should("have.length", 1)
    cy.get(".movieBoxes p").first().should("contain.text", "<img src=x onerror=alert(1)>")
    cy.get(".movieBoxes img").should("have.length", 1)
  })

  it("shows a retry message when an OMDb request fails", () => {
    cy.intercept("GET", "https://www.omdbapi.com/**", { forceNetworkError: true })
    cy.visit("/about.html")

    cy.get("#movie").type("Batman")
    cy.get("#movieForm").submit()

    cy.get("#movieStatus").should("have.text", "Unable to load movies. Please try again.")
  })
})
