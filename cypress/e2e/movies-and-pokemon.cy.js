const pokemonResponse = {
  sprites: {
    front_default: "clearBackground.png",
    front_shiny: "clearBackground.png"
  }
}

// Stub external APIs so these tests verify this project's UI and state behavior deterministically.
describe("Movies and Pokemon", () => {
  it("supports a complete keyboard-playable Pokemon game", () => {
    cy.intercept("GET", "https://pokeapi.co/api/v2/pokemon/**", pokemonResponse)
    cy.visit("/")

    cy.get('button[aria-label="Start a game with Gardevoir"]').focus().type("{enter}")
    cy.get("#changeText").should("contain", "Player: 0 Vs Enemy: 0")

    cy.window().then((window) => {
      cy.stub(window.Math, "random").returns(0.9)
    })

    for (let round = 0; round < 6; round++) {
      cy.get(".pokemon-choice").first().click()
      cy.get("#lopunny").trigger("mouseover")
    }

    cy.get("#changeText").should("contain", "Player wins the game!")
    cy.get("#resetGame").should("be.visible").click()
    cy.get("#resetGame").should("not.be.visible")
    cy.get("#changeText").should("contain", "Player: 0 Vs Enemy: 0")
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
