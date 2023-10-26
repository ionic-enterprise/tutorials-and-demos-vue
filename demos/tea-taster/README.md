# Tea Taster

An application for storing tea tasting notes. This application is the output of the three day Ionic Framework Enterprise training. It is also used as the starting point for some of our other product demos such as the demos for Identity Vault and Auth Connect.

## Building

If you would like to build this application yourself, do the following:

- Clone this repo
- `cd tutorials-and-demos-vue`
- Make sure you have access to Auth Connect, Identity Vault, and Secure Storage. Also, make sure you have previously registered an application using the [`ionic enterprise register`](https://ionicframework.com/docs/cli/commands/enterprise-register) command (which generates an .npmrc file). Copy the generated file to the root of this project.
- `pnpm i`
- `pnpm build` (or `pnpm --filter ./demos/tea-taster build` to only build _this_ package)
- `pnpm --filter ./demos/tea-taster dev`
- To open the project in one of the native IDEs, do the following:
  - `pnpm --filter ./demos/tea-taster android`
  - `pnpm --filter ./demos/tea-taster ios`

If you do not have access to the full Security Trifecta, you can still build this project by copying it out of the monorepo. For example:

- Clone this repo
- `cd tutorials-and-demos-vue`
- `cp -r demos/tea-taster ..`
- `cd ../tea-taster`
- `pnpm i`
- etc...

## Credentials

This application uses a live backend API that requires a login. Unless you have your own credentials, please use the following:

- **email:** `test@ionic.io`
- **password:** `Ion54321`

Happy Coding!
