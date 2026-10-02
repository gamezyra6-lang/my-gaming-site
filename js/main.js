const $ = (id) => document.getElementById(id);
const getJSON = (url) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(url);
    return r.json();
  });

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}
function setText(id, text) {
  const n = $(id);
  if (n) n.textContent = text || "";
}
function safeLink(url) {
  return /^https?:\/\//i.test(url || "") ? url : "";
}
function safeImage(url) {
  return /^(\/(?!\/)|https?:\/\/)/i.test(url || "") ? url : "";
}
function postUrl(post) {
  return "post.html?post=" + encodeURIComponent(post.slug);
}

/* Shared parts: header, footer, home page */
getJSON("content/site.json")
  .then((d) => {
    setText("siteName", d.siteName);
    setText("footerText", d.footer);
    if (!$("heroTitle")) return;
    document.title = d.siteName + " | Free PC games";
    setText("heroTitle", d.heroTitle);
    setText("heroText", d.heroText);
    setText("heroButton", d.heroButton);
    setText("gamesTitle", d.gamesTitle);
    setText("contactTitle", d.contactTitle);
    setText("contactText", d.contactText);
    $("emailButton").href = "mailto:" + d.email;
    const list = $("gameList");
    (d.games || []).forEach((g) => {
      const li = el("li");
      const a = el("a");
      a.href = "games.html?category=" + encodeURIComponent(g.title);
      a.append(el("h3", "", g.title), el("p", "", g.text));
      li.append(a);
      list.append(li);
    });
  })
  .catch(() => {});

/* Games page */
if ($("gameGrid")) {
  getJSON("content/games.json").then((d) => {
    const games = d.games || [];
    const categories = ["All"].concat([...new Set(games.map((g) => g.category))]);
    const params = new URLSearchParams(location.search);
    const rawQuery = (params.get("q") || "").trim();
    const q = rawQuery.toLowerCase();
    const box = document.querySelector(".search input");
    if (box) box.value = rawQuery;
    let active = params.get("category") || "All";
    if (!categories.includes(active)) active = "All";

    function draw() {
      const filters = $("filters");
      const grid = $("gameGrid");
      filters.replaceChildren();
      grid.replaceChildren();
      categories.forEach((c) => {
        const b = el("button", c === active ? "on" : "", c);
        b.onclick = () => { active = c; draw(); };
        filters.append(b);
      });
      const shown = games.filter(
        (g) =>
          (active === "All" || g.category === active) &&
          (!q || [g.title, g.category, g.description].join(" ").toLowerCase().includes(q))
      );
      if (!shown.length) grid.append(el("p", "", "No games found."));
      shown.forEach((g) => {
          const card = el("article", "card");
          const pic = safeImage(g.image);
          if (pic) {
            const img = el("img", "card-img");
            img.src = pic;
            img.alt = g.title;
            img.loading = "lazy";
            card.append(img);
          }
          card.append(el("span", "meta", g.category), el("h3", "", g.title), el("p", "", g.description));
          const link = safeLink(g.link);
          if (link) {
            const a = el("a", "button", "Download");
            a.href = link;
            a.target = "_blank";
            a.rel = "noopener";
            card.append(a);
          }
          grid.append(card);
        });
    }
    draw();
  });
}

/* News list page */
if ($("newsList")) {
  getJSON("content/news.json").then((d) => {
    const list = $("newsList");
    (d.posts || []).forEach((p) => {
      const item = el("article");
      const h3 = el("h3");
      const a = el("a", "post-link", p.title);
      a.href = postUrl(p);
      h3.append(a);
      item.append(el("p", "meta", p.date), h3, el("p", "", p.summary));
      list.append(item);
    });
  });
}

/* Single post page */
if ($("postBody")) {
  getJSON("content/news.json").then((d) => {
    const slug = new URLSearchParams(location.search).get("post");
    const post = (d.posts || []).find((p) => p.slug === slug);
    if (!post) {
      setText("postTitle", "Post not found");
      return;
    }
    document.title = post.title;
    setText("postTitle", post.title);
    setText("postDate", post.date);
    const body = $("postBody");
    String(post.body || "")
      .split(/\n\s*\n/)
      .forEach((para) => body.append(el("p", "", para.trim())));
  });
}

/* Highlight the current page in the menu */
const here = location.pathname.split("/").pop().replace(/\.html$/, "") || "index";
const section = here === "post" ? "news" : here;
document.querySelectorAll("nav a").forEach((a) => {
  if (a.getAttribute("href") === section + ".html") a.classList.add("on");
});
