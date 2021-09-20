class KeyVault {
  keys = {};

  async checkGitHubToken({ token }) {
    try {
      return await fetch('https://api.github.com/user', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token ${token}`
        }
      });
    } catch (e) {
      return {
        ok: false,
        status: 422
      };
    }
  }

  async checkAuth0Credentials({ domain, clientId }) {
    try {
      if (!domain || !clientId) return false;

      const redirectURI = encodeURIComponent(window.location.origin);

      await fetch(
        new URL(
          `authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectURI}`,
          `https://${domain}`
        ),
        {
          mode: 'cors',
          redirect: 'manual'
        }
      );

      return true;
    } catch (e) {
      return false;
    }
  }

  async checkMongoRealmCredentials({ publicKey, privateKey }) {
    try {
      if (!publicKey || !privateKey) return false;

      return await fetch(
        'https://realm.mongodb.com/api/admin/v3.0/auth/providers/mongodb-cloud/login',
        {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: publicKey,
            apiKey: privateKey
          })
        }
      );
    } catch (e) {
      return false;
    }
  }
}

export { KeyVault };
