(async () => {
  try {
    const res = await fetch('http://localhost:4000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'ops1@admin.com', password: 'password' }),
    });
    console.log('status', res.status);
    const text = await res.text();
    console.log(text);
  } catch (err) {
    console.error('error', err);
  }
})();
