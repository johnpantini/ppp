import { BasePage } from '../page.js';
import { DOM } from '../element/dom.js';
import { validate, invalidate } from '../validate.js';
import { parseJwt } from '../key-vault.js';
import { auth0Bridge, auth0BridgeCallback } from '../auth0-bridge.js';

export async function checkGitHubToken({ token }) {
  try {
    return await fetch('https://api.github.com/user', {
      cache: 'no-cache',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${token}`
      }
    });
  } catch (e) {
    console.error(e);

    return {
      ok: false,
      status: 422
    };
  }
}

export async function checkAuth0MgmntToken({ token, email }) {
  try {
    const json = parseJwt(token);
    const url = new URL(
      `users-by-email?fields=user_id&include_fields=true&email=${encodeURIComponent(
        email
      )}`,
      json.aud
    );

    const r1 = await fetch(url.toString(), {
      cache: 'no-cache',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!r1.ok) {
      return r1;
    }

    const j1 = await r1.json();

    if (!j1.length)
      return {
        ok: false,
        status: 404
      };

    r1.details = j1;
    r1.domain = url.hostname;

    return r1;
  } catch (e) {
    console.error(e);

    return {
      ok: false,
      status: 422
    };
  }
}

export async function checkMongoRealmCredentials({
  publicKey,
  privateKey,
  auth0Token
}) {
  return auth0Bridge({
    auth0Token,
    code: `console.log(await new Promise((resolve, reject) => {
        request.post(
          {
            url: 'https://realm.mongodb.com/api/admin/v3.0/auth/providers/mongodb-cloud/login',
            json: {
              username: '${publicKey}',
              apiKey: '${privateKey}'
            }
          }, ${auth0BridgeCallback}
        );
      }));`
  });
}

export class CloudServicesPage extends BasePage {
  async #updateGitHubMilestone({ domain, clientId }) {
    try {
      const r1 = await fetch(
        `https://api.github.com/repos/${this.app.ppp.keyVault.getKey(
          'github-login'
        )}/ppp/milestones`,
        {
          cache: 'no-cache',
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `token ${this.app.ppp.keyVault.getKey(
              'github-token'
            )}`
          }
        }
      );

      if (!r1.ok) {
        console.warn(await r1.text());

        return r1;
      }

      this.app.toast.progress.value = 95;

      const j1 = await r1.json();

      if (!j1.find((m) => m.title.trim() === domain.trim())) {
        const r2 = await fetch(
          `https://api.github.com/repos/${this.app.ppp.keyVault.getKey(
            'github-login'
          )}/ppp/milestones`,
          {
            method: 'POST',
            headers: {
              Accept: 'application/vnd.github.v3+json',
              Authorization: `token ${this.app.ppp.keyVault.getKey(
                'github-token'
              )}`
            },
            body: JSON.stringify({
              title: domain,
              description: clientId
            })
          }
        );

        if (!r2.ok) {
          console.warn(await r2.text());

          return r2;
        }

        return r2;
      } else return r1;
    } catch (e) {
      console.error(e);

      return {
        ok: false,
        status: 422
      };
    }
  }

  async #setUpAuth0App(auth0Token, userId) {
    try {
      const domainList = [
        `https://*.github.io/ppp`,
        `https://*.github.io/ppp/desktop`,
        `https://*.github.io/ppp/mobile`,
        `https://*.github.io.dev`,
        `https://*.github.io.dev/desktop`,
        `https://*.github.io.dev/mobile`,
        `https://*.pages.dev`,
        `https://*.pages.dev/desktop`,
        `https://*.pages.dev/mobile`
      ];

      // 1. Save metadata
      const json = parseJwt(auth0Token);
      const r1 = await fetch(new URL(`users/${userId}`, json.aud).toString(), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth0Token}`
        },
        body: JSON.stringify({
          app_metadata: {
            'auth0-client-id': this.app.ppp.keyVault.getKey('auth0-client-id'),
            'auth0-domain': this.app.ppp.keyVault.getKey('auth0-domain'),
            'auth0-email': this.app.ppp.keyVault.getKey('auth0-email'),
            'github-login': this.app.ppp.keyVault.getKey('github-login'),
            'github-token': this.app.ppp.keyVault.getKey('github-token'),
            'mongo-api-key': this.app.ppp.keyVault.getKey('mongo-api-key'),
            'mongo-app-client-id': this.app.ppp.keyVault.getKey(
              'mongo-app-client-id'
            ),
            'mongo-app-id': this.app.ppp.keyVault.getKey('mongo-app-id'),
            'mongo-group-id': this.app.ppp.keyVault.getKey('mongo-group-id'),
            'mongo-private-key':
              this.app.ppp.keyVault.getKey('mongo-private-key'),
            'mongo-public-key':
              this.app.ppp.keyVault.getKey('mongo-public-key'),
            'service-machine-url': this.app.ppp.keyVault.getKey(
              'service-machine-url'
            )
          }
        })
      });

      if (!r1.ok) {
        console.warn(await r1.text());

        return r1;
      }

      this.app.toast.progress.value = 85;

      // 2. Update URLs
      const r2 = await fetch(
        new URL(
          `clients?fields=client_id,name&include_fields=true`,
          json.aud
        ).toString(),
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${auth0Token}`
          }
        }
      );

      if (!r2.ok) {
        console.warn(await r2.text());

        return r2;
      }

      const j2 = await r2.json();
      const pppApp = j2?.find((c) => c.name === 'ppp');

      if (!pppApp) {
        return {
          ok: false,
          details: j2,
          status: 417
        };
      }

      this.app.ppp.keyVault.setKey('auth0-client-id', pppApp.client_id);
      this.app.toast.progress.value = 88;

      const r3 = await fetch(
        new URL(`clients/${pppApp.client_id}`, json.aud).toString(),
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth0Token}`
          },
          body: JSON.stringify({
            app_type: 'regular_web',
            token_endpoint_auth_method: 'none',
            callbacks: domainList,
            web_origins: domainList,
            allowed_logout_urls: domainList
          })
        }
      );

      if (!r3.ok) {
        console.warn(await r3.text());

        return r3;
      }

      r3.clientId = pppApp.client_id;

      return r3;
    } catch (e) {
      console.error(e);

      return {
        ok: false,
        status: 422
      };
    }
  }

  async #createServerlessFunctions(auth0Token, mongoDBRealmToken) {
    try {
      const groupId = this.app.ppp.keyVault.getKey('mongo-group-id');
      const appId = this.app.ppp.keyVault.getKey('mongo-app-id');
      const funcs = [
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

      const r1 = await auth0Bridge({
        auth0Token,
        code: `console.log(await new Promise((resolve, reject) => {
          request.get(
            {
              url: 'https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions',
              headers: {
                Authorization: 'Bearer ${mongoDBRealmToken}'
              }
            }, ${auth0BridgeCallback}
          );
        }));`
      });

      if (!r1.ok) {
        return r1;
      }

      this.app.toast.progress.value = 30;

      const functions = new Function(`return ${r1.logs.response}`)();

      for (const f of functions) {
        if (funcs.find((fun) => fun.name === f.name)) {
          const rd = await auth0Bridge({
            auth0Token,
            code: `console.log(await new Promise((resolve, reject) => {
              request.delete(
                {
                  url: 'https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions/${f._id}',
                  headers: {
                    Authorization: 'Bearer ${mongoDBRealmToken}'
                  }
                }, ${auth0BridgeCallback}
              );
            }));`
          });

          if (!rd.ok) {
            return rd;
          }

          this.app.toast.progress.value += Math.floor(25 / funcs.length);
        }
      }

      for (const f of funcs) {
        const codeRequest = await fetch(
          new URL(f.path, window.location.origin + window.location.pathname)
        );

        if (codeRequest.ok) {
          const code = await codeRequest.text();

          const r2 = await auth0Bridge({
            auth0Token,
            code: `console.log(await new Promise((resolve, reject) => {
              request.post(
                {
                  url: 'https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions',
                  headers: {
                    Authorization: 'Bearer ${mongoDBRealmToken}'
                  },
                  json: {
                    name: '${f.name}',
                    source: ${JSON.stringify(code)},
                    run_as_system: true
                  }
                }, ${auth0BridgeCallback}
              );
            }));`
          });

          if (!r2.ok) {
            return r2;
          }

          this.app.toast.progress.value += Math.floor(25 / funcs.length);
        } else return codeRequest;
      }

      return {
        ok: true,
        status: 204
      };
    } catch (e) {
      console.error(e);

      return {
        ok: false,
        status: 422
      };
    }
  }

  async #setUpMongoDBRealm(auth0Token, mongoDBRealmToken) {
    try {
      // 1. Get Group (Project) ID
      const r1 = await auth0Bridge({
        auth0Token,
        code: `console.log(await new Promise((resolve, reject) => {
          request.get(
            {
              url: 'https://realm.mongodb.com/api/admin/v3.0/auth/profile',
              headers: {
                Authorization: 'Bearer ${mongoDBRealmToken}'
              }
            }, ${auth0BridgeCallback}
          );
        }));`
      });

      if (!r1.ok) {
        return r1;
      }

      this.app.toast.progress.value = 5;

      const { roles } = new Function(`return ${r1.logs.response}`)();

      // TODO - can fail if a user has multiple projects
      const groupId = roles?.find(
        (r) => r.role_name === 'GROUP_OWNER'
      )?.group_id;

      if (groupId) {
        this.app.ppp.keyVault.setKey('mongo-group-id', groupId);
      } else {
        return {
          ok: false,
          details: {
            missing: 'project'
          },
          status: 404
        };
      }

      // 2. Get App Client ID
      const r2 = await auth0Bridge({
        auth0Token,
        code: `console.log(await new Promise((resolve, reject) => {
          request.get(
            {
              url: 'https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps',
              headers: {
                Authorization: 'Bearer ${mongoDBRealmToken}'
              }
            }, ${auth0BridgeCallback}
          );
        }));`
      });

      if (!r2.ok) {
        return r2;
      }

      this.app.toast.progress.value = 10;

      const apps = new Function(`return ${r2.logs.response}`)();
      const pppApp = apps?.find((a) => a.name === 'ppp');

      if (pppApp) {
        this.app.ppp.keyVault.setKey(
          'mongo-app-client-id',
          pppApp.client_app_id
        );
        this.app.ppp.keyVault.setKey('mongo-app-id', pppApp._id);
      } else {
        return {
          ok: false,
          details: {
            missing: 'app'
          },
          status: 404
        };
      }

      // 3. Create & enable API Key provider
      const r3 = await auth0Bridge({
        auth0Token,
        code: `console.log(await new Promise((resolve, reject) => {
          request.get(
            {
              url: 'https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${pppApp._id}/auth_providers',
              headers: {
                Authorization: 'Bearer ${mongoDBRealmToken}'
              }
            }, ${auth0BridgeCallback}
          );
        }));`
      });

      if (!r3.ok) {
        return r3;
      }

      this.app.toast.progress.value = 15;

      const providers = new Function(`return ${r3.logs.response}`)();
      const apiKeyProvider = providers.find((p) => (p.type = 'api-key'));

      if (apiKeyProvider && apiKeyProvider.disabled) {
        const re = await auth0Bridge({
          auth0Token,
          code: `console.log(await new Promise((resolve, reject) => {
            request.put(
              {
                url: 'https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${pppApp._id}/auth_providers/${apiKeyProvider._id}/enable',
                headers: {
                  Authorization: 'Bearer ${mongoDBRealmToken}'
                }
              }, ${auth0BridgeCallback}
            );
          }));`
        });

        if (!re.ok) {
          return re;
        }
      }

      if (!apiKeyProvider) {
        const r4 = await auth0Bridge({
          auth0Token,
          code: `console.log(await new Promise((resolve, reject) => {
            request.post(
              {
                url: 'https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${pppApp._id}/auth_providers',
                headers: {
                  Authorization: 'Bearer ${mongoDBRealmToken}'
                },
                json: {
                  name: 'api-key',
                  type: 'api-key',
                  disabled: false
                }
              }, ${auth0BridgeCallback}
            );
          }));`
        });

        if (!r4.ok) {
          return r4;
        }
      }

      // 4. Create an API Key
      const r5 = await auth0Bridge({
        auth0Token,
        code: `console.log(await new Promise((resolve, reject) => {
          request.get(
            {
              url: 'https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${pppApp._id}/api_keys',
              headers: {
                Authorization: 'Bearer ${mongoDBRealmToken}'
              }
            }, ${auth0BridgeCallback}
          );
        }));`
      });

      if (!r5.ok) {
        return r5;
      }

      this.app.toast.progress.value = 20;

      const apiKeys = new Function(`return ${r5.logs.response}`)();
      const pppKey = apiKeys.find((k) => k.name === 'ppp');

      if (pppKey) {
        const r6 = await auth0Bridge({
          auth0Token,
          code: `console.log(await new Promise((resolve, reject) => {
            request.delete(
              {
                url: 'https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${pppApp._id}/api_keys/${pppKey._id}',
                headers: {
                  Authorization: 'Bearer ${mongoDBRealmToken}'
                }
              }, ${auth0BridgeCallback}
            );
          }));`
        });

        if (!r6.ok) {
          return r6;
        }
      }

      const r7 = await auth0Bridge({
        auth0Token,
        code: `console.log(await new Promise((resolve, reject) => {
          request.post(
            {
              url: 'https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${pppApp._id}/api_keys',
              headers: {
                Authorization: 'Bearer ${mongoDBRealmToken}'
              },
              json: {
                name: 'ppp'
              }
            }, ${auth0BridgeCallback}
          );
        }));`
      });

      if (!r7.ok) {
        return r7;
      }

      this.app.toast.progress.value = 25;
      this.app.ppp.keyVault.setKey('mongo-api-key', r7.logs.response.key);

      // 5. Create serverless functions
      return this.#createServerlessFunctions(auth0Token, mongoDBRealmToken);
    } catch (e) {
      console.error(e);

      return {
        ok: false,
        status: 422
      };
    }
  }

  async saveCloudCredentials() {
    try {
      this.busy = true;
      this.app.toast.visible = false;
      this.app.toast.source = this;
      this.toastTitle = 'Настройка облачных сервисов';

      await validate(this.serviceMachineUrl);
      await validate(this.gitHubToken);
      await validate(this.auth0Token);
      await validate(this.auth0Email);
      await validate(this.mongoPublicKey);
      await validate(this.mongoPrivateKey);

      localStorage.removeItem('ppp-mongo-location-url');

      const serviceMachineURL = new URL('ping', this.serviceMachineUrl.value);

      // Check service machine URL
      try {
        const rs = await fetch(serviceMachineURL);
        const rst = await rs.text();

        if (rst !== 'pong') {
          invalidate(this.serviceMachineUrl, {
            errorMessage: 'Неверный URL'
          });
        }
      } catch (e) {
        invalidate(this.serviceMachineUrl, {
          errorMessage: 'Неверный URL'
        });
      }

      this.app.ppp.keyVault.setKey(
        'service-machine-url',
        serviceMachineURL.origin
      );

      // 1. Check GitHub token, store repo owner
      const r1 = await checkGitHubToken({
        token: this.gitHubToken.value
      });

      if (!r1.ok) {
        console.warn(await r1.text());

        invalidate(this.gitHubToken, {
          errorMessage: 'Неверный токен',
          status: r1.status
        });
      }

      const j1 = await r1.json();

      this.app.ppp.keyVault.setKey('github-login', j1.login);
      this.app.ppp.keyVault.setKey('github-token', this.gitHubToken.value);

      // 2. Check Auth0 mgmnt token
      const r2 = await checkAuth0MgmntToken({
        token: this.auth0Token.value,
        email: this.auth0Email.value
      });

      if (!r2.ok) {
        if (r2.status === 404) {
          invalidate(this.auth0Email, {
            errorMessage: 'Пользователь не найден',
            status: r2.status
          });
        } else {
          if (r2.status === 401) {
            const j2 = await r2.json();

            if (/expired/i.test(j2?.message)) {
              invalidate(this.auth0Token, {
                errorMessage: 'Токен истёк',
                status: r2.status
              });
            } else {
              invalidate(this.auth0Token, {
                errorMessage: 'Неверный токен',
                status: r2.status
              });
            }
          } else
            invalidate(this.auth0Token, {
              errorMessage: 'Неверный токен',
              status: r2.status
            });
        }
      }

      this.app.ppp.keyVault.setKey('auth0-domain', r2.domain);
      this.app.ppp.keyVault.setKey('auth0-token', this.auth0Token.value);
      this.app.ppp.keyVault.setKey('auth0-email', this.auth0Email.value);

      // 3. Check MongoDB Realm admin credentials, get the access_token
      const r3 = await checkMongoRealmCredentials({
        publicKey: this.mongoPublicKey.value,
        privateKey: this.mongoPrivateKey.value,
        auth0Token: this.app.ppp.keyVault.getKey('auth0-token')
      });

      if (!r3.ok) {
        console.warn(r3);

        let errorMessage = 'Проблема с MongoDB';

        if (r3.status === 401) errorMessage = 'Неверные ключи MongoDB Realm';

        invalidate(this.mongoPrivateKey, {
          errorMessage,
          status: r3.status
        });
      }

      this.app.ppp.keyVault.setKey(
        'mongo-public-key',
        this.mongoPublicKey.value
      );
      this.app.ppp.keyVault.setKey(
        'mongo-private-key',
        this.mongoPrivateKey.value
      );

      this.app.toast.appearance = 'progress';
      this.app.toast.dismissible = false;
      this.toastText = 'Настройка приложения MongoDB Realm';
      this.app.toast.visible = true;

      DOM.queueUpdate(() => (this.app.toast.progress.value = 0));

      // 4. Create a MongoDB realm API key, setup cloud functions and services
      const r4 = await this.#setUpMongoDBRealm(
        this.app.ppp.keyVault.getKey('auth0-token'),
        r3.logs.response.access_token
      );

      if (!r4.ok) {
        console.warn(r4);

        if (r4.status === 404 && r4.details.missing === 'project') {
          invalidate(this.app.toast, {
            errorMessage: 'Проект ppp не найден.'
          });
        } else if (r4.status === 404 && r4.details.missing === 'app') {
          invalidate(this.app.toast, {
            errorMessage: 'Приложение ppp не найдено.'
          });
        } else {
          invalidate(this.app.toast, {
            errorMessage: 'Операция не выполнена.'
          });
        }
      }

      this.app.toast.progress.value = 80;
      this.toastText = 'Запись учётных данных в приложение Auth0';

      // 5. Store all the credentials inside Auth0 app
      const r5 = await this.#setUpAuth0App(
        this.auth0Token.value,
        r2.details[0].user_id
      );

      if (!r5.ok) {
        console.warn(r5);

        if (r5.status === 417) {
          invalidate(this.app.toast, {
            errorMessage: 'Приложение ppp не найдено.'
          });
        } else {
          invalidate(this.app.toast, {
            errorMessage: 'Операция не выполнена.'
          });
        }
      }

      this.app.toast.progress.value = 90;
      this.toastText = 'Сохранение данных авторизации Auth0 в GitHub';

      const r6 = await this.#updateGitHubMilestone({
        domain: r2.domain,
        clientId: r5.clientId
      });

      if (!r6.ok) {
        console.warn(r6);

        invalidate(this.app.toast, {
          errorMessage: 'Операция не выполнена.'
        });
      }

      this.app.toast.appearance = 'success';
      this.app.toast.dismissible = true;
      this.toastText = 'Операция выполнена успешно, обновите страницу.'
      this.app.toast.progress.value = 100;
    } catch (e) {
      console.error(e);

      invalidate(this.app.toast, {
        errorMessage: 'Операция не выполнена.'
      });
    } finally {
      this.busy = false;
    }
  }
}
