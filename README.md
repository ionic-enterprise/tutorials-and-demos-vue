# Tutorials and Demos for Vue

This is a collection of tutorials and demos.

## Packages

### Auth Connect

The `auth-connect` collection contains applications whose primary purpose is to highlight the use of [Auth Connect](https://ionic.io/docs/auth-connect). At this time, all of the projects contained here are examples for our Auth Connect Tutorials.

#### Getting Started

The `auth-connect/getting-started` project is the output of the basic Auth Connect training and serves as the basis for the other targeted tutorials.

#### Refresh Workflow

The `auth-connect/refresh-workflow` project demonstrates one way of implementing a refresh flow within an application that uses Auth Connect. It is sufficient for use as-is but can also be used as the basis for a more complex workflow if needed.

### Identity Vault

The `identity-vault` collection contains applications whose primary purpose is to highlight the use of [Identity Vault](https://ionic.io/docs/auth-connect). At this time this area is under construction.

### Demos

The `demos` collection contain applications whose primary purpose does not fit into any of the other package collections.

## Building

### Prerequisites

In order to install and build from this repo, you will need:

- [pnpm](https://pnpm.io/)
- Make sure you have access to Auth Connect, Identity Vault, and Secure Storage. Also, make sure you have previously registered an application using the [`ionic enterprise register`](https://ionicframework.com/docs/cli/commands/enterprise-register) command (which generates an .npmrc file). Copy the generated file to the root of this project.

If you do not have access to all three solutions, you may be able to build some of the demos by copying them to their own directory and building from there. See the [Build a Stand-alone Project](#build-a-stand-alone-project) section for details.

### Build All

If you have purchased access to all three solutions in the Security Trifecta, it is easiest to build all of the demos and tutorials as a set. To do so:

- Clone this repo
- `cd tutorials-and-demos-vue`
- Copy your `.npmrc` file to the root of this project if you have not done so yet (see above).
- `pnpm i`
- `pnpm test` (optional)
- `pnpm build`

You are now ready to run any of the individual demos following the instructions in the next section.

### Running a Package

All projects contain the following scripts:

- `dev`: Run the package in the development server so it can be accessed via the web browser.
- `android`: Load the package in Android Studio for deploying to a device or simulator.
- `ios`: Load the package in Xcode for deploying to a device or simulator.

Use the `--filter` option to specify a package. For example, if you are interested in running `tea-taster` use any of the following commands:

- `pnpm --filter ./demos/tea-taster dev`
- `pnpm --filter ./demos/tea-taster android`
- `pnpm --filter ./demos/tea-taster ios`

For more advanced uses of the Ionic or Capacitor CLIs you can also change to the package's directory and run them from there.

### Build a Stand-alone Project

If you do not have access to the full suite of `@ionic-enterprise` packages used by these demos, you may still be able to build specific demos. For example, if you only have access to Auth Connect, you can build the demos that _only_ depend on Auth Connect.

Here is an example of doing this for the `tea-taster-iv-ac` demo, which uses Identity Vault and Auth Connect:

- Clone this repo
- `cd tutorials-and-demos-vue`
- `cp -r demos/tea-taster-iv-ac ..`
- `cd ../tea-taster-iv-ac`
- Copy your `.npmrc` file. Some demos, such as the base `tea-taster` demo, do not depend on any `@ionic-enterprise` packages. For such items, you can skip this step.
- `pnpm i`
- `pnpm build`
- `pnpm dev`
- etc...

## Development Workflow

To develop any if the projects within the mono-repo, use the `--filter` option with a couple of standard scripts. For example, to work on the `tea-taster` demo, open a couple of terminal sessions and run the following commands:

- `pnpm --filter ./demos/tea-taster dev`
- `pnpm --filter ./demos/tea-taster test:dev`

## Credentials

Some of these applications use live backend APIs that require a login. In such cases, unless you have been given your own credentials, please use the following:

- **email:** `test@ionic.io`
- **password:** `Ion54321`

Happy Coding!
