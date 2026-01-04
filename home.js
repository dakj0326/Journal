fetch("/profile", { credentials: "same-origin" })
  .then(res => {
    if (res.status === 401) {
      window.location.replace("/login.html");
      return null;
    }
    if (!res.ok) {
      throw new Error("Failed to load profile");
    }
    return res.json();
  })
  .then(data => {
    if (!data) return;

    document.getElementById("profile").textContent =
      JSON.stringify(data, null, 2);
    window.alert(data.username);
  })
  .catch(err => {
    console.error(err);
  });
