const pokemonResponse = {
  sprites: {
    front_default: "clearBackground.png",
    front_shiny: "clearBackground.png"
  }
}

// Stub external APIs so these tests verify this project's UI and state behavior deterministically.
describe("Movies and Pokemon", () => {
  it("uses the shared site shell on both pages", () => {
    const verifyShell = (activePage) => {
      cy.get(".site-header-art").should("have.length", 2).each(($image) => {
        expect($image[0].complete).to.equal(true)
        expect($image[0].naturalWidth).to.be.greaterThan(0)
        expect($image[0].alt).to.equal("")
      })
      cy.get(".site-brand").should("have.text", "Movies and Pokemon")
      cy.get(".site-nav a").should("have.length", 2)
      cy.get('.site-nav a[aria-current="page"]').should("have.text", activePage)
      cy.get(".site-footer-art").should(($image) => {
        expect($image[0].complete).to.equal(true)
        expect($image[0].naturalWidth).to.be.greaterThan(0)
        expect($image[0].alt).to.equal("")
      })
      cy.get(".site-footer").should("contain", "Movies and Pokemon").and("contain", "GitHub").and("contain", "LinkedIn")
    }

    cy.visit("/")
    verifyShell("Pokemon Battle")

    cy.visit("/about.html")
    verifyShell("Movie Search")
    cy.get("h1").should("have.text", "Find a movie to watch")
  })

  it("keeps the shared shell usable on a narrow screen", () => {
    cy.viewport(375, 667)

    ;["/", "/about.html"].forEach((path) => {
      cy.visit(path)
      cy.get(".site-header, .site-footer").each(($shell) => {
        const shell = $shell[0].getBoundingClientRect()
        expect(shell.left).to.be.at.least(0)
        expect(shell.right).to.be.at.most(375)
      })
      cy.get(".site-nav a").should("be.visible")
    })
  })

  it("keeps the ready-to-fight content inside the desktop battle stage", () => {
    cy.viewport(1903, 959)
    cy.intercept("GET", "https://pokeapi.co/api/v2/pokemon/**", pokemonResponse)
    cy.visit("/")

    cy.get('.player-choice[data-player="gardevoir"]').click()
    cy.get(".pokemon-choice").first().click()

    cy.get(".battle-stage").then(($stage) => {
      const stage = $stage[0].getBoundingClientRect()
      const selectors = ["#gardevoir", "#battleControl", "#primarina"]

      selectors.forEach((selector) => {
        const child = $stage[0].querySelector(selector).getBoundingClientRect()
        expect(child.left).to.be.at.least(stage.left)
        expect(child.right).to.be.at.most(stage.right)
        expect(child.top).to.be.at.least(stage.top)
        expect(child.bottom).to.be.at.most(stage.bottom)
      })

      const fight = $stage[0].querySelector("#battleControl").getBoundingClientRect()
      expect(fight.left + fight.width / 2).to.be.closeTo(stage.left + stage.width / 2, 1)
    })
  })

  it("ends the Pokemon match when the player wins two battles", () => {
    cy.intercept("GET", "https://pokeapi.co/api/v2/pokemon/**", pokemonResponse)
    cy.visit("/")
    cy.get(".game-instructions").should("contain", "Hover over or select Fight")

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
      if (round === 0) {
        cy.get("#battleControl").should("be.enabled").click()
        cy.get("#gardevoir").should("have.attr", "src").and("not.include", "defeat")
        cy.get("#primarina")
          .should("have.attr", "src")
          .and("include", "defeat")
        cy.get("#primarina").should(($image) => {
          expect($image[0].complete).to.equal(true)
          expect($image[0].naturalWidth).to.be.greaterThan(0)
          expect($image[0].alt).to.equal("")
        })
        cy.get("#lopunny").should(($image) => {
          expect($image[0].complete).to.equal(true)
          expect($image[0].naturalWidth).to.be.greaterThan(0)
          expect($image[0].src).to.include("right")
        })
        cy.get("#battleControl").should("have.css", "cursor", "default")
      } else {
        cy.get("#battleControl").trigger("mouseover")
      }
    }

    cy.get("#playerMatchScore").should("have.text", "1")
    cy.get("#opponentMatchScore").should("have.text", "0")
    cy.get('.player-choice[data-player-state="completed"]').should("have.length", 1)
    cy.get('.player-choice[data-player-state="available"]').should("have.length", 2)

    cy.get('.player-choice[data-player="lopunny"]').click()
    for (let round = 0; round < 6; round++) {
      cy.get(".pokemon-choice").eq(round).click()
      cy.get("#battleControl").trigger("mouseover")
    }

    cy.get("#playerMatchScore").should("have.text", "2")
    cy.get("#opponentMatchScore").should("have.text", "0")
    cy.get("#changeText").should("contain", "Congratulations, you won the match!")
    cy.get("#resetGame").should("be.visible").click()
    cy.get("#resetGame").should("not.be.visible")
    cy.get("#playerMatchScore").should("have.text", "0")
    cy.get("#opponentMatchScore").should("have.text", "0")
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
      cy.get("#battleControl").trigger("mouseover")
    }

    cy.get("#roundStatus").should("contain", "All six Pokemon have battled")
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
