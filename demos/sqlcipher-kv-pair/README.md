# Key Value Pair Service - SQL Cipher

Ionic's [Secure Storage](https://ionic.io/docs/secure-storage) product is a fork of the [Cordova SQLCipher Adapter](https://github.com/storesafe/cordova-sqlcipher-adapter) with a few extra goodies added to it.
As such, the combination of [Cordova SQLCipher Adapter](https://github.com/storesafe/cordova-sqlcipher-adapter) with the [Awesome Cordova SQLite Wrapper](https://danielsogl.gitbook.io/awesome-cordova-plugins/sqlite)
can almost be used as a drop-in replacement for Secure Storage.

One goodie we added, however, that is _not_ represented in the base Cordova plugin is the [Key Value Pair](https://ionic.io/docs/secure-storage/key-value) class. This demo shows you how to create your own
key-value pair implementation. On mobile, this implementation stores the data in an encrypted database. There is also a web implementation, allowing developers to continue to do their
development in the preferred web-based context. The web-based implementation does not encrypt the data, however, since it is only intended for the standard web-based development flow.

## Building Note

This app is part of a mono-repo containing other demos but can also be [built on its own](../../README.md#build-a-stand-alone-project).

## Implementation

Our key-value pair implementation exposes the following API:

- **`initialize`**: Initialize the key-value collection.
- **`clear`**: Remove all items from the collection.
- **`getAll`**: Get all key-value pairs from the collection.
- **`getKeys`**: Get a list of all of the keys used in a collection.
- **`getValue`**: Given a `key`, get the value from the collection associated with that `key` or `undeinfed` if that `key` does not exist in the collection.
- **`removeValue`**: Given a `key`, remove the data associated with that `key` in the collection. Do nothing if the `key` does not exist.
- **`setValue`**: Associate the `key` in the collection with the given data. This function creates a new record if the `key` does not exist, and updates the existing record if the `key` already exists.

Base implementations exist for Mobile and Web. The Web implementation is intended for development and is not secure. The Mobile implementation is secure.

### Data Types;

For our implementation, we would like to initially define a single collection of key-value pairs, but we would also like to make it easy to expand to using multiple key-value
data collections. The `KeyValueCollection` type defined the names of our collections.

We also would like to support using either a `string` or a `number` as the `key` value, and we would like to be able to associate that `key` with any kind of data.

```typescript
export type KeyValueCollection = 'inbox';

export type KeyValueKey = string | number;

export interface KeyValuePair {
  key: KeyValueKey;
  value: any;
}
```

### Mobile (Encrypted Database)

The mobile implementation creates a single table called `KeyValuePairs` with the following columns:

- `id`: The `key` value.
- `collection`: The name of the key-value pair collection.
- `value`: The data value.

The primary key of the table is `(id, collection)` which allows the same `key` to be used in different collections.

The `id` and `value` are both processed with `JSON.stringify()` on the way into the database and `JSON.parse()` on the way out. This is done to ensure that the types of data is preserved.

### Web (Non-Encrypted indexedDB)

The web implementation stores the data in [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API). The data is not encrypted, but it could be. The intention of the demo
implementation is to allow the developer to continue to enjoy the web-based development experience rather than having to always use physical devices or emulators for development.

### Storage Abstraction

The [Inbox Storage](./src/composables/inbox-storage.ts) abstraction fulfills two important tasks:

1. It specifies the collection to use (`inbox` in this case).
1. It handles platform detection and uses the proper implementation depending on the platform.

```typescript
import { Capacitor } from '@capacitor/core';
import { useWebKVStore } from './web-kv-store';
import { useMobileKVStore } from './mobile-kv-store';

export const useInboxStorage = () => {
  const isMobile = Capacitor.isNativePlatform();

  if (isMobile) {
    return useMobileKVStore('inbox');
  } else {
    return useWebKVStore('inbox');
  }
};
```

### Sample Usage

The [Email Messages Composable](./src/composables/email-messages.ts) exercises the API, and is used in the [Home Page](./src/views/HomePage.vue) and [Message Page](./src/views/ViewMessagePage.vue)
to access and manipulate the email sample data.

Note that some of the purpose of this service is to fully exercise the Key-Value API we created. As such, some design decisions, such as using an ordinal index to specify the email message rather than
directly using the key may not match best practices for a production application.

### Using Multiple Key Value Collections

This application does not define multiple collections but it does provide the infrastructure to do so.

1. Add a new collection name to the [KeyValueCollection](./src/composables/kv-types.ts#L1).
1. Nothing needs to be done to support this in the mobile implementation.
1. In the Web implementation, [bump the database version](./src/composables/web-kv-store.ts#L4) and add a new [object store](./src/composables/web-kv-store.ts#L9) with the new name.
1. Create a storage abstraction similar to the [Inbox Storage](./src/composables/inbox-storage.ts) abstraction.

### Encrypting Web Data

As noted prior, the web data is not encrypted. That is because the web implementation is in place solely to allow developers to continue to use the much default web-based development
workflow rather than having to use a device for development. If you want to deploy your application in a web-based context (as a [PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps), for example),
you can modify the routines provided by the `useWebKVStore()` composable function to incorporate the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API).

## Conclusion

If you are currently using the [Key Value Pair](https://ionic.io/docs/secure-storage/key-value) class, but are thinking of moving away from using Secure Storage, you may want to adopt an implementation
similar to the one presented here.

Happy Coding!!
