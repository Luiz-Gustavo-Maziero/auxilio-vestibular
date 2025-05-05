document.addEventListener("DOMContentLoaded", () => {
    fetch("tcc/views/header.html",  { cache: "no-store" })
      .then(res => res.text())
      .then(data => {
        document.getElementById("header").innerHTML = data;
      });
  });
  