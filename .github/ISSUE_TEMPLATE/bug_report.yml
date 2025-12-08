name: Bug Report / Feature Request
description: Use this form to report bugs or request new features for the Order Processing System.
title: "[Bug] " # You can prepend [Feature] manually for feature requests
labels: ["bug"]
assignees: []

body:
  - type: dropdown
    id: type
    attributes:
      label: Issue Type
      description: Select whether this is a bug or a feature request.
      options:
        - Bug
        - Feature
    validations:
      required: true

  - type: textarea
    id: description
    attributes:
      label: Description
      description: Provide a clear and concise description of the issue or feature request.
      placeholder: "Describe what is not working or what you want to add."
    validations:
      required: true

  - type: textarea
    id: steps
    attributes:
      label: Steps to Reproduce (for bugs)
      description: List the steps to reproduce the bug. Leave blank for feature requests.
      placeholder: "1. Go to /api/books\n2. Submit invalid ISBN\n3. See error"
    validations:
      required: false

  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What should happen if the system worked correctly? Leave blank for feature requests.
      placeholder: "The API should return a 404 response with a clear error message."
    validations:
      required: false

  - type: textarea
    id: actual
    attributes:
      label: Actual Behavior
      description: What actually happens? Leave blank for feature requests.
      placeholder: "The API returns 500 Internal Server Error."
    validations:
      required: false

  - type: input
    id: environment
    attributes:
      label: Environment / Platform
      description: Specify OS, .NET version, Node.js version, browser, etc.
      placeholder: "Windows 11, .NET 10, Node 20, Chrome 120"
    validations:
      required: true

  - type: textarea
    id: additional
    attributes:
      label: Additional Information / Screenshots
      description: Add any logs, screenshots, or extra context that could help.
      placeholder: "Error log: ..."
    validations:
      required: false