# Tutorials and Demos for Vue

This is a collection of tutorials and demos. For a full listing of the packages, please see the [PACKAGES.md](PACKAGES.md) file.

## Building

There are two different ways to build and use the demos in this repo:

- Copy individual packges to their own directory. This strategy works best if you _do not_ have access to the full Ionic Security Trifecta and want to run one of the demos that only uses dependencies you have access to. See the [Build a Stand-alone Project](#build-a-stand-alone-project) section for details.
- Build within this monorepo using this `pnpm`. This strategy works best of you _do_ have access to the full Ionic Security Trifecta and understand the use of `pnpm`. See the [Build All](#build-all) section for details.

### Build a Stand-alone Project

If you do not have access to the full suite of `@ionic-enterprise` packages used by these demos, you may still be able to build specific demos. For example, if you only have access to Auth Connect, you can build the demos that _only_ depend on Auth Connect.

Here is an example of doing this for the `iv-ac` demo, which uses Identity Vault and Auth Connect:

- Clone this repo
- `cd tutorials-and-demos-vue`
- `cp -r demos/iv-ac ..`
- `cd ../iv-ac`
- Copy your `.npmrc` file. Some demos, such as the `tea-taster` demo, do not depend on any `@ionic-enterprise` packages. For such items, you can skip this step.
- `npm i`
- `npm run build`
- `npm run dev`
- etc...

**Note:** you can still use `pnpm` commands rather than `npm` commands if you desire.

### Build All

In order to install and build from this repo, you will need:

- [pnpm](https://pnpm.io/)
- Make sure you have access to Auth Connect, Identity Vault, and Secure Storage. Also, make sure you have previously registered an application using the [`ionic enterprise register`](https://ionicframework.com/docs/cli/commands/enterprise-register) command (which generates an .npmrc file). Copy the generated file to the root of this project.

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

- `pnpm --filter tea-taster dev`
- `pnpm --filter tea-taster android`
- `pnpm --filter tea-taster ios`

For more advanced uses of the Ionic or Capacitor CLIs you can also change to the package's directory and run them from there.

## Development Workflow

To develop any if the projects within the mono-repo, use the `--filter` option with a couple of standard scripts. For example, to work on the `tea-taster` demo, open a couple of terminal sessions and run the following commands:

- `pnpm --filter tea-taster dev`
- `pnpm --filter tea-taster test:dev`

## Credentials

Some of these applications use live backend APIs that require a login. In such cases, unless you have been given your own credentials, please use the following:

- **email:** `test@ionic.io`
- **password:** `Ion54321`

Happy Coding!
