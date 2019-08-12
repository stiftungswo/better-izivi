describe('registering', function() {
  it('can register', function() {
    cy.visit('/');
    cy.get(':nth-child(1) > .nav-link').click();
    cy.get('input[type="password"].mt-2').type('password');
    cy.get('form > [type="button"]').click();
  });
});
