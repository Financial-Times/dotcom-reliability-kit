
# Design Guide

This document outlines the design decisions made in this project.

  * [Languages](#languages)
    * [JavaScript](#javascript)
    * [CommonJS](#commonjs)
  * [Tooling](#tooling)
    * [Testing](#testing)
    * [Monorepo management](#monorepo-management)
    * [Release management](#release-management)


## Languages

We made two language decisions when starting this project:

  1. We decided to use JavaScript rather than TypeScript

  2. We decided to use CommonJS modules rather than ES Modules

The combination of the above allows us to work on and publish the packages in this monorepo without needing a build step. This means that the code we write is exactly the same as the code run inside our applications.

### JavaScript

In terms of TypeScript, the key benefits are having type safety and type hinting in your editor. We can achieve both of these without writing TypeScript. Using [JavaScript with JSDoc comments to document types](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html), VSCode (used by the majority of our engineers) offers the same level of type hinting as it does with TypeScript. It's also possible to run the TypeScript type checker against JavaScript code to verify that everything is type safe (e.g. using `tsc --checkJS`).

In order to be useful for TypeScript projects, we do still need to publish our modules with TypeScript type declaration files (`.d.ts`). We made this an automated step during publishing and when authoring modules you should still write JavaScript and JSDoc.

### CommonJS

If we wanted to support ES Modules (which _is_ the future direction I think we'll all go in) then we'd need to choose between one of the following, neither of which seems preferable to just sticking with CommonJS for now.

  1. We write our code in ES Modules but we cross-compile to CommonJS before publishing. This isn't ideal because it introduces a build step and steps away from "what you see is what's running in your app"

  2. We write our code in ES Modules and publish them as ES Modules with no cross-compilation. This makes them incompatible with a large number of our apps (many of them use CommonJS exclusively) and would tie adopting Reliability Kit to an unrelated migration step

A note that for now there is a small downside to sticking with CommonJS. It will continue to work [for the forseeable future](https://github.com/nodejs/node/issues/33954) in Node.js itself, but more modules on npm are switching to native ESM which is not very compatible with CommonJS. We may find ourselves forced to reconsider at some point if any of our key dependencies (e.g. Express or Jest) migrate to ESM-only and drop support for their old CommonJS versions.


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
