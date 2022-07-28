
# Contributing

We're glad you want to contribute to Reliability Kit!

  * [Requirements](#requirements)
    * [Optional](#optional)
  * [Getting set up](#getting-set-up)
  * [Creating a new package](#creating-a-new-package)
  * [Testing](#testing)
    * [Linters](#linters)
    * [Type safety](#type-safety)
    * [Unit tests](#unit-tests)
      * [Coverage](#coverage)
  * [Committing](#committing)
    * [Commit type prefixes](#commit-type-prefixes)
    * [Commit linting](#commit-linting)
    * [Merging pull requests](#merging-pull-requests)
  * [Releasing](#releasing)


## Requirements

In order to contribute and make changes to this repository, you'll need some software installed:

  * [Node.js](https://nodejs.dev) on a version defined in `package.json`: `engines.node`

  * [npm](https://www.npmjs.com) on a version defined in `package.json`: `engines.npm` (usually bundled with Node.js)

### Optional

The following software will make your life easier when making changes to Reliability Kit:

  * [Volta](https://docs.volta.sh/guide/getting-started) can manage your Node.js and npm versions automatically


## Getting set up

To set up this repo to make changes locally, make sure you have all of the [required software](#requirements), then:

  * Clone this repo and `cd` into it
  * Run `npm install` to install dependencies
  * Run `npm test` to verify that everything's working


## Creating a new package

To create a new package in this repo, run the following command. This will bootstrap the package files and make sure it's added to the [release configuration](#releasing) and is auto-versioned correctly.

The name of the package must be lowercase with words hyphen-delimited.

```
npm run create-package <NAME>
```

You'll need to manually add the package to the list of packages in the README once it's ready to be used by other teams.

You'll also need to manually add an entry for the package to [the Dependabot config](../.github/dependabot.yml) so that dependency update pull requests can be opened.


## Testing

Reliability Kit includes some tooling to ensure that code quality and consistency is high.

### Linters

JavaScript files are expected to pass the linting rules defined by the project ([ESLint](https://eslint.org/) and [Prettier](https://prettier.io/)). We attempt to run the linters on every commit, but you can also check lint errors manually either by installing the [VS Code ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) or by running the following locally:

```
npm run lint
```

The linters are also run on pull requests and linting errors will block merging, so it's useful to check before opening a PR.

### Type safety

We do not write TypeScript in this project, but we _do_ write [thorough JSDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html) and test against it which gives us all the benefits of TypeScript ([more info](./design.md#languages)).

We do not compile the code in our packages, but we do check that all variables are set to the correct types. If there are any type errors then you should see these in your editor if you're using VS Code. Otherwise type checking can be manually run as part of linting:

```
npm run lint
```

As with ESLint, we check types in pull requests and errors will block merging, so it's useful to check before opening a PR.

### Unit tests

We run unit tests with [Jest](https://jestjs.io/) and aim for [100% coverage](#coverage). Tests are written within each package (e.g. `packages/example/test/example.spec.js`) and are run in parallel. You can run the tests with the following:

```
npm run test
```

Tests are also run on pull requests and failing tests will block merging, so it's useful to check before opening a PR.

#### Coverage

We intentionally fail the unit tests if coverage drops below 100%. This library is meant to help our applications be more reliable and so it's important that we cover as many edge cases as possible. If you have a valid reason for some code not to be covered, e.g. an empty function as a default parameter, then [use code comments to disable coverage](https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md) for that line or block:

```js
/* istanbul ignore next */
function example() { console.log('this is not covered'); }
```

This is better than dropping the required coverage because:

  * We have to make an active and conscious decision to drop a piece of code below 100% coverage

  * The fact that code isn't covered is _documented_ in the code

  * It opens up discussion in the pull request when we see an uncovered piece of code – maybe the reviewer will have some useful ideas about how to make it possible to cover


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


### Commit linting

We use [commitlint](https://commitlint.js.org/) to enforce standard commit messages. If you're reviewing pull requests in this project then be sure to check that all commit messages conform anyway.

### Merging pull requests

In order to preserve conventional commits, pull requests must be merged or rebased rather than squashed. This is enforced in the repo.


## Releasing

Our releases are managed by [Release Please](https://github.com/googleapis/release-please#readme).

When a commit with the `feat` or `fix` [commit type prefix](#commit-type-prefixes) or a breaking change (`!`) reaches the `main` branch, a pull request will be opened with a name matching something like `chore: release main`. Merging this pull request will automatically create GitHub releases for each package as well as publishing the new package versions to npm.

If the PR is left alone, it will continue to be updated with new releases as more commits appear on the `main` branch.

Before approving and merging the release PR, make sure you review it. You need to check the package versions that it updates to make sure you’re only releasing the things you expect.
