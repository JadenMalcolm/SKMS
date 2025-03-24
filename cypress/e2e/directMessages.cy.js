describe('Login Test', () => {
  it('should login successfully with valid credentials', () => {
    cy.visit('/')

    // Ensure the email field is visible and enabled
    cy.get('#email').should('be.visible').and('not.be.disabled')
    cy.get('#email').type('admin@example.com')

    // Ensure the password field is visible and enabled
    cy.get('#password').should('be.visible').and('not.be.disabled')
    cy.get('#password').type('Admin@123')

    // Ensure the login button is visible and enabled
    cy.get('.login-button').should('be.visible').and('not.be.disabled')
    cy.get('.login-button').click()

    
  })

  it('should show error message with invalid credentials', () => {
    cy.visit('/')

    // Enter email and password
    cy.get('.form-group #email').type('invalid@example.com')
    cy.get('.form-group #password').type('wrongpassword')

    // Ensure the login button is visible and enabled
    cy.get('.login-button').should('be.visible').and('not.be.disabled')
    cy.get('.login-button').click()

    // Verify login error message
    cy.contains('Login failed. Please check your credentials.').should('be.visible')
  })

  it('should redirect to signup page', () => {
    cy.visit('/')

    // Ensure the signup link is visible and enabled
    cy.get('.signup-link').should('be.visible').and('not.be.disabled')
    cy.get('.signup-link').click()

    // Verify signup page
    cy.url().should('eq', 'http://localhost:5178/signup')
  })

  it('should display the dashboard after login', () => {
    cy.visit('/')

    // Enter email and password
    cy.get('#email').type('admin@example.com')
    cy.get('#password').type('Admin@123')

    // Ensure the login button is visible and enabled
    cy.get('.login-button').should('be.visible').and('not.be.disabled')
    cy.get('.login-button').click()

    // Verify dashboard content
    // Additional checks
    // Check for user-specific greeting message

    // Verify the presence of a logout button
    cy.get('.logout-button').should('be.visible')

    // Check for user-specific navigation items
    cy.get('.nav-item').contains('Profile').should('be.visible')
    cy.get('.nav-item').contains('Settings').should('be.visible')
  })
})
