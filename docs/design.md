
# Design Guide

This document outlines the design decisions made in this project.

  * [Languages](#languages)
    * [TypeScript](#typescript)
    * [Native ES Modules](#native-es-modules)
  * [Tooling](#tooling)
    * [Testing](#testing)
    * [Monorepo management](#monorepo-management)
    * [Release management](#release-management)
  * [Issues](#issues)


## Languages

We make two language decisions in this project:

  1. We author code in TypeScript (as of 2026, we previously authored JavaScript)

  2. We use Native ES Modules (as of 2026, we previously published CommonJS modules)

### TypeScript

In terms of TypeScript, the key benefits are having type safety and type hinting in your editor. We previously used [JavaScript with JSDoc comments to document types](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html) however support is lacking and we decided to move to using TypeScript with a build step in 2026.

### Native ES Modules

We write and publish modules as native ESM, which is well-supported in the latest versions of Node.js 22 and 24. We do not cross-compile to CommonJS as part of a build step.

The one thing we _don't_ do (due to limitations with importing ESM into CommonJS files) is use [top-level `await`](https://v8.dev/features/top-level-await) in our published modules. It's OK to use this in scripts and tools that only run as part of the development or build process.


## Tooling

This repository does not use [Tool Kit](https://github.com/Financial-Times/dotcom-tool-kit#readme). This is because, at the time of writing, Tool Kit did not have full support for managing and publishing packages in a monorepo. We copied many of the scripts and the CircleCI config from Tool Kit itself so that we can manage the monorepo in the same way. This may change in future.

### Testing

When testing a monorepo, running tests and linting can happen in one of two ways:

  1. Have tooling installed in the top level package and run these tools against the whole repo

  2. Have tooling installed in each package and have commands in the top level package to run these

We have opted to have tooling installed at the top level in most cases. This speeds up build times because multiplying startup times by the number of packages can lead to a lot of overhead. The exception is our tests, which are run via `node --test` from within each of the packages. There is more information on [how to run tests](./contributing.md#testing) in the contributing guide.

### Monorepo management

We decided that [npm workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces) and minimal tooling would be the best supported route forward. As we're opting for [testing at the top level](#testing), we have minimal need for running the same scripts across all packages. If we do want to then it's possible by adding the `--workspaces` flag to any npm command.

### Release management

We opted for [Conventional Commits](https://www.conventionalcommits.org/) as this allows us to programatically determine package version numbers and automate a lot of the release tasks related to managing a monorepo. As none of the team at the time were in the habit of writing commits this way, we adopted [commitlint](https://commitlint.js.org/) in order to enforce the rules. There is more information on [how to commit](./contributing.md#committing) in the contributing guide.


## Issues

We opted to use [GitHub issues](https://github.com/Financial-Times/dotcom-reliability-kit/issues) and a [project board](https://github.com/orgs/Financial-Times/projects/111) to track work that needs to be done on Reliability Kit. This is for several reasons:

  1. The project board can easily be public to match the repo. This allows people who aren't members of the Financial-Times GitHub org to contribute. The issues and progress tracking also lives alongside the code

  2. By using GitHub we don't have to manage access separately – all our engineers have access by default and anyone with a GitHub account can comment without needing to take up a license seat

  3. We can more easily manage issue and PR templates to suit our needs, as well as being able to add custom fields and views on our data
