addEventListener('scheduled', (event) => {
  event.waitUntil(handleSchedule());
});

async function handleSchedule() {
  const authPageRequest = await fetch('https://cp.sprinthost.ru/auth/login');
  const authPageResponse = await authPageRequest.text();
  const [sessionId] = authPageRequest.headers.get('set-cookie').split(';');

  const csrfTokenName = authPageResponse.match(
    /csrf-token-name" content="([a-z_0-9]+)/i
  )?.[1];
  const csrfTokenValue = authPageResponse.match(
    /csrf-token-value" content="([a-z_0-9]+)/i
  )?.[1];

  if (csrfTokenName && csrfTokenValue) {
    const usernameRequest = await fetch(
      'https://cp.sprinthost.ru/ajax/auth/username',
      {
        method: 'POST',
        headers: {
          Origin: 'https://cp.sprinthost.ru',
          Host: 'cp.sprinthost.ru',
          'Content-Type': 'application/json;charset=UTF-8',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36'
        },
        body: JSON.stringify({ username: LOGIN })
      }
    );

    if (sessionId) {
      console.log(sessionId);

      const usernameResponse = await usernameRequest.json();

      if (usernameResponse.status === 1) {
        const formData = new FormData();

        formData.append('username', LOGIN);
        formData.append('password', PASSWORD);
        formData.append(csrfTokenName, csrfTokenValue);
        formData.append('back_url', 'null');

        console.log(
          (
            await fetch('https://cp.sprinthost.ru/auth/login-auth', {
              method: 'POST',
              headers: {
                Origin: 'https://cp.sprinthost.ru',
                Host: 'cp.sprinthost.ru',
                Cookie: sessionId,
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36'
              },
              body: formData
            })
          ).status
        );
      }
    }
  }
}
