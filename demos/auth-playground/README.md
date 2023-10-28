# Auth Playground

This application highlights the use of the Ionic Enterprise <a href="https://ionic.io/docs/auth-connect" target="_blank">Auth Connect</a> and <a href="https://ionic.io/docs/identity-vault/" target="_blank">Identity Vault</a> products in an Vue application. The application runs on both Android and iOS. In addition, it supports running in the web, allowing developers to remain in a more comfortable and productive web-based development environments while working on the application. Since the web does not have a secure biometrically locked key storage mechanism, however, the full potential of Identity Vault is only accessible through the native platforms.

This application uses <a href="https://capacitorjs.com/docs" target="_blank">Capacitor</a> to provide the native layer. This is the preferred technology to use for the native layer and the Customer Success team highly suggests using it over Cordova. However, Identity Vault and Auth Connect can both be used with either technology.

The purpose of this application is to show the use of much of the `Vault` and `Device` APIs of Identity Vault as well as how Identity Vault and Auth Connect work together to provide a secure authentication solution.

One final note: this app may or may not work on an emulator. When working with biometrics it is highly suggested that you test only on actual devices and skip the emulators.

## Significant Architecture

### The Authentication Services

#### Authenticator Interface

The `Authenticator` interface provides a consistent set of methods that are used across our HTTP Basic Auth service as well as our OIDC authentication service. This way, no matter which type of authentication we are using the rest of our application can rely on having a simple, well-defined service level API.

#### Basic Authentication Service

The `BasicAuthenticationService` is used to perform a basic HTTP based authentication where the application itself gathers the credentials and then sends them to the backend to be verified. A token is returned by the backend. This is easily the least secure of all of the methods presented because:

- The application obtains the credentials instead of the backend system performing the authentication.
- As a result, those credentials are sent across the wire to the backend that will do the authentication.
- The protocol we have implemented has a single long-lived token rather than short lived tokens with a long lived refresh token.

Obviously, some of this we could could be solidified from a security standpoint. However, the fact that the user stays in the app in order to enter their credentials is a serious flaw that would take more work to get around. This makes using Auth Connect with the OIDC providers a far better choice for applications where security is important.

#### OIDC Authentication Service

The `OIDCAuthenticationService` extends the `IonicAuth` class from Auth Connect. This code encapsulates the configuration for each of the services this application supports: AWS Cognito, Azure, and Auth0.

The important thing to notice here is how little actual code is needed. Most of what needs to be provided is configuration. The only code that is truly required is the code that extends the base class passing our configuration in the constructor. The override of the `login()` method is only required due to a quirk with Azure's password reset functionality. If that quirk did not exist, we would not even need that.

### The Token Storage Provider

When constructing the authentication services a token storage provider is specified. The token storage provider can either be the `vault` object or an object that implements <a href="https://ionic.io/docs/auth-connect/interfaces/tokenstorageprovider" target="_blank">a specific interface</a>. If you do not specify a token storage provider, Auth Connect will use a default provider that utilizes `localstorage`. The default provider, however, is only intended for development use. In a production scenario we suggest pairing Auth Connect with Identity Vault for a complete authentication solution.

**Note:** while the token storage provider _can_ be specified as the `vault` created by Identity Vault, this application creates its own object using the `TokenStorageProvider` interface. This allows more flexibility in controlling the exact actions of the vault.

### Composables

#### Auth

The Auth composable abstracts the authentication functions that are required by the rest of the app. This composable is responsible for:

- instantiating the proper Authentication service
- tracking the currently used provider so the proper service can be instantiated upon application restart
- calling the appropriate service when required

#### Session Vault

The session vault composable defines the interface to the Identity Vault. When being used in an application that also uses Auth Connect, this composable will typically do the following:

- Instantiate the `Vault` object.
- Expose the `Vault` object so it can be used by Auth Connect as a token storage provider OR create a `TokenStorageProvider` object that utilizes the `Vault` object (we do the latter in this app).
- Expose any functions needed throughout the rest of the system

Typically, the functions would be ones like:

- `unlock()`
- `canUnlock()`
- `initializeUnlockMode()`
- `setUnlockMode()`

We have gone beyond that with this application so we could allow the user to manually perform some vault operations that would typically be automatically managed by either Auth Connect or Identity Vault (`lock()`, `clear()`, etc).

### The PIN Dialog

The `Vault` API contains an `onPasscodeRequest()` callback that is used to get the passcode when using a Custom Passcode type of vault. The method and workflow used to obtain the passcode is determined by the application, the only requirement is to call `setCustomPasscode()` from within `onPasscodeRequest()`. For example:

```typescript
  private async onPasscodeRequest(isPasscodeSetRequest: boolean): Promise<void> {
    const { data } = await someWayOfGettingThePasscode(isPasscodeSetRequest);
    this.vault.setCustomPasscode(data || '');
  }
```

For this application, we chose to use a modal dialog to get the custom passcode. Moreover, we chose to use the same component for initially setting the passcode as we use for getting the passcode when unlocking the vault.

Our component implements a different workflow depending on whether `setPasscodeMode` is `true` (ask the user twice, do not allow a "cancel") or `false` (ask once, allow a "cancel").

```typescript
  private async onPasscodeRequest(isPasscodeSetRequest: boolean): Promise<void> {
    const dlg = await this.modalController.create({
      backdropDismiss: false,
      component: PinDialogComponent,
      componentProps: {
        setPasscodeMode: isPasscodeSetRequest,
      },
    });
    dlg.present();
    const { data } = await dlg.onDidDismiss();
    this.vault.setCustomPasscode(data || '');
  }
```

#### Backend API

The backend API composable sets the Axios configuration to access our backend API. It also defines a couple of HTTTP interceptors that we need.

##### The Request Interceptor

The Request interceptor operates on outbound requests. It gets the access token from the authentication service and appends it to the headers as a bearer token.

If an access token cannot be obtained, the request will still be sent, but it will be sent without a bearer token. In such a case, if the API requires a token in order to process the request it should result in a 401 error.

##### The Response Interceptor

The Response interceptor examines HTTP responses and redirects to the login page when result has a 401 error status.

### Auth Guard

This application has a single route guard that determines if the user is authenticated. It redirects to the login page if they are not. To determine if the user is authenticated, it uses Auth Connect's `isAuthenticated()` method. This method resolves `true` or `false` depending on whether or not a non-expired access token exists. If the token exists but is expired, it will attempt a refresh operation first if the backend provider supports refresh tokens.

With a Vue application like this, the auth guard is set up along with the routes in `src/router`.

## Pages

### Login Page

The login page allows the user to authenticate themselves via any of our providers. The AWS and Auth0 providers as well as the "Sign in with email" option use the following credentials:

- **email:** `test@ionic.io`
- **password:** `Ion54321`

The Azure OIDC provider may work with your Google account.

This page will automatically be displayed whenever the application detects that the user is not currently authenticated.

### Unlock Page

The unlock page gives the user two options:

1. Unlock the vault and navigate into the app
1. Perform a logout, which will clear the vault, and navigate to the login page

### The Tabbed Pages

#### Tea List

The Tea List page just shows a list of teas. Every time the user navigates to this page, the backend API will refetch the data (even though it never actually changes). This page simulates the way an actual application would work. That is, the user goes to the page, the correct token is obtained from the vault, and an API call is made using that token.

#### Vault Config

This is not a page you would typically have in an application, but you may use some of the items or ideas from here in various parts of a real application. The Vault Config page allows the user to select various vault locking mechanisms. It also allows the user to lock the vault, clear the vault, or manually show the biometric prompt.

Child pages allow the user to add/remove items from the vault and to have a look at the Device API values as well as manipulate some of the Device settings.

#### About

This page just has some basic information about the app so the user knows what they have installed.

This is also the page that contains the logout button.
