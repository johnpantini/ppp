import {
  serialize as eserialize,
  deserialize as edeserialize
} from './ejson.js';

const SERIALIZATION_OPTIONS = {
  relaxed: false
};

/**
 * Serialize an object containing BSON types into extended-JSON.
 *
 * @param obj The object containing BSON types.
 * @returns The document in extended-JSON format.
 */
function serialize(obj) {
  return eserialize(obj, SERIALIZATION_OPTIONS);
}

/**
 * De-serialize an object or an array of object from extended-JSON into an object or an array of object with BSON types.
 *
 * @param obj The object or array of objects in extended-JSON format.
 * @returns The object or array of objects with inflated BSON types.
 */
function deserialize(obj) {
  if (Array.isArray(obj)) {
    return obj.map((doc) => edeserialize(doc));
  } else {
    return edeserialize(obj);
  }
}

/**
 * A `Storage` which will prefix a key part to every operation.
 */
class PrefixedStorage {
  /**
   * Construct a `Storage` which will prefix a key part to every operation.
   *
   * @param storage The underlying storage to use for operations.
   * @param keyPart The part of the key to prefix when performing operations.
   */
  constructor(storage, keyPart) {
    this.storage = storage;
    this.keyPart = keyPart;
  }

  /** @inheritdoc */
  get(key) {
    return this.storage.get(
      this.keyPart + PrefixedStorage.PART_SEPARATOR + key
    );
  }

  /** @inheritdoc */
  set(key, value) {
    return this.storage.set(
      this.keyPart + PrefixedStorage.PART_SEPARATOR + key,
      value
    );
  }

  /** @inheritdoc */
  remove(key) {
    return this.storage.remove(
      this.keyPart + PrefixedStorage.PART_SEPARATOR + key
    );
  }

  /** @inheritdoc */
  prefix(keyPart) {
    return new PrefixedStorage(this, keyPart);
  }

  /** @inheritdoc */
  clear(prefix = '') {
    return this.storage.clear(
      this.keyPart + PrefixedStorage.PART_SEPARATOR + prefix
    );
  }

  /** @inheritdoc */
  addListener(listener) {
    return this.storage.addListener(listener);
  }

  /** @inheritdoc */
  removeListener(listener) {
    return this.storage.addListener(listener);
  }
}

/**
 * The string separating two parts.
 */
PrefixedStorage.PART_SEPARATOR = ':';

/**
 * In-memory storage that will not be persisted.
 */
class MemoryStorage {
  constructor() {
    /**
     * Internal state of the storage.
     */
    this.storage = {};
    /**
     * A set of listners.
     */
    this.listeners = new Set();
  }

  /** @inheritdoc */
  get(key) {
    if (key in this.storage) {
      return this.storage[key];
    } else {
      return null;
    }
  }

  /** @inheritdoc */
  set(key, value) {
    this.storage[key] = value;
    // Fire the listeners
    this.fireListeners();
  }

  /** @inheritdoc */
  remove(key) {
    delete this.storage[key];
    // Fire the listeners
    this.fireListeners();
  }

  /** @inheritdoc */
  prefix(keyPart) {
    return new PrefixedStorage(this, keyPart);
  }

  /** @inheritdoc */
  clear(prefix) {
    // Iterate all keys and delete their values if they have a matching prefix
    for (const key of Object.keys(this.storage)) {
      if (!prefix || key.startsWith(prefix)) {
        delete this.storage[key];
      }
    }

    // Fire the listeners
    this.fireListeners();
  }

  /** @inheritdoc */
  addListener(listener) {
    return this.listeners.add(listener);
  }

  /** @inheritdoc */
  removeListener(listener) {
    return this.listeners.delete(listener);
  }

  /**
   * Tell the listeners that a change occurred.
   */
  fireListeners() {
    this.listeners.forEach((listener) => listener());
  }
}

/**
 * The type of a user.
 */
let UserType;

(function (UserType) {
  /**
   * A normal end-user created this user.
   */
  UserType['Normal'] = 'normal';
  /**
   * The user was created by the server.
   */
  UserType['Server'] = 'server';
})(UserType || (UserType = {}));

/** @ignore */
let DataKey;

(function (DataKey) {
  /** @ignore */
  DataKey['NAME'] = 'name';
  /** @ignore */
  DataKey['EMAIL'] = 'email';
  /** @ignore */
  DataKey['PICTURE'] = 'picture';
  /** @ignore */
  DataKey['FIRST_NAME'] = 'first_name';
  /** @ignore */
  DataKey['LAST_NAME'] = 'last_name';
  /** @ignore */
  DataKey['GENDER'] = 'gender';
  /** @ignore */
  DataKey['BIRTHDAY'] = 'birthday';
  /** @ignore */
  DataKey['MIN_AGE'] = 'min_age';
  /** @ignore */
  DataKey['MAX_AGE'] = 'max_age';
})(DataKey || (DataKey = {}));

const DATA_MAPPING = {
  [DataKey.NAME]: 'name',
  [DataKey.EMAIL]: 'email',
  [DataKey.PICTURE]: 'pictureUrl',
  [DataKey.FIRST_NAME]: 'firstName',
  [DataKey.LAST_NAME]: 'lastName',
  [DataKey.GENDER]: 'gender',
  [DataKey.BIRTHDAY]: 'birthday',
  [DataKey.MIN_AGE]: 'minAge',
  [DataKey.MAX_AGE]: 'maxAge'
};

/** @inheritdoc */
class UserProfile {
  /**
   * @param response The response of a call fetching the users profile.
   */
  constructor(response) {
    /** @ignore */
    this.type = UserType.Normal;
    /** @ignore */
    this.identities = [];

    if (typeof response === 'object' && response !== null) {
      const { type, identities, data } = response;

      if (typeof type === 'string') {
        this.type = type;
      } else {
        throw new Error("Expected 'type' in the response body");
      }

      if (Array.isArray(identities)) {
        this.identities = identities.map((identity) => {
          return {
            id: identity.id,
            providerType: identity['provider_type']
          };
        });
      } else {
        throw new Error("Expected 'identities' in the response body");
      }

      if (typeof data === 'object' && data !== null) {
        const mappedData = Object.fromEntries(
          Object.entries(data).map(([key, value]) => {
            if (key in DATA_MAPPING) {
              // Translate any known data field to its JS idiomatic alias
              return [DATA_MAPPING[key], value];
            } else {
              // Pass through any other values
              return [key, value];
            }
          })
        );

        // We can use `any` since we trust the user supplies the correct type
        this.data = deserialize(mappedData);
      } else {
        throw new Error("Expected 'data' in the response body");
      }
    } else {
      this.data = {};
    }
  }
}

const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';
const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken';
const PROFILE_STORAGE_KEY = 'profile';
const PROVIDER_TYPE_STORAGE_KEY = 'providerType';

/**
 * Storage specific to the app.
 */
class UserStorage extends PrefixedStorage {
  /**
   * Construct a storage for a `User`.
   *
   * @param storage The underlying storage to wrap.
   * @param userId The id of the user.
   */
  constructor(storage, userId) {
    super(storage, `user(${userId})`);
  }

  /**
   * Get the access token from storage.
   *
   * @returns Access token (null if unknown).
   */
  get accessToken() {
    return this.get(ACCESS_TOKEN_STORAGE_KEY);
  }

  /**
   * Set the access token in storage.
   *
   * @param value Access token (null if unknown).
   */
  set accessToken(value) {
    if (value === null) {
      this.remove(ACCESS_TOKEN_STORAGE_KEY);
    } else {
      this.set(ACCESS_TOKEN_STORAGE_KEY, value);
    }
  }

  /**
   * Get the refresh token from storage.
   *
   * @returns Refresh token (null if unknown and user is logged out).
   */
  get refreshToken() {
    return this.get(REFRESH_TOKEN_STORAGE_KEY);
  }

  /**
   * Set the refresh token in storage.
   *
   * @param value Refresh token (null if unknown and user is logged out).
   */
  set refreshToken(value) {
    if (value === null) {
      this.remove(REFRESH_TOKEN_STORAGE_KEY);
    } else {
      this.set(REFRESH_TOKEN_STORAGE_KEY, value);
    }
  }

  /**
   * Get the user profile from storage.
   *
   * @returns User profile (undefined if its unknown).
   */
  get profile() {
    const value = this.get(PROFILE_STORAGE_KEY);

    if (value) {
      const profile = new UserProfile();

      // Patch in the values
      Object.assign(profile, JSON.parse(value));

      return profile;
    }
  }

  /**
   * Set the user profile in storage.
   *
   * @param value User profile (undefined if its unknown).
   */
  set profile(value) {
    if (value) {
      this.set(PROFILE_STORAGE_KEY, JSON.stringify(value));
    } else {
      this.remove(PROFILE_STORAGE_KEY);
    }
  }

  /**
   * Get the type of authentication provider used to authenticate
   *
   * @returns User profile (undefined if its unknown).
   */
  get providerType() {
    const value = this.get(PROVIDER_TYPE_STORAGE_KEY);

    if (value) {
      return value;
    }
  }

  /**
   * Set the type of authentication provider used to authenticate
   *
   * @param value Type of authentication provider.
   */
  set providerType(value) {
    if (value) {
      this.set(PROVIDER_TYPE_STORAGE_KEY, value);
    } else {
      this.remove(PROVIDER_TYPE_STORAGE_KEY);
    }
  }
}

/**
 * @param obj The object to remove keys (and undefined values from)
 * @returns A new object without the keys where the value is undefined.
 */
function removeKeysWithUndefinedValues(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter((entry) => typeof entry[1] !== 'undefined')
  );
}

/**
 * Encode an object mapping from string to string, into a query string to be appended a URL.
 *
 * @param params The parameters to include in the string.
 * @param prefixed Should the "?" prefix be added if values exists?
 * @returns A URL encoded representation of the parameters (omitting a "?" prefix).
 */
function encodeQueryString(params, prefixed = true) {
  // Filter out undefined values
  const cleanedParams = removeKeysWithUndefinedValues(params);
  // Determine if a prefixed "?" is appropreate
  const prefix = prefixed && Object.keys(cleanedParams).length > 0 ? '?' : '';

  // Transform keys and values to a query string
  return (
    prefix +
    Object.entries(cleanedParams)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&')
  );
}

/**
 * A list of names that functions cannot have to be callable through the functions proxy.
 */
const RESERVED_NAMES = [
  'inspect',
  'callFunction',
  // Methods defined on the Object.prototype might be "typeof probed" and called by libraries and runtime environments.
  ...Object.getOwnPropertyNames(Object.prototype)
];

/**
 * Remove the key for any fields with undefined values.
 *
 * @param args The arguments to clean.
 * @returns The cleaned arguments.
 */
function cleanArgs(args) {
  for (const arg of args) {
    if (typeof arg === 'object') {
      for (const [key, value] of Object.entries(arg)) {
        if (value === undefined) {
          delete arg[key];
        }
      }
    }
  }

  return args;
}

/**
 * Remove keys for any undefined values and serialize to EJSON.
 *
 * @param args The arguments to clean and serialize.
 * @returns The cleaned and serialized arguments.
 */
function cleanArgsAndSerialize(args) {
  const cleaned = cleanArgs(args);

  return cleaned.map((arg) => (typeof arg === 'object' ? serialize(arg) : arg));
}

/**
 * Defines how functions are called.
 */
class FunctionsFactory {
  /**
   * @param fetcher The underlying fetcher to use when sending requests.
   * @param config Additional configuration parameters.
   */
  constructor(fetcher, config = {}) {
    this.fetcher = fetcher;
    this.serviceName = config.serviceName;
    this.argsTransformation =
      config.argsTransformation || cleanArgsAndSerialize;
  }

  /**
   * Create a factory of functions, wrapped in a Proxy that returns bound copies of `callFunction` on any property.
   *
   * @param fetcher The underlying fetcher to use when requesting.
   * @param config Additional configuration parameters.
   * @returns The newly created factory of functions.
   */
  static create(fetcher, config = {}) {
    // Create a proxy, wrapping a simple object returning methods that calls functions
    // TODO: Lazily fetch available functions and return these from the ownKeys() trap
    const factory = new FunctionsFactory(fetcher, config);

    // Wrap the factory in a proxy that calls the internal call method
    return new Proxy(factory, {
      get(target, p, receiver) {
        if (typeof p === 'string' && RESERVED_NAMES.indexOf(p) === -1) {
          return target.callFunction.bind(target, p);
        } else {
          const prop = Reflect.get(target, p, receiver);

          return typeof prop === 'function' ? prop.bind(target) : prop;
        }
      }
    });
  }

  /**
   * Call a remote function by it's name.
   *
   * @param name Name of the remote function.
   * @param args Arguments to pass to the remote function.
   * @returns A promise of the value returned when executing the remote function.
   */
  async callFunction(name, ...args) {
    // See https://github.com/mongodb/stitch-js-sdk/blob/master/packages/core/sdk/src/services/internal/CoreStitchServiceClientImpl.ts
    const body = {
      name,
      arguments: this.argsTransformation ? this.argsTransformation(args) : args
    };

    if (this.serviceName) {
      body.service = this.serviceName;
    }

    const appRoute = this.fetcher.appRoute;

    return this.fetcher.fetchJSON({
      method: 'POST',
      path: appRoute.functionsCall().path,
      body
    });
  }
}

/**
 * @returns The base api route.
 */
function api() {
  return {
    path: '/api/client/v2.0',
    /**
     * @param appId The id of the app.
     * @returns The URL of the app endpoint.
     */
    app(appId) {
      return {
        path: this.path + `/app/${appId}`,
        /**
         * @returns The URL of the app location endpoint.
         */
        location() {
          return {
            path: this.path + '/location'
          };
        },
        /**
         * @param providerName The name of the provider.
         * @returns The app url concatinated with the /auth/providers/{providerName}
         */
        authProvider(providerName) {
          return {
            path: this.path + `/auth/providers/${providerName}`,
            /**
             * @returns Get the URL of an authentication provider.
             */
            login() {
              return { path: this.path + '/login' };
            }
          };
        },
        functionsCall() {
          return {
            path: this.path + '/functions/call'
          };
        }
      };
    },
    auth() {
      return {
        path: this.path + '/auth',
        apiKeys() {
          return {
            path: this.path + '/api_keys',
            key(id) {
              return {
                path: this.path + `/${id}`
              };
            }
          };
        },
        profile() {
          return { path: this.path + '/profile' };
        },
        session() {
          return { path: this.path + '/session' };
        }
      };
    }
  };
}

let routes = { api };

/** @inheritdoc */
class ApiKeyAuth {
  /**
   * Construct an interface to the API-key authentication provider.
   *
   * @param fetcher The fetcher used to send requests to services.
   * @param providerName Optional custom name of the authentication provider.
   */
  constructor(fetcher, providerName = 'api-key') {
    this.fetcher = fetcher;
  }

  /** @inheritdoc */
  create(name) {
    return this.fetcher.fetchJSON({
      method: 'POST',
      body: { name },
      path: routes.api().auth().apiKeys().path,
      tokenType: 'refresh'
    });
  }

  /** @inheritdoc */
  fetch(keyId) {
    return this.fetcher.fetchJSON({
      method: 'GET',
      path: routes.api().auth().apiKeys().key(keyId).path,
      tokenType: 'refresh'
    });
  }

  /** @inheritdoc */
  async delete(keyId) {
    await this.fetcher.fetchJSON({
      method: 'DELETE',
      path: routes.api().auth().apiKeys().key(keyId).path,
      tokenType: 'refresh'
    });
  }
}

const DEFAULT_DEVICE_ID = '000000000000000000000000';
/** The state of a user within the app */
let UserState;

(function (UserState) {
  /** Active, with both access and refresh tokens */
  UserState['Active'] = 'active';
  /** Logged out, but there might still be data persisted about the user, in the browser. */
  UserState['LoggedOut'] = 'logged-out';
  /** Logged out and all data about the user has been removed. */
  UserState['Removed'] = 'removed';
})(UserState || (UserState = {}));

/** The type of a user. */
let UserType$1;

(function (UserType) {
  /** Created by the user itself. */
  UserType['Normal'] = 'normal';
  /** Created by an administrator of the app. */
  UserType['Server'] = 'server';
})(UserType$1 || (UserType$1 = {}));

/**
 * Representation of an authenticated user of an app.
 */
class User {
  /**
   * @param parameters Parameters of the user.
   */
  constructor(parameters) {
    this.app = parameters.app;
    this.id = parameters.id;
    this.storage = new UserStorage(this.app.storage, this.id);

    if (
      'accessToken' in parameters &&
      'refreshToken' in parameters &&
      'providerType' in parameters
    ) {
      this._accessToken = parameters.accessToken;
      this._refreshToken = parameters.refreshToken;
      this.providerType = parameters.providerType;
      // Save the parameters to storage, for future instances to be hydrated from
      this.storage.accessToken = parameters.accessToken;
      this.storage.refreshToken = parameters.refreshToken;
      this.storage.providerType = parameters.providerType;
    } else {
      // Hydrate the rest of the parameters from storage
      this._accessToken = this.storage.accessToken;
      this._refreshToken = this.storage.refreshToken;

      const providerType = this.storage.providerType;

      this._profile = this.storage.profile;

      if (providerType) {
        this.providerType = providerType;
      } else {
        throw new Error('Storage is missing a provider type');
      }
    }

    this.fetcher = this.app.fetcher.clone({
      userContext: { currentUser: this }
    });
    this.apiKeys = new ApiKeyAuth(this.fetcher);
    this.functions = FunctionsFactory.create(this.fetcher);
  }

  /**
   * @returns The access token used to authenticate the user towards MongoDB Realm.
   */
  get accessToken() {
    return this._accessToken;
  }

  /**
   * @param token The new access token.
   */
  set accessToken(token) {
    this._accessToken = token;
    this.storage.accessToken = token;
  }

  /**
   * @returns The refresh token used to issue new access tokens.
   */
  get refreshToken() {
    return this._refreshToken;
  }

  /**
   * @param token The new refresh token.
   */
  set refreshToken(token) {
    this._refreshToken = token;
    this.storage.refreshToken = token;
  }

  /**
   * @returns The current state of the user.
   */
  get state() {
    if (this.id in this.app.allUsers) {
      return this.refreshToken === null
        ? UserState.LoggedOut
        : UserState.Active;
    } else {
      return UserState.Removed;
    }
  }

  /**
   * @returns The logged in state of the user.
   */
  get isLoggedIn() {
    return this.state === UserState.Active;
  }

  get customData() {
    if (this.accessToken) {
      const decodedToken = this.decodeAccessToken();

      return decodedToken.userData;
    } else {
      throw new Error('Cannot read custom data without an access token');
    }
  }

  /**
   * @returns Profile containing detailed information about the user.
   */
  get profile() {
    if (this._profile) {
      return this._profile.data;
    } else {
      throw new Error('A profile was never fetched for this user');
    }
  }

  get identities() {
    if (this._profile) {
      return this._profile.identities;
    } else {
      throw new Error('A profile was never fetched for this user');
    }
  }

  get deviceId() {
    if (this.accessToken) {
      const payload = this.accessToken.split('.')[1];

      if (payload) {
        const parsedPayload = JSON.parse(atob(payload));
        const deviceId = parsedPayload['baas_device_id'];

        if (typeof deviceId === 'string' && deviceId !== DEFAULT_DEVICE_ID) {
          return deviceId;
        }
      }
    }

    return null;
  }

  /**
   * Refresh the users profile data.
   */
  async refreshProfile() {
    // Fetch the latest profile
    const response = await this.fetcher.fetchJSON({
      method: 'GET',
      path: routes.api().auth().profile().path
    });

    // Create a profile instance
    this._profile = new UserProfile(response);
    // Store this for later hydration
    this.storage.profile = this._profile;
  }

  /**
   * Log out the user, invalidating the session (and its refresh token).
   */
  async logOut() {
    // Invalidate the refresh token
    try {
      if (this._refreshToken !== null) {
        await this.fetcher.fetchJSON({
          method: 'DELETE',
          path: routes.api().auth().session().path,
          tokenType: 'refresh'
        });
      }
    } finally {
      // Forget the access and refresh token
      this.accessToken = null;
      this.refreshToken = null;
    }
  }

  /**
   * Request a new access token, using the refresh token.
   */
  async refreshAccessToken() {
    const response = await this.fetcher.fetchJSON({
      method: 'POST',
      path: routes.api().auth().session().path,
      tokenType: 'refresh'
    });
    const { access_token: accessToken } = response;

    if (typeof accessToken === 'string') {
      this.accessToken = accessToken;
    } else {
      throw new Error("Expected an 'access_token' in the response");
    }
  }

  /** @inheritdoc */
  callFunction(name, ...args) {
    return this.functions.callFunction(name, ...args);
  }

  /**
   * @returns A plain ol' JavaScript object representation of the user.
   */
  toJSON() {
    return {
      id: this.id,
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      profile: this._profile,
      state: this.state,
      customData: this.customData
    };
  }

  decodeAccessToken() {
    if (this.accessToken) {
      // Decode and spread the token
      const parts = this.accessToken.split('.');

      if (parts.length !== 3) {
        throw new Error('Expected an access token with three parts');
      }

      // Decode the payload
      const encodedPayload = parts[1];
      const decodedPayload = atob(encodedPayload);
      const parsedPayload = JSON.parse(decodedPayload);
      const {
        exp: expires,
        iat: issuedAt,
        sub: subject,
        user_data: userData = {}
      } = parsedPayload;

      // Validate the types
      if (typeof expires !== 'number') {
        throw new Error("Failed to decode access token 'exp'");
      } else if (typeof issuedAt !== 'number') {
        throw new Error("Failed to decode access token 'iat'");
      }

      return { expires, issuedAt, subject, userData };
    } else {
      throw new Error('Missing an access token');
    }
  }
}

/**
 * Instances of this class can be passed to the `app.logIn` method to authenticate an end-user.
 */
class Credentials {
  /**
   * Constructs an instance of credentials.
   *
   * @param providerName The name of the authentication provider used when authenticating.
   * @param providerType The type of the authentication provider used when authenticating.
   * @param payload The data being sent to the service when authenticating.
   */
  constructor(providerName, providerType, payload) {
    this.providerName = providerName;
    this.providerType = providerType;
    this.payload = payload;
  }

  /**
   * Creates credentials that logs in using the [API Key Provider](https://docs.mongodb.com/realm/authentication/api-key/).
   *
   * @param key The secret content of the API key.
   * @returns The credentials instance, which can be passed to `app.logIn`.
   */
  static apiKey(key) {
    return new Credentials('api-key', 'api-key', { key });
  }
}

const USER_IDS_STORAGE_KEY = 'userIds';
const DEVICE_ID_STORAGE_KEY = 'deviceId';

/**
 * Storage specific to the app.
 */
class AppStorage extends PrefixedStorage {
  /**
   * @param storage The underlying storage to wrap.
   * @param appId The id of the app.
   */
  constructor(storage, appId) {
    super(storage, `app(${appId})`);
  }

  /**
   * Reads out the list of user ids from storage.
   *
   * @returns A list of user ids.
   */
  getUserIds() {
    const userIdsString = this.get(USER_IDS_STORAGE_KEY);
    const userIds = userIdsString ? JSON.parse(userIdsString) : [];

    if (Array.isArray(userIds)) {
      // Remove any duplicates that might have been added
      // The Set preserves insertion order
      return [...new Set(userIds)];
    } else {
      throw new Error('Expected the user ids to be an array');
    }
  }

  /**
   * Sets the list of ids in storage.
   * Optionally merging with existing ids stored in the storage, by prepending these while voiding duplicates.
   *
   * @param userIds The list of ids to store.
   * @param mergeWithExisting Prepend existing ids to avoid data-races with other apps using this storage.
   */
  setUserIds(userIds, mergeWithExisting) {
    if (mergeWithExisting) {
      // Add any existing user id to the end of this list, avoiding duplicates
      const existingIds = this.getUserIds();

      for (const id of existingIds) {
        if (userIds.indexOf(id) === -1) {
          userIds.push(id);
        }
      }
    }

    // Store the list of ids
    this.set(USER_IDS_STORAGE_KEY, JSON.stringify(userIds));
  }

  /**
   * @returns id of this device (if any exists)
   */
  getDeviceId() {
    return this.get(DEVICE_ID_STORAGE_KEY);
  }
}

/**
 * Handles authentication and linking of users.
 */
class Authenticator {
  /**
   * @param fetcher The fetcher used to fetch responses from the server.
   * @param getDeviceInformation Called to get device information to be sent to the server.
   */
  constructor(fetcher, getDeviceInformation) {
    this.fetcher = fetcher;
    this.getDeviceInformation = getDeviceInformation;
  }

  async authenticate(credentials, linkingUser) {
    const deviceInformation = this.getDeviceInformation();
    const isLinking = typeof linkingUser === 'object';

    const logInUrl = await this.getLogInUrl(credentials, isLinking);
    const response = await this.fetcher.fetchJSON({
      method: 'POST',
      url: logInUrl,
      body: {
        ...credentials.payload,
        options: {
          device: deviceInformation.toJSON()
        }
      },
      tokenType: isLinking ? 'access' : 'none',
      user: linkingUser
    });
    // Spread out values from the response and ensure they're valid
    const {
      user_id: userId,
      access_token: accessToken,
      refresh_token: refreshToken = null,
      device_id: deviceId
    } = response;

    if (typeof userId !== 'string') {
      throw new Error('Expected a user id in the response');
    }

    if (typeof accessToken !== 'string') {
      throw new Error('Expected an access token in the response');
    }

    return { userId, accessToken, refreshToken, deviceId };
  }

  /**
   * @param credentials Credentials to use when logging in.
   * @param link Should the request link with the current user?
   * @param extraQueryParams Any extra parameters to include in the query string
   */
  async getLogInUrl(credentials, link = false, extraQueryParams = {}) {
    // See https://github.com/mongodb/stitch-js-sdk/blob/310f0bd5af80f818cdfbc3caf1ae29ffa8e9c7cf/packages/core/sdk/src/auth/internal/CoreStitchAuth.ts#L746-L780
    const appRoute = this.fetcher.appRoute;
    const loginRoute = appRoute.authProvider(credentials.providerName).login();
    const qs = encodeQueryString({
      link: link ? 'true' : undefined,
      ...extraQueryParams
    });
    const locationUrl = await this.fetcher.locationUrl;

    return locationUrl + loginRoute.path + qs;
  }
}

/**
 * An error produced while communicating with the MongoDB Realm server.
 */
class MongoDBRealmError extends Error {
  constructor(method, url, statusCode, statusText, error, errorCode, link) {
    const summary = statusText
      ? `status ${statusCode} ${statusText}`
      : `status ${statusCode}`;

    if (typeof error === 'string') {
      super(`Request failed (${method} ${url}): ${error} (${summary})`);
    } else {
      super(`Request failed (${method} ${url}): (${summary})`);
    }

    this.method = method;
    this.url = url;
    this.statusText = statusText;
    this.statusCode = statusCode;
    this.error = error;
    this.errorCode = errorCode;
    this.link = link;
  }

  /**
   * Constructs and returns an error from a request and a response.
   * Note: The caller must throw this error themselves.
   *
   * @param request The request sent to the server.
   * @param response A raw response, as returned from the server.
   */
  static async fromRequestAndResponse(request, response) {
    const { url, method } = request;
    const { status, statusText } = response;

    if (response.headers.get('content-type')?.startsWith('application/json')) {
      const body = await response.json();
      const error = body.error || 'No message';
      const errorCode = body.error_code;
      const link = body.link;

      return new MongoDBRealmError(
        method,
        url,
        status,
        statusText,
        error,
        errorCode,
        link
      );
    } else {
      return new MongoDBRealmError(method, url, status, statusText);
    }
  }
}

/**
 * Extracts error messages and throws `MongoDBRealmError` objects upon failures.
 * Injects access or refresh tokens for a current or specific user.
 * Refreshes access tokens if requests fails due to a 401 error.
 * Optionally parses response as JSON before returning it.
 * Fetches and exposes an app's location url.
 */
class Fetcher {
  /**
   * @param config A configuration of the fetcher.
   */
  constructor({ appId, userContext, locationUrlContext }) {
    this.appId = appId;
    this.userContext = userContext;
    this.locationUrlContext = locationUrlContext;
  }

  /**
   * @param user An optional user to generate the header for.
   * @param tokenType The type of token (access or refresh).
   * @returns An object containing the user's token as "Authorization" header or undefined if no user is given.
   */
  static buildAuthorizationHeader(user, tokenType) {
    if (!user || tokenType === 'none') {
      return {};
    } else if (tokenType === 'access') {
      return { Authorization: `Bearer ${user.accessToken}` };
    } else if (tokenType === 'refresh') {
      return { Authorization: `Bearer ${user.refreshToken}` };
    } else {
      throw new Error(`Unexpected token type (${tokenType})`);
    }
  }

  /**
   * @param body The body string or object passed from a request.
   * @returns An object optionally specifying the "Content-Type" header.
   */
  static buildBody(body) {
    if (!body) return;

    if (typeof body === 'object' && body) {
      return JSON.stringify(serialize(body));
    } else if (typeof body === 'string') {
      return body;
    } else {
      console.log('body is', body);
      throw new Error('Unexpected type of body');
    }
  }

  /**
   * @param body The body string or object passed from a request.
   * @returns An object optionally specifying the "Content-Type" header.
   */
  static buildJsonHeader(body) {
    if (body && body.length > 0) {
      return { 'Content-Type': 'application/json' };
    } else {
      return {};
    }
  }

  clone(config) {
    return new Fetcher({
      appId: this.appId,
      userContext: this.userContext,
      locationUrlContext: this.locationUrlContext,
      ...config
    });
  }

  /**
   * Fetch a network resource as an authenticated user.
   *
   * @param request The request which should be sent to the server.
   * @returns The response from the server.
   */
  async fetch(request) {
    const {
      path,
      url,
      tokenType = 'access',
      user = this.userContext.currentUser,
      ...restOfRequest
    } = request;

    if (typeof path === 'string' && typeof url === 'string') {
      throw new Error("Use of 'url' and 'path' mutually exclusive");
    } else if (typeof path === 'string') {
      // Derive the URL
      const url = (await this.locationUrlContext.locationUrl) + path;

      return this.fetch({ ...request, path: undefined, url });
    } else if (typeof url === 'string') {
      const response = await fetch(url, {
        ...restOfRequest,
        headers: {
          ...Fetcher.buildAuthorizationHeader(user, tokenType),
          ...request.headers
        }
      });

      if (response.ok) {
        return response;
      } else if (user && response.status === 401 && tokenType === 'access') {
        // If the access token has expired, it would help refreshing it
        await user.refreshAccessToken();

        // Retry with the specific user, since the currentUser might have changed.
        return this.fetch({ ...request, user });
      } else {
        if (user && response.status === 401 && tokenType === 'refresh') {
          // A 401 error while using the refresh token indicates the token has an issue.
          // Reset the tokens to prevent a lock.
          user.accessToken = null;
          user.refreshToken = null;
        }

        // Throw an error with a message extracted from the body
        throw await MongoDBRealmError.fromRequestAndResponse(request, response);
      }
    } else {
      throw new Error("Expected either 'url' or 'path'");
    }
  }

  /**
   * Fetch a network resource as an authenticated user and parse the result as extended JSON.
   *
   * @param request The request which should be sent to the server.
   * @returns The response from the server, parsed as extended JSON.
   */
  async fetchJSON(request) {
    const { body } = request;
    const serializedBody = Fetcher.buildBody(body);
    const contentTypeHeaders = Fetcher.buildJsonHeader(serializedBody);
    const response = await this.fetch({
      ...request,
      body: serializedBody,
      headers: {
        Accept: 'application/json',
        ...contentTypeHeaders,
        ...request.headers
      }
    });
    const contentType = response.headers.get('content-type');

    if (
      contentType === null || contentType === void 0
        ? void 0
        : contentType.startsWith('application/json')
    ) {
      const responseBody = await response.json();

      return deserialize(responseBody);
    } else if (contentType === null) {
      return null;
    } else {
      throw new Error(`Expected JSON response, got "${contentType}"`);
    }
  }

  /**
   * @returns The path of the app route.
   */
  get appRoute() {
    return routes.api().app(this.appId);
  }

  /**
   * @returns A promise of the location URL of the app.
   */
  get locationUrl() {
    return this.locationUrlContext.locationUrl;
  }
}

/**
 * The key in a storage on which the device id is stored.
 */
const DEVICE_ID_STORAGE_KEY$1 = 'deviceId';
let DeviceFields;

(function (DeviceFields) {
  DeviceFields['DEVICE_ID'] = 'deviceId';
  DeviceFields['APP_ID'] = 'appId';
  DeviceFields['APP_VERSION'] = 'appVersion';
  DeviceFields['SDK_VERSION'] = 'sdkVersion';
})(DeviceFields || (DeviceFields = {}));

/**
 * Information describing the device, app and SDK.
 */
class DeviceInformation {
  /**
   * @param params Construct the device information from these parameters.
   */
  constructor({ appId, appVersion, deviceId }) {
    /**
     * The version of the Realm Web SDK (constant provided by Rollup).
     */
    this.sdkVersion = '1.3.0';
    this.appId = appId;
    this.appVersion = appVersion;
    this.deviceId = deviceId;
  }

  /**
   * @returns An base64 URI encoded representation of the device information.
   */
  encode() {
    const obj = removeKeysWithUndefinedValues(this);

    return btoa(JSON.stringify(obj));
  }

  /**
   * @returns The defaults
   */
  toJSON() {
    return removeKeysWithUndefinedValues(this);
  }
}

/**
 * Default base url to prefix all requests if no baseUrl is specified in the configuration.
 */
const DEFAULT_BASE_URL = 'https://stitch.mongodb.com';

/**
 * MongoDB Realm App
 */
class App {
  /**
   * Construct a Realm App, either from the Realm App id visible from the MongoDB Realm UI or a configuration.
   *
   * @param idOrConfiguration The Realm App id or a configuration to use for this app.
   */
  constructor(idOrConfiguration) {
    /**
     * An array of active and logged-out users.
     * Elements in the beginning of the array is considered more recent than the later elements.
     */
    this.users = [];
    /**
     * A promise resolving to the App's location url.
     */
    this._locationUrl = localStorage.getItem('ppp-mongo-location-url');

    // If the argument is a string, convert it to a simple configuration object.
    const configuration =
      typeof idOrConfiguration === 'string'
        ? { id: idOrConfiguration }
        : idOrConfiguration;

    // Initialize properties from the configuration
    if (
      typeof configuration === 'object' &&
      typeof configuration.id === 'string'
    ) {
      this.id = configuration.id;
    } else {
      throw new Error('Missing a MongoDB Realm app-id');
    }

    this.baseUrl = configuration.baseUrl || DEFAULT_BASE_URL;

    if (configuration.skipLocationRequest) {
      // Use the base url directly, instead of requesting a location URL from the server
      this._locationUrl = Promise.resolve(this.baseUrl);
    }

    this.localApp = configuration.app;

    const { storage } = configuration;

    this.fetcher = new Fetcher({
      appId: this.id,
      userContext: this,
      locationUrlContext: this
    });

    // Construct the storage
    const baseStorage = storage || new MemoryStorage();

    this.storage = new AppStorage(baseStorage, this.id);
    this.authenticator = new Authenticator(
      this.fetcher,
      () => this.deviceInformation
    );

    // Hydrate the app state from storage
    try {
      this.hydrate();
    } catch (err) {
      // The storage was corrupted
      this.storage.clear();
      // A failed hydration shouldn't throw and break the app experience
      // Since this is "just" persisted state that unfortunately got corrupted or partially lost
      console.warn('Realm app hydration failed:', err.message);
    }
  }

  /**
   * Get or create a singleton Realm App from an id.
   * Calling this function multiple times with the same id will return the same instance.
   *
   * @param id The Realm App id visible from the MongoDB Realm UI or a configuration.
   * @returns The Realm App instance.
   */
  static getApp(id) {
    if (id in App.appCache) {
      return App.appCache[id];
    } else {
      const instance = new App(id);

      App.appCache[id] = instance;

      return instance;
    }
  }

  /**
   * Switch user.
   *
   * @param nextUser The user or id of the user to switch to.
   */
  switchUser(nextUser) {
    const index = this.users.findIndex((u) => u === nextUser);

    if (index === -1) {
      throw new Error('The user was never logged into this app');
    }

    // Remove the user from the stack
    const [user] = this.users.splice(index, 1);

    // Insert the user in the beginning of the stack
    this.users.unshift(user);
  }

  /**
   * Log in a user.
   *
   * @param credentials Credentials to use when logging in.
   * @param fetchProfile Should the users profile be fetched? (default: true)
   */
  async logIn(credentials, fetchProfile = true) {
    const response = await this.authenticator.authenticate(credentials);
    const user = this.createOrUpdateUser(response, credentials.providerType);

    // Let's ensure this will be the current user, in case the user object was reused.
    this.switchUser(user);

    // If needed, fetch and set the profile on the user
    if (fetchProfile) {
      await user.refreshProfile();
    }

    // Persist the user id in the storage,
    // merging to avoid overriding logins from other apps using the same underlying storage
    this.storage.setUserIds(
      this.users.map((u) => u.id),
      true
    );

    // Read out and store the device id from the server
    const deviceId = response.deviceId;

    if (deviceId && deviceId !== '000000000000000000000000') {
      this.storage.set(DEVICE_ID_STORAGE_KEY$1, deviceId);
    }

    // Return the user
    return user;
  }

  /**
   * The currently active user (or null if no active users exists).
   *
   * @returns the currently active user or null.
   */
  get currentUser() {
    const activeUsers = this.users.filter(
      (user) => user.state === UserState.Active
    );

    if (activeUsers.length === 0) {
      return null;
    } else {
      // Current user is the top of the stack
      return activeUsers[0];
    }
  }

  /**
   * All active and logged-out users:
   *  - First in the list are active users (ordered by most recent call to switchUser or login)
   *  - Followed by logged out users (also ordered by most recent call to switchUser or login).
   *
   * @returns An array of users active or loggedout users (current user being the first).
   */
  get allUsers() {
    // Returning a freezed copy of the list of users to prevent outside changes
    return Object.fromEntries(this.users.map((user) => [user.id, user]));
  }

  /**
   * @returns A promise of the app URL, with the app location resolved.
   */
  get locationUrl() {
    if (!this._locationUrl) {
      const path = routes.api().app(this.id).location().path;

      this._locationUrl = this.fetcher
        .fetchJSON({
          method: 'GET',
          url: this.baseUrl + path,
          tokenType: 'none'
        })
        .then(({ hostname }) => {
          if (typeof hostname !== 'string') {
            throw new Error("Expected response to contain a 'hostname'");
          } else {
            localStorage.setItem('ppp-mongo-location-url', hostname);

            return hostname;
          }
        })
        .catch((err) => {
          // Reset the location to allow another request to fetch again.
          this._locationUrl = null;
          throw err;
        });
    }

    return this._locationUrl;
  }

  /**
   * @returns Information about the current device, sent to the server when authenticating.
   */
  get deviceInformation() {
    const deviceIdStr = this.storage.getDeviceId();
    const deviceId =
      typeof deviceIdStr === 'string' &&
      deviceIdStr !== '000000000000000000000000'
        ? deviceIdStr
        : undefined;

    return new DeviceInformation({
      appId: this.localApp ? this.localApp.name : undefined,
      appVersion: this.localApp ? this.localApp.version : undefined,
      deviceId
    });
  }

  /**
   * Create (and store) a new user or update an existing user's access and refresh tokens.
   * This helps de-duplicating users in the list of users known to the app.
   *
   * @param response A response from the Authenticator.
   * @param providerType The type of the authentication provider used.
   * @returns A new or an existing user.
   */
  createOrUpdateUser(response, providerType) {
    const existingUser = this.users.find((u) => u.id === response.userId);

    if (existingUser) {
      // Update the users access and refresh tokens
      existingUser.accessToken = response.accessToken;
      existingUser.refreshToken = response.refreshToken;

      return existingUser;
    } else {
      // Create and store a new user
      if (!response.refreshToken) {
        throw new Error('No refresh token in response from server');
      }

      const user = new User({
        app: this,
        id: response.userId,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        providerType
      });

      this.users.unshift(user);

      return user;
    }
  }

  /**
   * Restores the state of the app (active and logged-out users) from the storage
   */
  hydrate() {
    const userIds = this.storage.getUserIds();

    this.users = userIds.map((id) => new User({ app: this, id }));
  }
}

/**
 * A map of app instances returned from calling getApp.
 */
App.appCache = {};
/**
 * Instances of this class can be passed to the `app.logIn` method to authenticate an end-user.
 */
App.Credentials = Credentials;

/**
 * Get or create a singleton Realm App from an id.
 * Calling this function multiple times with the same id will return the same instance.
 *
 * @param id The Realm App id visible from the MongoDB Realm UI or a configuration.
 * @returns The Realm App instance.
 */
function getApp(id) {
  return App.getApp(id);
}

export {
  App,
  Credentials,
  DEFAULT_BASE_URL,
  MongoDBRealmError,
  User,
  UserState,
  getApp
};
