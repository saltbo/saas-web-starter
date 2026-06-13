Feature: Notes
  Capture short text notes.

  # The id is the @<capability>/<slug> tag; the second tag is the layer that proves it.

  @notes/create @web
  Scenario: Create and list a note
    Given an empty notes list
    When the user submits a note
    Then the note appears in the list

  @notes/validate @api
  Scenario: Reject an empty note
    Given the notes form
    When the user submits blank text
    Then the note is rejected
