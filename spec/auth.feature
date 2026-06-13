Feature: Authentication
  OIDC at the edge: the SPA logs in with the provider and stores the token; the
  API verifies the bearer JWT in middleware (no server-side session).

  @auth/require-token @api
  Scenario: Protected endpoints require a valid token
    Given a request without a valid bearer token
    When it calls a protected API endpoint
    Then the API responds 401

  @auth/me @api
  Scenario: A valid token identifies the user
    Given a valid bearer token
    When the client calls the current-user endpoint
    Then the API returns the user from the token claims
