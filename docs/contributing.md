
# Contributing

We're glad you want to contribute to Reliability Kit!

  * [Requirements](#requirements)
    * [Optional](#optional)
  * [Getting set up](#getting-set-up)
  * [Testing](#testing)
  * [Committing](#committing)
    * [Commit type prefixes](#commit-type-prefixes)
    * [Commit linting](#commit-linting)
    * [Merging pull requests](#merging-pull-requests)
  * [Releasing](#releasing)


## Requirements

In order to contribute and make changes to this repository, you'll need some software installed:

  * [Node.js](https://nodejs.dev/) v14 or higher

  * [npm](https://www.npmjs.com/) v7 or higher (usually bundled with Node.js)

### Optional

The following software will make your life easier when making changes to Reliability Kit:

  * [Volta](https://docs.volta.sh/guide/getting-started) can manage your Node.js and npm versions automatically


## Getting set up

To set up this repo to make changes locally, make sure you have all of the [required software](#requirements), then:

  * Clone this repo and `cd` into it
  * Run `npm install` to install dependencies
  * Run `npm test` to verify that everything's working


## Testing

TODO


## Committing

We require commit messages to be written using [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/). This is how our [automated release system](#releasing) knows what a given commit means.

```
<type>: <description>

[body]
```

### Commit type prefixes

The `type` can be any of `feat`, `fix`, `docs` or `chore`.

The prefix is used to calculate the semver release level:

| **type**  | when to use                                            | release level |
| --------- | ------------------------------------------------------ | ------------- |
| feat      | a feature has been added                               | `minor`       |
| fix       | a bug has been patched                                 | `patch`       |
| docs      | a change to documentation                              | none          |
| chore     | any changes that don't impact end users of the library | none          |

Indicate a breaking change by placing an `!` between the type name and the colon, e.g.

```
feat!: add a breaking feature
```

or

```
chore!: drop support for Node.js v12
```

### Commit linting

We use [commitlint](https://commitlint.js.org/) to enforce standard commit messages. If you're reviewing pull requests in this project then be sure to check that all commit messages conform anyway.

### Merging pull requests

In order to preserve conventional commits, pull requests must be merged or rebased rather than squashed. This is enforced in the repo.


## Releasing

Our releases are managed by [Release Please](https://github.com/googleapis/release-please#readme).

When a commit with the `feat` or `fix` [commit type prefix](#commit-type-prefixes) or a breaking change (`!`) reaches the `main` branch, a pull request will be opened with a name matching something like `chore: release main`. Merging this pull request will automatically create GitHub releases for each package as well as publishing the new package versions to npm.

If the PR is left alone, it will continue to be updated with new releases as more commits appear on the `main` branch.

Before approving and merging, it's important to review the release PR like you would any other to make sure that the expected package versions are being released.
