# Tea Taster with Identity Vault and Auth Connect

An application for storing tea tasting notes. This application is the output of the three day Ionic Framework Enterprise training. It is also used as the starting point for some of our other product demos such as the demos for Identity Vault and Auth Connect.

## Building Note

This app is part of a mono-repo containing other demos but can also be [built on its own](../../README.md#build-a-stand-alone-project).

## Ch-ch-ch-changes...

This version of the application replaces our basic HTML authentication with an OIDC connection using Auth Connect. This shows how easy it is to drop Auth Connect and Identity Vault into a project. The major changes are:

- Modify the composable API functions for AC and IV.
  - Update the `useAuth()` composable API.
  - Redefine the authentication session to be the `AuthResult` from an Auth Connect login or refresh operation.
  - Redefine how the authentication session is stored.
- Change the login page.
- Perform some minor tweaks to the logic for obtaining tokens and determining if we are authenticated.

### The Composable Functions

#### Authentication

The original `useAuth()` makes HTTP calls, and the `login()` requires an email and password combination. The new `useAuth()` interfaces with Auth Connect to perform those same operations. With OIDC, the user enters their credentials at the OIDC providers site and _not_ in your application. As a result, the `login()` API changes slightly. The `logout()` remains largely the same from a caller's perspective.

#### Session Handling

The `useSession()` composable API, which provided a means to manage the session, storing it via the Capacitor Preferences plugin, is replaced by `useSessionVault()`.

The original `useSession()` defined a "session" as a user and a token. With Auth Connect we redefine the session to be an `AuthResult`. As such `useSessionVault()` will store an `AuthResult` instead.

The basic API (`setSession`, `getSession`, `clearSession`) remains the same. With `useSessionVault()`, the API expands to include methods specific to operating with a vault (set the unlock mode, determine which modes are available for use, etc).

### The Login Page

The largest change is probably in this page, and it is in a good way. It becomes much more simple. No more collection of data. No more validation. Just a button to push.

### The Unlock Page

An Unlock Page is added for use when the vault is locked. It gives the user the option of unlocking the application or just logging in again.

### The Startup Flow

Without Identity Vault, the startup logic looked like this:

- Attempt to go to the Tea List page.
- If no session exists, the auth guard redirects the user to the login page.
- If a session exists but is expired, getting data on the Tea List page results in a 401 error and the user is redirected to the login page.

With Identity Vault, the vault may be locked, in which case the user should be redirected to the Unlock Page.

- Open the Start page.
- If the vault is locked, the Start Page redirects the user to the Unlock page.
- If the vault is not locked, the Start Page redirects the user to the Tea List page, at which the flow is the same as before:
  - Attempt to go to the Tea List page.
  - If no session exists, the auth guard redirects the user to the login page.
  - If a session exists but is expired, getting data on the Tea List page results in a 401 error and the user is redirected to the login page.

### The PIN Dialog

Identity Vault supports a Custom Passcode vault that does not use any of the device's security features to encrypt the data. Instead, we must supply our own mechanism for supplying a passcode to lock and unlock the vault. This mode should _only_ be used if a device locking mechanism is not available (that is, the user has not set a system PIN and by extension has also not set up biometrics).

### Configuring the Vault

When the user logs in, the vault is in `Secure Storage` mode, which will securely store the session, but will never lock. This is the default baseline mode used by this app for _every_ login.

If a user wants to use some method of locking, they _must_ go to the About Page, open the Preferences dialog, and select an appropriate combination of locking methods:

- Biometrics
- System Passcode
- Biometrics AND System Passcode
- Custom Passcode
- None (which is just Secure Storage again)

The vault will remember the setting until the user logs out or otherwise clears the vault. That is, any new login results in a `Secure Storage` vault. You can easily modify that behaviour. For example, you _could_ automatically choose the "best" setting on login, or save the prior settings in Preferences. That is 100% up to you.

### The Guard and Interceptor

The `useAuth()` composable API function exposes two new APIs: `isAuthenticated()` and `getAccessToken()`. These are used in place of directly checking getting this information from the session like we did before. If you take a look in the code, you will also see that these methods also handle the refresh of expired tokens, which ensures the app is accurately accounting for the validity of the authentication session.

Happy Coding!
