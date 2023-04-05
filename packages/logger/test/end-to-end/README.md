# End-to-end logger tests

We run some end-to-end tests to ensure that the API is compatible with n-logger
to make the migration path from n-logger easier.

Once FT teams have migrated away from n-logger, these tests become less relevant and
we can consider removing them and changing the API.

## How the tests work

In `compatibility-test-cases.js`, we have an array of tests to run. Each test contains:

- a `call` with a `method` and an array of positional `args`
- an object of `expectedOutput` to compare

The tests are generated in `compatibility.spec.js` by iterating over the test cases.
The test executes a separate `node` process - this is because it's very hard/impossible
to gather stdout from the Node process that the spec is currently running in.
