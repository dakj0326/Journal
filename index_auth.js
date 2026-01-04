const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  if (!username || !password) return;

  const res = await postJSON("/login", { username, password });

  if (res.ok) {
    document.getElementById("login-modal").hidden = true;
    window.location.href = "/home.html";
  }
});

const createForm = document.getElementById("user-create-form");

createForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("user-username").value.trim();
  const password = document.getElementById("user-password").value;

  if (!username || !password) return;

  const res = await postJSON("/signup", { username, password });

  if (res.ok) {
    document.getElementById("user-modal").hidden = true;
    window.location.reload();
  }
});

async function postJSON(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return res;
}

