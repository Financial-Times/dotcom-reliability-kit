
# Contributing

We're glad you want to contribute to Reliability Kit!

  * [Requirements](#requirements)
    * [Optional](#optional)
  * [Getting set up](#getting-set-up)
  * [Creating a new package](#creating-a-new-package)
  * [Installing dependencies](#installing-dependencies)
    * [Repo-wide dependencies](#repo-wide-dependencies)
    * [Package dependencies](#package-dependencies)
    * [Depending on other Reliability Kit packages](#depending-on-other-reliability-kit-packages)
  * [Testing](#testing)
    * [Node.js support](#nodejs-support)
      * [Supporting a new Node.js version](#supporting-a-new-nodejs-version)
      * [Switching the default LTS Node.js version](#TODO)
      * [Dropping support for a Node.js version](#dropping-support-for-a-nodejs-version)
    * [Linters](#linters)
    * [Type safety](#type-safety)
    * [Unit tests](#unit-tests)
      * [Coverage](#coverage)
  * [Committing](#committing)
    * [Commit type prefixes](#commit-type-prefixes)
    * [Commit linting](#commit-linting)
    * [Pull request scope](#pull-request-scope)
    * [Merging pull requests](#merging-pull-requests)
  * [Releasing](#releasing)
    * [Generated files](#generated-files)
    * [Correcting releases](#correcting-releases)
  * [Issue management](#issue-management)


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


## Installing dependencies

Because we use a monorepo managed with [npm workspaces](./design.md#monorepo-management), installing dependencies is slightly different to other projects. You'll need to adjust the way you install dependencies as follows. If you're reviewing a pull request on Reliability Kit, then please also check that dependencies have been installed in the expected places.

### Repo-wide dependencies

The top level `package.json` file should _never_ include any dependencies apart from `devDependencies`. If you install the dependencies that individual packages rely on here then they will not have access to them after publishing.

If you need a new development dependency that is used across the whole repository, then you can install it as normal by running the following from the repo base path:

```
npm install --save-dev <DEPENDENCY_NAME>
```

### Package dependencies

If a specific package relies on a new dependency, then you **must not** `cd` into the package and run an `npm install`. This will end up creating a `package-lock.json` file within that folder and cause all sorts of dependency issues. Instead, you must use the `--workspace` flag, setting it to the package you want to install a dependency in:

```
npm install --workspace=packages/<PACKAGE_NAME> <DEPENDENCY_NAME>
```

This ensures that we continue to maintain a single `package-lock.json` file in the root of the repo.

Some packages may also require their own specific development dependencies, for example `@types` packages or specific modules required for testing that package alone. This can be done with the `--workspace` flag too:

```
npm install --save-dev --workspace=packages/<PACKAGE_NAME> <DEPENDENCY_NAME>
```

### Depending on other Reliability Kit packages

If a package within Reliability Kit relies on _another_ Reliability Kit package, you'll still need to codify this relationship in the `package.json` file for the dependent package. You can do this normally with an `npm install`, using the full `@dotcom-reliability-kit/<NAME>` package name. For example if your package relies on the internal `errors` package then you'd run this:

```
npm install --workspace=packages/<PACKAGE_NAME> @dotcom-reliability-kit/errors
```


## Testing

Reliability Kit includes some tooling to ensure that code quality and consistency is high.

### Node.js support

Reliability Kit aims to support all versions of Node.js which are in the "Active <abbr title="Long Term Support">LTS</abbr>" or "Maintenance" [release phase](https://github.com/nodejs/Release#release-phases). We run all linting and tests on all the versions of Node.js that we support and we document the supported versions in the `package.json` `engines.node` field for the project and for each individual package.

As well as the LTS versions of Node.js, we also try to immediately support Node.js versions in the "Current" release phase as long as they're an even major version number. We never support odd version numbered Node.js as these do not transition into LTS or Maintenance phases.

#### Supporting a new Node.js version

We aim to support new even Node.js versions as soon as they're released, but we need to wait until we can automate testing for that version. That relies on a new [CircleCI node image](https://circleci.com/developer/images/image/cimg/node) being published.

Once that's done, you need to do the following:

  1. Add the new Node.js version to all `package.json` files in the repo under the `engines.node` property. You must add new versions with a double pipe and follow the `MAJOR.x` format, e.g. append the existing engines with ` || 28.x`.

  2. Update the [CircleCI config](../.circleci/config.yml) matrix builds to add the new Node.js version to the array of versions. For this you'll need the full version number, e.g. `28.0.0`. Find all instances of `node-version: ` and update the array. 

  3. Commit your changes under a `feat: support Node.js XXX` commit ([see committing guide](#committing)) and open a pull request. We consider officially supporting a new version of Node.js to be a feature-level release.

#### Switching the default LTS Node.js version

When a new version of Node.js moves from the "Current" to "Active LTS" release phase, we set that version of Node.js to be the default version for the project. You can do this by:

  1. Update the [CircleCI config](../.circleci/config.yml) default Node.js version to the new Active LTS version of Node.js. Find an instance of `node-version` with a `default` property and set that string to the new version.

  2. Update the Volta config in [`package.json`](../package.json) so that we use the latest LTS version of Node.js when developing locally.

  3. Commit your changes under a `chore: switch active LTS versions` commit ([see committing guide](#committing)) and open a pull request. We consider switching the default version of Node.js as a chore-level commit, because it has no impact on our actual Node.js support – we still test against all other versions.

#### Dropping support for a Node.js version

When a Node.js version reaches end-of-life and is no longer maintained, we can consider dropping support for it in Reliability Kit. This should be a discussion – just because a version is end-of-life it doesn't mean we've fully migrated away from it. When dropping support for a Node.js version in Reliability Kit you should consider all of the users we support.

If we decide to drop support for a Node.js version, e.g. we want to start using features available only in later versions, then do the following:

  1. Remove the Node.js version from the `engines.node` property in all `package.json` files in the repo. Remove the version as well as the double pipe which separates it from the next version.

  2. Update the [CircleCI config](../.circleci/config.yml) Node.js versions in each matrix to remove the old Node.js version. Find instances of `node-version` with an array and remove the relevant items.

  3. Commit your changes under a `chore!: drop support for Node.js XXX` commit ([see committing guide](#committing)) and open a pull request. We consider removing a Node.js version to be a breaking chore because it requires changes in dependent apps – they are forced to migrate Node.js versions.

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
| docs      | a change to documentation                              | `patch`       |
| chore     | repo maintenance and support tasks                     | none          |

Indicate a breaking change by placing an `!` between the type name and the colon, e.g.

```
feat!: add a breaking feature
```

### Commit linting

We use [commitlint](https://commitlint.js.org/) to enforce standard commit messages. If you're reviewing pull requests in this project then be sure to check that all commit messages conform anyway.

### Pull request scope

Because of the way [our release process](#releasing) works (as well as smaller focused PRs being easier to understand and review) it's important to consider the scope of the changes in your PR. When calculating the next version bump for a package, Release Please will look at all the files in the pull request rather than just the files related to the individual commits. This can cause unwanted version bumps, e.g. a `docs` changes in the root of the repo can end up creating extra `patch` releases of packages that aren't actually impacted by it.

This makes it important to consider whether the changes you're making outside of the `packages` folder really belong in the same PR as changes to packages. If you're making broad changes to the repo this can result in unnecessary version bumps for packages if you use anything other than a `chore` commit for them.

If superflous releases are generated after merging a PR, [it's possible to fix it](#correcting-releases).


### Merging pull requests

In order to preserve conventional commits, pull requests must be merged or rebased rather than squashed. This is enforced in the repo.


## Releasing

Our releases are managed by [Release Please](https://github.com/googleapis/release-please#readme).

When a commit with the `feat` or `fix` [commit type prefix](#commit-type-prefixes) or a breaking change (`!`) reaches the `main` branch, a pull request will be opened with a name matching something like `chore: release main`. Merging this pull request will automatically create GitHub releases for each package as well as publishing the new package versions to npm.

If the PR is left alone, it will continue to be updated with new releases as more commits appear on the `main` branch.

Before approving and merging the release PR, make sure you review it. You need to check the package versions that it updates to make sure you’re only releasing the things you expect.

### Generated files

Before publishing npm packages we do generate TypeScript type declaration files (`.d.ts`) so that TypeScript-based projects which use Reliability Kit will get correct type hinting.

If a release has caused issues with Type hinting or TypeScript-based projects compiling, then you can inspect the generated files by running the build command locally and viewing the `.d.ts` files in your editor:

```
npm run build
```

### Correcting releases

Sometimes the releases that Release Please decides to create may be incorrect, because of the way it bumps packages for _all_ changed files in a PR. Considering [pull request scope](#pull-request-scope) is important, but sometimes it's unavoidable that some additional changes sneak in. In this case it's possible to change the releases that an already-merged PR will create.

[Update the PR description with a special override to correct the release type](https://github.com/googleapis/release-please/blob/main/README.md#how-can-i-fix-release-notes) and re-run the Release Please command locally:

```
npx release-please release-pr --token="XXXXXX" --repo-url="Financial-Times/dotcom-reliability-kit"
```

In this command, change `XXXXXX` to a GitHub token with write access to the Reliability Kit repo. This can be a personal or bot token, but it's best to use the one defined in the [Dotcom Reliability Kit vault](https://vault.in.ft.com:8080/ui/vault/secrets/secret/show/teams/next/dotcom-reliability-kit/continuous-integration) as `RELEASE_PLEASE_GITHUB_TOKEN`.

[There's an example of a PR which we did this for here](https://github.com/Financial-Times/dotcom-reliability-kit/pull/116).


## Issue management

We use [GitHub issues](https://github.com/Financial-Times/dotcom-reliability-kit/issues) and a [project board](https://github.com/orgs/Financial-Times/projects/111) to track work that needs to be done on Reliability Kit.

You can track the work that we're doing in the roadmap on our project board, and feel free to open new bug reports and feature requests on the repo.

If you're managing issues, we have a [suite of labels](https://github.com/Financial-Times/dotcom-reliability-kit/labels). As well as the usual `bug` or `enhancement` labels, we also use the following to help us categorise and prioritise work:

| **label**  | when to use |
| ----- | ----- |
| `package: <NAME>` | Used to help us filter bugs and issues by package. Add these labels to an issue so we can see if a particular package is causing us more problems over time |
| `requested` | Used to indicate that a team outside of the maintainers of Reliability Kit have requested this feature, which helps us prioritise it against other work |
