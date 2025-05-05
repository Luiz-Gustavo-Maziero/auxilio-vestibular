document.addEventListener("DOMContentLoaded", () => {
    fetch("../views/header.html",  { cache: "no-store" })
      .then(res => res.text())
      .then(data => {
        document.getElementById("header").innerHTML = data;
      });
  });
  