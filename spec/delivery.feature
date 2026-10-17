Feature: Client-side application delivery
  The application runs as a React SPA. Void serves static HTML and API routes;
  it does not render application components or user data on the server.

  @delivery/spa-shell @api
  Scenario: Direct browser links receive the static application shell
    Given a browser opening a client route directly
    When Void serves the document
    Then it receives the same empty React mount point as the home document
    And the browser keeps its original path and query without a redirect
    And no application component or user data is server-rendered

  @delivery/api-boundary @api
  Scenario: API errors remain API responses
    Given an authenticated API client
    When it requests an unknown API route
    Then the response is 404
    And the response is not the SPA document

  @delivery/request-context @api
  Scenario: Requests retain their correlation and security headers
    Given a request with a valid request identifier
    When the application answers the request
    Then its response carries that identifier and a trace identifier
    And its security policy restricts scripts to the application origin
