function setText(id, text) {
  document.getElementById(id).textContent = text || "";
}

function addItem(parent, tag, title, text) {
  const item = document.createElement(tag);
  const h3 = document.createElement("h3");
  const p = document.createElement("p");
  h3.textContent = title || "";
  p.textContent = text || "";
  item.append(h3, p);
  parent.append(item);
}

fetch("content/site.json")
  .then((res) => res.json())
  .then((d) => {
    document.title = d.siteName + " | PC Gaming";
    setText("siteName", d.siteName);
    setText("heroTitle", d.heroTitle);
    setText("heroText", d.heroText);
    setText("heroButton", d.heroButton);
    setText("gamesTitle", d.gamesTitle);
    setText("newsTitle", d.newsTitle);
    setText("contactTitle", d.contactTitle);
    setText("contactText", d.contactText);
    setText("footerText", d.footer);
    document.getElementById("emailButton").href = "mailto:" + d.email;

    const games = document.getElementById("gameList");
    (d.games || []).forEach((g) => addItem(games, "li", g.title, g.text));

    const news = document.getElementById("newsList");
    (d.news || []).forEach((n) => addItem(news, "article", n.title, n.text));
  })
  .catch(() => {
    setText("heroTitle", "Content could not be loaded.");
  });
