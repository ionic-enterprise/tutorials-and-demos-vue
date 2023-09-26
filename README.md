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

The `demos` collection contain applications whose primary purpose does not fit into any of the other package collections. At this time this area is under construction.

## Building

In order to install and build from this repo, you will need:

- [pnpm](https://pnpm.io/)
- Access to [Auth Connect](https://ionic.io/docs/auth-connect), [Identity Vault](https://ionic.io/docs/identity-vault), and [Secure Storage](https://ionic.io/docs/secure-storage).

If you do not have access to all three products, you can still install and build any given tutorial or demo by copying it to its own directory somewhere.

To build:

- Clone the repo and change directory into it.
- Copy the `.npmrc` file that contains your Ionic Enterprise key (see our [registration docs](https://ionic.io/docs/enterprise-starter/enterprise-key) for details).
- `pnpm install`
- `pnpm build`

To run any given project using the development server, use `pnpm --filter [project] start`. For example: `pnpm --filter ./auth-connect/getting-started start`
