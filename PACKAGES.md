# Packages

This repo contains the following collection of packages:

- Auth Connect
- Identity Vault (under development)
- Demos

If you are having difficulty building any of these demos inside of the monorepo, please see the instructions on
[how to extract and build a demo on its own](README.md#build-a-stand-alone-project).

## Auth Connect

The `auth-connect` collection contains applications whose primary purpose is to highlight the use of
[Auth Connect](https://ionic.io/docs/auth-connect). At this time, all of the projects contained here are examples for our Auth Connect Tutorials.

### `ac-getting-started`

The `auth-connect/getting-started` project is the output of the basic Auth Connect training and serves as the basis for
the other targeted tutorials.

### `ac-protect-routes`

The `auth-connect/protect-routes` project demonstrates the use of Auth Connect authentication result data in
conjunction with route gaurds to protect the application's routes. This demo also shows how to use HTTP
interceptors to append the access token to outgoing to requests and to handle 401 errors.

### `ac-refresh-workflow`

The `auth-connect/refresh-workflow` project demonstrates one way of implementing a refresh flow within an application
that uses Auth Connect. It is sufficient for use as-is but can also be used as the basis for a more complex workflow
if needed.

### `ac-current-ui`

The `auth-connect/current-ui` project demonstrates how to implement the `current` authentication flow within a web
based application.

## Identity Vault

The `identity-vault` collection contains applications whose primary purpose is to highlight the use of
[Identity Vault](https://ionic.io/docs/auth-connect). At this time this area is under construction.

## Demos

The `demos` collection contain applications whose primary purpose does not fit into any of the other package collections.

### `demo-auth-playground`

This application highlights the use of the Ionic Enterprise [Auth Connect](https://ionic.io/docs/auth-connect)
and [Identity Vault](https://ionic.io/docs/identity-vault/) products in a Vue application. The application runs on
both Android and iOS. In addition, it supports running in the web, allowing developers to remain in the more comfortable
and productive web-based development environments while working on the application. Since the web does not have a
secure biometrically locked key storage mechanism, however, the full potential of Identity Vault is only accessible
through the native platforms.

This application uses [Capacitor](https://capacitorjs.com/docs) to provide the native layer. This is the preferred
technology to use for the native layer. The Customer Success team highly suggests using it over Cordova. However,
Identity Vault and Auth Connect can both be used with either technology.

The purpose of this application is to show the use of much of the `Vault` and `Device` APIs of Identity Vault as well
as how Identity Vault and Auth Connect work together to provide a secure authentication solution.

### `demo-iv-ac`

This is a variation of the [Tea Taster](#tea-taster) application that uses Auth Connect for authentication and
Identity Vault for securely storing the authentication result. The purpose of this demo is to show an example of
the usage of these products within the context of a small but functional application.

### `demo-security-trifecta`

This application demonstrates the use of all three Ionic Security Trifecta in conjunction with one another.
It uses these products as follows:

- **Authentication:**
  - **Auth Connect** handles the OIDC authentication.
  - **Identity Vault** stores the the authentication result and protects it behind biometrics, the system passcode, or a custom session PIN based on device capabilities.
- **Mobile Offline First:**
  - **Secure Storage** stores complex data via the the SQL database interface
  - **Identity Vault** manages the encryption key via a sepereate vault from the authentication vault. This ensures that the encryption key stays out of the code, and is available to the user even when they are off line.
  - A simple data syncronization procedure has been create for this application.
    - On mobile:
      - The database is syncronized with the backend on startup.
      - Displayed data is read from the database.
      - Data modifications are stored in the database.
      - Upon the next sync, new data is aquired from the backend.
    - On web:
      - The SQL database cannot be used. As such, mobile always gets data from the backend API.
      - The sync operation simply refreshes the data.
- **Key Value Storage:**
  - **Secure Storage** stores the key-value pair via a special interface.
  - **Identity Vault** manages the encryption key via a sepereate vault from the authentication vault. This ensures that the encryption key stays out of the code, and is available to the user even when they are off line.
  - The key-value storage mechanism stores data in an encrypted database on mobile. On web, the data is simply stored in local storage and is not encrypted in any way.

### `demo-security-trifecta-vuetify`

This is the Security Trifecta application that does not use the Ionic Framework.

### `demo-tea-taster`

This application is the output of the [Ionic Enterprise Training](https://ionic-training-decks.firebaseapp.com/course/framework/tabs/vue/page/0).
