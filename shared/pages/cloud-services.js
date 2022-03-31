import { BasePage } from '../page.js';
import { validate, invalidate } from '../validate.js';
import { maybeFetchError } from '../fetch-error.js';

export async function checkGitHubToken({ token }) {
  return fetch('https://api.github.com/user', {
    cache: 'no-cache',
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `token ${token}`
    }
  });
}

export async function checkMongoDBRealmCredentials({
  serviceMachineUrl,
  publicKey,
  privateKey
}) {
  return fetch(new URL('fetch', serviceMachineUrl).toString(), {
    cache: 'no-cache',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: 'https://realm.mongodb.com/api/admin/v3.0/auth/providers/mongodb-cloud/login',
      body: {
        username: publicKey,
        apiKey: privateKey
      }
    })
  });
}

export class CloudServicesPage extends BasePage {
  async #createServerlessFunctions({
    serviceMachineUrl,
    mongoDBRealmAccessToken
  }) {
    const groupId = this.app.ppp.keyVault.getKey('mongo-group-id');
    const appId = this.app.ppp.keyVault.getKey('mongo-app-id');
    const funcs = [
      { name: 'eval', path: 'functions/mongodb/eval.js' },
      { name: 'aggregate', path: 'functions/mongodb/aggregate.js' },
      { name: 'bulkWrite', path: 'functions/mongodb/bulk-write.js' },
      { name: 'count', path: 'functions/mongodb/count.js' },
      { name: 'deleteMany', path: 'functions/mongodb/delete-many.js' },
      { name: 'deleteOne', path: 'functions/mongodb/delete-one.js' },
      { name: 'distinct', path: 'functions/mongodb/distinct.js' },
      { name: 'find', path: 'functions/mongodb/find.js' },
      { name: 'findOne', path: 'functions/mongodb/find-one.js' },
      {
        name: 'findOneAndDelete',
        path: 'functions/mongodb/find-one-and-delete.js'
      },
      {
        name: 'findOneAndReplace',
        path: 'functions/mongodb/find-one-and-replace.js'
      },
      {
        name: 'findOneAndUpdate',
        path: 'functions/mongodb/find-one-and-update.js'
      },
      { name: 'insertMany', path: 'functions/mongodb/insert-many.js' },
      { name: 'insertOne', path: 'functions/mongodb/insert-one.js' },
      { name: 'updateMany', path: 'functions/mongodb/update-many.js' },
      { name: 'updateOne', path: 'functions/mongodb/update-one.js' }
    ];

    const rFunctionList = await fetch(
      new URL('fetch', serviceMachineUrl).toString(),
      {
        cache: 'no-cache',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'GET',
          url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions`,
          headers: {
            Authorization: `Bearer ${mongoDBRealmAccessToken}`
          }
        })
      }
    );

    await maybeFetchError(rFunctionList);
    this.progressOperation(30);

    const functions = await rFunctionList.json();

    for (const f of functions) {
      if (funcs.find((fun) => fun.name === f.name)) {
        const rRemoveFunc = await fetch(
          new URL('fetch', serviceMachineUrl).toString(),
          {
            cache: 'no-cache',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              method: 'DELETE',
              url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions/${f._id}`,
              headers: {
                Authorization: `Bearer ${mongoDBRealmAccessToken}`
              }
            })
          }
        );

        await maybeFetchError(rRemoveFunc);

        this.app.toast.progress.value += Math.floor(35 / funcs.length);
      }
    }

    for (const f of funcs) {
      const sourceRequest = await fetch(
        new URL(f.path, window.location.origin + window.location.pathname)
      );
      const source = await sourceRequest.text();
      const rCreateFunc = await fetch(
        new URL('fetch', serviceMachineUrl).toString(),
        {
          cache: 'no-cache',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            method: 'POST',
            url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions`,
            headers: {
              Authorization: `Bearer ${mongoDBRealmAccessToken}`
            },
            body: JSON.stringify({
              name: f.name,
              source,
              run_as_system: true
            })
          })
        }
      );

      await maybeFetchError(rCreateFunc);

      this.app.toast.progress.value += Math.floor(35 / funcs.length);
    }
  }

  async #setUpMongoDBRealmApp({ serviceMachineUrl, mongoDBRealmAccessToken }) {
    // 1. Get Group (Project) ID
    const rProjectId = await fetch(
      new URL('fetch', serviceMachineUrl).toString(),
      {
        cache: 'no-cache',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'GET',
          url: 'https://realm.mongodb.com/api/admin/v3.0/auth/profile',
          headers: {
            Authorization: `Bearer ${mongoDBRealmAccessToken}`
          }
        })
      }
    );

    await maybeFetchError(rProjectId);
    this.progressOperation(5, 'Поиск проекта ppp в MongoDB Realm');

    const { roles } = await rProjectId.json();

    // TODO - will fail if a user has multiple projects
    const groupId = roles?.find((r) => r.role_name === 'GROUP_OWNER')?.group_id;

    if (groupId) {
      this.app.ppp.keyVault.setKey('mongo-group-id', groupId);
    } else {
      invalidate(this.app.toast, {
        errorMessage: 'Проект ppp не найден.'
      });
    }

    // 2. Get App Client ID
    const rAppId = await fetch(new URL('fetch', serviceMachineUrl).toString(), {
      cache: 'no-cache',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        method: 'GET',
        url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps`,
        headers: {
          Authorization: `Bearer ${mongoDBRealmAccessToken}`
        }
      })
    });

    await maybeFetchError(rAppId);
    this.progressOperation(10);

    const apps = await rAppId.json();
    const pppApp = apps?.find((a) => a.name === 'ppp');

    if (pppApp) {
      this.app.ppp.keyVault.setKey('mongo-app-client-id', pppApp.client_app_id);
      this.app.ppp.keyVault.setKey('mongo-app-id', pppApp._id);
    } else {
      invalidate(this.app.toast, {
        errorMessage: 'Приложение ppp не найдено.'
      });
    }

    // 3. Create & enable API Key provider
    const rAuthProviders = await fetch(
      new URL('fetch', serviceMachineUrl).toString(),
      {
        cache: 'no-cache',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'GET',
          url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${pppApp._id}/auth_providers`,
          headers: {
            Authorization: `Bearer ${mongoDBRealmAccessToken}`
          }
        })
      }
    );

    await maybeFetchError(rAuthProviders);
    this.progressOperation(15, 'Создание API-ключа пользователя в MongoDB Realm');

    const providers = await rAuthProviders.json();
    const apiKeyProvider = providers.find((p) => (p.type = 'api-key'));

    if (apiKeyProvider && apiKeyProvider.disabled) {
      const rEnableAPIKeyProvider = await fetch(
        new URL('fetch', serviceMachineUrl).toString(),
        {
          cache: 'no-cache',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            method: 'PUT',
            url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${pppApp._id}/auth_providers/${apiKeyProvider._id}/enable`,
            headers: {
              Authorization: `Bearer ${mongoDBRealmAccessToken}`
            }
          })
        }
      );

      await maybeFetchError(rEnableAPIKeyProvider);
    }

    if (!apiKeyProvider) {
      const rCreateAPIKeyProvider = await fetch(
        new URL('fetch', serviceMachineUrl).toString(),
        {
          cache: 'no-cache',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            method: 'POST',
            url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${pppApp._id}/auth_providers`,
            headers: {
              Authorization: `Bearer ${mongoDBRealmAccessToken}`
            },
            body: JSON.stringify({
              name: 'api-key',
              type: 'api-key',
              disabled: false
            })
          })
        }
      );

      await maybeFetchError(rCreateAPIKeyProvider);
    }

    // 4. Create an API Key
    const rAPIKeys = await fetch(
      new URL('fetch', serviceMachineUrl).toString(),
      {
        cache: 'no-cache',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'GET',
          url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${pppApp._id}/api_keys`,
          headers: {
            Authorization: `Bearer ${mongoDBRealmAccessToken}`
          }
        })
      }
    );

    await maybeFetchError(rAPIKeys);
    this.progressOperation(20);

    const apiKeys = await rAPIKeys.json();
    const pppKey = apiKeys.find((k) => k.name === 'ppp');

    if (pppKey) {
      const rRemoveAPIKey = await fetch(
        new URL('fetch', serviceMachineUrl).toString(),
        {
          cache: 'no-cache',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            method: 'DELETE',
            url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${pppApp._id}/api_keys/${pppKey._id}`,
            headers: {
              Authorization: `Bearer ${mongoDBRealmAccessToken}`
            }
          })
        }
      );

      await maybeFetchError(rRemoveAPIKey);
    }

    const rCreateAPIKey = await fetch(
      new URL('fetch', serviceMachineUrl).toString(),
      {
        cache: 'no-cache',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'POST',
          url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${pppApp._id}/api_keys`,
          headers: {
            Authorization: `Bearer ${mongoDBRealmAccessToken}`
          },
          body: JSON.stringify({
            name: 'ppp'
          })
        })
      }
    );

    await maybeFetchError(rCreateAPIKey);
    this.progressOperation(25, 'Запись облачных функций');
    this.app.ppp.keyVault.setKey(
      'mongo-api-key',
      (await rCreateAPIKey.json()).key
    );

    // 5. Create serverless functions
    await this.#createServerlessFunctions({
      serviceMachineUrl,
      mongoDBRealmAccessToken
    });
  }

  async saveCloudCredentials() {
    this.beginOperation();

    try {
      await validate(this.masterPassword);
      await validate(this.serviceMachineUrl);
      await validate(this.gitHubToken);
      await validate(this.mongoPublicKey);
      await validate(this.mongoPrivateKey);

      localStorage.removeItem('ppp-mongo-location-url');

      this.app.ppp.keyVault.setKey(
        'master-password',
        this.masterPassword.value.trim()
      );

      let serviceMachineUrl;

      // Check service machine URL
      try {
        serviceMachineUrl = new URL('ping', this.serviceMachineUrl.value);

        const rs = await fetch(serviceMachineUrl.toString());
        const rst = await rs.text();

        if (rst !== 'pong') {
          invalidate(this.serviceMachineUrl, {
            errorMessage: 'Неверный URL'
          });
        }
      } catch (e) {
        invalidate(this.serviceMachineUrl, {
          errorMessage: 'Неверный или неполный URL'
        });
      }

      this.app.ppp.keyVault.setKey(
        'service-machine-url',
        serviceMachineUrl.origin
      );

      // 1. Check GitHub token, store repo owner
      const rGitHub = await checkGitHubToken({
        token: this.gitHubToken.value
      });

      if (!rGitHub.ok) {
        invalidate(this.gitHubToken, {
          errorMessage: 'Неверный токен',
          silent: true
        });

        await maybeFetchError(rGitHub);
      }

      const jGitHub = await rGitHub.json();

      this.app.ppp.keyVault.setKey('github-login', jGitHub.login);
      this.app.ppp.keyVault.setKey('github-token', this.gitHubToken.value);

      // 2. Check MongoDB Realm admin credentials, get the access_token
      const rMongoDBRealmCredentials = await checkMongoDBRealmCredentials({
        serviceMachineUrl: serviceMachineUrl.origin,
        publicKey: this.mongoPublicKey.value,
        privateKey: this.mongoPrivateKey.value
      });

      if (!rMongoDBRealmCredentials.ok) {
        invalidate(this.mongoPrivateKey, {
          errorMessage: 'Неверные ключи MongoDB Realm',
          silent: true
        });

        await maybeFetchError(rMongoDBRealmCredentials);
      }

      this.app.ppp.keyVault.setKey(
        'mongo-public-key',
        this.mongoPublicKey.value
      );
      this.app.ppp.keyVault.setKey(
        'mongo-private-key',
        this.mongoPrivateKey.value
      );

      const jMongoDBRealmCredentials = await rMongoDBRealmCredentials.json();

      this.progressOperation(0, 'Настройка приложения MongoDB Realm');

      // 3. Create a MongoDB realm API key, setup cloud functions
      await this.#setUpMongoDBRealmApp({
        serviceMachineUrl: serviceMachineUrl.origin,
        mongoDBRealmAccessToken: jMongoDBRealmCredentials.access_token
      });

      this.succeedOperation(
        'Операция успешно выполнена. Обновите страницу, чтобы пользоваться приложением'
      );
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}
