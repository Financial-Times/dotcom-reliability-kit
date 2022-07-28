
# Design Guide

This document outlines the design decisions made in this project.

  * [Languages](#languages)
  * [Tooling](#tooling)
    * [Testing](#testing)
    * [Monorepo management](#monorepo-management)
    * [Release management](#release-management)


## Languages

We made two language decisions when starting this project:

  1. We decided to use JavaScript rather than TypeScript

  2. We decided to use CommonJS modules rather than ES Modules

The combination of the above allows us to work on and publish the packages in this monorepo without needing a build step. This means that the code we write is exactly the same as the code run inside our applications.

In terms of TypeScript, the key benefits are having type safety and type hinting in your editor. We can achieve both of these without writing TypeScript. Using [JavaScript with JSDoc comments to document types](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html), VSCode (used by the majority of our engineers) offers the same level of type hinting as it does with TypeScript. It's also possible to run the TypeScript type checker against JavaScript code to verify that everything is type safe (e.g. using `tsc --checkJS`).


## Tooling

This repository does not use [Tool Kit](https://github.com/Financial-Times/dotcom-tool-kit#readme). This is because, at the time of writing, Tool Kit did not have full support for managing and publishing packages in a monorepo. We copied many of the scripts and the CircleCI config from Tool Kit itself so that we can manage the monorepo in the same way. This may change in future.

### Testing

When testing a monorepo, running tests and linting can happen in one of two ways:

  1. Have tooling installed in the top level package and run these tools against the whole repo

  2. Have tooling installed in each package and have commands in the top level package to run these

We have opted to have tooling installed at the top level. This speeds up build times, because Jest and ESLint have non-trivial start up times and multiplying this by the number of packages can lead to a lot of overhead. This also means that the tooling is consistent between all of the different packages and upgrading the tooling happens in one place. There is more information on [how to run tests](./contributing.md#testing) in the contributing guide.

### Monorepo management

We decided that [npm workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces) and minimal tooling would be the best supported route forward. As we're opting for [testing at the top level](#testing), we have minimal need for running the same scripts across all packages. If we do want to then it's possible by adding the `--workspaces` flag to any npm command.

### Release management

We opted for [Conventional Commits](https://www.conventionalcommits.org/) as this allows us to programatically determine package version numbers and automate a lot of the release tasks related to managing a monorepo. As none of the team at the time were in the habit of writing commits this way, we adopted [commitlint](https://commitlint.js.org/) in order to enforce the rules. There is more information on [how to commit](./contributing.md#committing) in the contributing guide.
