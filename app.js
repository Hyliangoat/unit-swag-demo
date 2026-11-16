"use strict";
const $ = (s) => document.querySelector(s),
  esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    ),
  money = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n),
  uid = () =>
    crypto.randomUUID?.() ||
    Date.now().toString(36) + Math.random().toString(36).slice(2),
  clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const colors = [
    ["Black", "#272a27"],
    ["Olive", "#596348"],
    ["Sand", "#c8b99b"],
    ["White", "#e9e7df"],
    ["Navy", "#313b4b"],
  ],
  sizes = ["S", "M", "L", "XL", "2XL", "3XL"];
const catalog = {
  tee: ["Classic cotton tee", 12, 26],
  hoodie: ["Heavyweight hoodie", 23, 49],
  crew: ["Crewneck sweatshirt", 19, 42],
};
const blank = (text = "") => ({
    text,
    image: "",
    x: 50,
    y: 44,
    scale: 70,
    rotation: 0,
    ink: "#e8e5ce",
  }),
  key = "unit-swag-demo-v1";
const product = (id, store, kind, title, color, text) => ({
  id,
  store,
  kind,
  title,
  price: catalog[kind][2],
  colors: [...new Set([color, 0, 2])],
  sizes: [...sizes],
  front: blank(text),
  back: blank(),
  status: "published",
});
function seed() {
  return {
    stores: [
      {
        id: "death-dealers",
        name: "Death Dealers",
        tag: "Built different.",
        description: "Field-inspired apparel for the whole team.",
        color: "#333c30",
        logo: "",
        status: "published",
      },
      {
        id: "aces",
        name: "A Co Aces",
        tag: "Always on top.",
        description: "Clean, understated unit essentials.",
        color: "#394451",
        logo: "",
        status: "published",
      },
      {
        id: "iron-company",
        name: "Iron Company",
        tag: "Earned, not given.",
        description: "A collection built for the team.",
        color: "#594838",
        logo: "",
        status: "published",
      },
    ],
    products: [
      product(
        "dd-tee",
        "death-dealers",
        "tee",
        "Death Dealers · Field tee",
        1,
        "DEATH DEALERS",
      ),
      product(
        "dd-hood",
        "death-dealers",
        "hoodie",
        "Death Dealers · Heavy hoodie",
        0,
        "DEATH DEALERS",
      ),
      product(
        "dd-crew",
        "death-dealers",
        "crew",
        "Death Dealers · Crewneck",
        2,
        "DEATH DEALERS",
      ),
      product("aces-tee", "aces", "tee", "Aces · Classic tee", 4, "A CO ACES"),
      product(
        "aces-hood",
        "aces",
        "hoodie",
        "Aces · Duty hoodie",
        0,
        "A CO ACES",
      ),
      product(
        "iron-tee",
        "iron-company",
        "tee",
        "Iron · Field tee",
        1,
        "IRON COMPANY",
      ),
    ],
    cart: [],
    orders: [],
  };
}
let state;
try {
  state = JSON.parse(localStorage.getItem(key)) || seed();
  if (!state.stores || !state.products || !state.cart || !state.orders)
    state = seed();
} catch {
  state = seed();
}
let timer;
function toast(t) {
  $("#toast").textContent = t;
  $("#toast").classList.add("show");
  clearTimeout(timer);
  timer = setTimeout(() => $("#toast").classList.remove("show"), 3000);
}
function save(next) {
  try {
    localStorage.setItem(key, JSON.stringify(next));
    state = next;
    return true;
  } catch {
    toast("Unable to save: browser storage full or unavailable.");
    return false;
  }
}
const copy = () => structuredClone(state),
  store = (id) => state.stores.find((s) => s.id === id),
  prod = (id) => state.products.find((p) => p.id === id),
  visible = (p) =>
    p.status === "published" && store(p.store)?.status === "published";
const go = (h) => {
    if (location.hash === "#" + h) render();
    else location.hash = h;
  },
  btn = (t, h, c = "") => `<a class="btn ${c}" href="#${esc(h)}">${esc(t)}</a>`,
  heading = (k, t, d) =>
    `<p class="eyebrow">${esc(k)}</p><h1 class="page-title">${esc(t)}</h1><p class="sub">${esc(d)}</p>`;
const safeImg = (s) =>
    typeof s === "string" &&
    /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(s)
      ? s
      : "",
  safeColor = (s) => (/^#[0-9a-f]{6}$/i.test(s) ? s : "#333c30");
const paths = {
  tee: "M113 38 72 49 20 107 63 147 98 119 96 287 Q180 300 264 287 L262 119 297 147 340 107 288 49 247 38 Q180 77 113 38Z",
  crew: "M115 38 75 50 40 76 12 250 63 263 101 122 96 288 Q180 300 264 288 L259 122 297 263 348 250 320 76 285 50 245 38 Q180 75 115 38Z",
  hoodie:
    "M118 53 77 60 42 85 12 251 63 263 101 133 96 288 Q180 301 264 288 L259 133 297 263 348 251 318 85 282 60 242 53 Q180 83 118 53Z",
};
let seq = 0;
const area = { x: 113, y: 88, w: 134, h: 156 };
function garment(kind, col, a = blank(), edit = false, side = "front") {
  let fill = colors[col][1],
    clip = "p" + ++seq,
    w = (area.w * a.scale) / 100,
    x = area.x + (area.w * a.x) / 100,
    y = area.y + (area.h * a.y) / 100,
    f = Math.min(22, w / (Math.max(a.text.length, 1) * 0.65));
  return `<svg class="garment" viewBox="0 0 360 320" role="img" aria-label="${catalog[kind][0]} ${colors[col][0]} ${side}" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="${clip}"><rect x="113" y="88" width="134" height="156"/></clipPath></defs><ellipse cx="180" cy="299" rx="109" ry="10" fill="#000" opacity=".09"/><path d="${paths[kind]}" fill="${fill}" stroke="#111" stroke-opacity=".25" stroke-width="2"/><path d="M119 46 Q180 ${side === "back" ? 66 : 91} 241 46" fill="none" stroke="#111" stroke-opacity=".18" stroke-width="9"/>${kind === "hoodie" ? `<path d="M118 54 Q117 7 180 10 Q243 7 242 54 Q180 84 118 54Z" fill="${fill}" stroke="#111" stroke-opacity=".3" stroke-width="2"/>${side === "front" ? '<path d="M163 67 L157 98 M197 67 L203 98 M132 228 L146 216 H214 L228 228 L233 267 H127Z" fill="none" stroke="#111" stroke-opacity=".23" stroke-width="2"/>' : ""}` : ""}<path d="M102 123 L109 276 M258 123 L251 276 M102 282 Q180 292 258 282" stroke="#111" stroke-opacity=".12" fill="none"/>${edit ? '<rect x="113" y="88" width="134" height="156" fill="#fff" fill-opacity=".04" stroke="#f0c674" stroke-width="1.5" stroke-dasharray="5 4"/>' : ""}<g clip-path="url(#${clip})"><g class="drag-art" transform="translate(${x} ${y}) rotate(${a.rotation})">${safeImg(a.image) ? `<image href="${safeImg(a.image)}" x="${-w / 2}" y="${-w / 2}" width="${w}" height="${w}"/>` : ""}<text y="${a.image ? w / 2 + f : f * 0.3}" text-anchor="middle" font-size="${f}" font-family="Arial,sans-serif" font-weight="900" fill="${safeColor(a.ink)}">${esc(a.text)}</text><rect x="${-w / 2}" y="${a.image ? -w / 2 : -12}" width="${w}" height="${a.image ? w : 24}" fill="transparent"/></g></g></svg>`;
}
function logo(s) {
  return safeImg(s.logo)
    ? `<img src="${safeImg(s.logo)}" alt="${esc(s.name)} logo">`
    : `<span class="unit-emblem">${esc(
        s.name
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0])
          .join("")
          .toUpperCase(),
      )}</span>`;
}
function storeCard(s) {
  return `<article class="card"><a href="#store/${esc(s.id)}"><div class="store-cover" style="--cover:${safeColor(s.color)}">${logo(s)}<small>UNIT COLLECTION</small></div><div class="cardbody"><h3>${esc(s.name)}</h3><p class="muted">${esc(s.tag)}</p><span class="btn light small full">Shop collection →</span></div></a></article>`;
}
function productCard(p) {
  return `<article class="card"><a href="#product/${esc(p.id)}"><div class="product-preview">${garment(p.kind, p.colors[0], p.front)}</div><div class="cardbody"><div class="phead"><h3>${esc(p.title)}</h3><span class="price">${money(p.price)}</span></div><p class="muted">${catalog[p.kind][0]}</p><div class="chips">${p.colors.map((i) => `<span style="width:15px;height:15px;background:${colors[i][1]};border-radius:50%;border:1px solid #aaa" title="${colors[i][0]}"></span>`).join("")}<span class="tiny muted">${p.sizes.length} sizes</span></div></div></a></article>`;
}
const grid = (items, fn) =>
  items.map(fn).join("") || '<p class="muted">No results yet.</p>';
function home() {
  return `<section class="hero"><div class="hero-copy"><p class="eyebrow">The unit merch platform</p><h1>Rep your<br><span class="accent">people.</span></h1><p>Custom apparel for the teams that do things differently. Build a store, design your gear, and give your people something worth wearing.</p><div class="actions">${btn("Find your unit", "stores", "primary")}${btn("Create a store", "create", "outline")}</div></div><div class="hero-art">${garment("tee", 1, blank("DEATH DEALERS"))}<span class="hero-tag">01 / FIELD COLLECTION</span></div></section><section class="section"><div class="sectionhead"><div><p class="eyebrow">Find your people</p><h2>Unit collections</h2></div><a class="back" href="#stores">View all →</a></div><div class="grid">${grid(state.stores.filter((s) => s.status === "published").slice(0, 3), storeCard)}</div></section><section class="section"><div class="sectionhead"><h2>Featured gear</h2></div><div class="grid products">${grid(state.products.filter(visible).slice(0, 3), productCard)}</div></section><section class="section"><h2>Your unit. Your rules.</h2><div class="steps"><div class="step"><strong>01 / BUILD</strong><h3>Create a store</h3><p>Add your unit identity.</p></div><div class="step"><strong>02 / DESIGN</strong><h3>Make it yours</h3><p>Choose gear and place artwork.</p></div><div class="step"><strong>03 / SHARE</strong><h3>Launch your collection</h3><p>Publish and let your people shop.</p></div></div><div class="actions">${btn("Start designing", "create")}</div></section>`;
}
function directory() {
  return `${heading("The directory", "Find your unit", "Explore collections or start a storefront of your own.")}<div class="filterbar"><input id="search" class="control" type="search" placeholder="Search units…" aria-label="Search units">${btn("Create store", "create")}</div><div id="results" class="grid">${grid(
    state.stores.filter((s) => s.status === "published"),
    storeCard,
  )}</div>`;
}
function shop(id) {
  let s = store(id);
  if (!s || s.status !== "published")
    return missing("Store unavailable or created on another device.");
  return `<a class="back" href="#stores">← All stores</a><div class="storehero" style="--cover:${safeColor(s.color)}">${safeImg(s.logo) ? logo(s) : ""}<div><p class="eyebrow" style="color:#d5dfbd">Unit storefront</p><h1>${esc(s.name)}</h1><p>${esc(s.tag)} ${esc(s.description)}</p></div></div><div class="sectionhead section"><h2>Shop the collection</h2><button id="share" class="btn light small">Copy link</button></div><div class="filterbar"><input id="search" class="control" type="search" placeholder="Search gear…" aria-label="Search gear"><select id="filter" class="control" aria-label="Filter garment"><option value="all">All types</option>${Object.entries(
    catalog,
  )
    .map(([k, c]) => `<option value="${k}">${c[0]}</option>`)
    .join("")}</select></div><div id="results" class="grid products">${grid(
    state.products.filter((p) => p.store === id && visible(p)),
    productCard,
  )}</div>`;
}
let selection = null,
  design = null;
function swatches(arr, active, attr) {
  return `<div class="swatches">${arr.map((i) => `<button type="button" class="swatch ${active === i ? "active" : ""}" style="--swatch:${colors[i][1]}" data-${attr}="${i}" aria-label="${colors[i][0]}" aria-pressed="${active === i}"></button>`).join("")}</div>`;
}
function sides(side, attr) {
  return `<div class="seg">${["front", "back"].map((s) => `<button data-${attr}="${s}" class="${s === side ? "active" : ""}">${s === "front" ? "Front" : "Back"}</button>`).join("")}</div>`;
}
function item(id) {
  let p = prod(id);
  if (!p || !visible(p)) return missing("Product unavailable.");
  if (selection?.id !== id)
    selection = {
      id,
      color: p.colors[0],
      size: p.sizes[0],
      qty: 1,
      side: "front",
    };
  let v = selection;
  return `<a class="back" href="#store/${esc(p.store)}">← ${esc(store(p.store).name)}</a><div class="split" style="margin-top:0"><div class="panel">${sides(v.side, "item-side")}<div class="workspace">${garment(p.kind, v.color, p[v.side], false, v.side)}</div><p class="tiny muted">Illustrative garment mockup</p></div><div class="panel">${heading(store(p.store).name, p.title, catalog[p.kind][0])}<p class="checkout-total">${money(p.price)}</p><strong class="tiny">Color: ${colors[v.color][0]}</strong>${swatches(p.colors, v.color, "item-color")}<label class="field">Size<select id="buy-size">${p.sizes.map((s) => `<option ${s === v.size ? "selected" : ""}>${s}</option>`).join("")}</select></label><label class="field">Quantity<input id="buy-qty" type="number" min="1" max="20" value="${v.qty}"></label><button id="add" class="btn full">Add to bag</button><div class="notice">Demo only. Nothing is sent to a printer.</div></div></div>`;
}
function create(id) {
  let s = store(id);
  return `<a class="back" href="#admin">← Studio</a>${heading("Studio / store setup", s ? "Edit your store" : "Create your unit store", "Give your collection an identity. Add gear after saving.")}<div class="split"><form id="store-form" class="panel"><label class="field">Unit name<input name="name" required maxlength="45" placeholder="e.g. 1st Company" value="${esc(s?.name)}"></label><label class="field">Tagline<input name="tag" maxlength="70" value="${esc(s?.tag)}" placeholder="Built for the team."></label><label class="field">Description<textarea name="description" maxlength="250" rows="3">${esc(s?.description)}</textarea></label><label class="field">Brand color<input name="color" type="color" value="${safeColor(s?.color)}"></label><label class="field">Logo (optional)<input name="logo" type="file" accept="image/png,image/jpeg,image/webp"></label><button type="button" id="remove-logo" class="link">Remove logo</button><button class="btn full" type="submit">${s ? "Save store" : "Create draft store →"}</button></form><div class="panel"><p class="eyebrow">Live preview</p><div id="store-preview"></div><div class="notice">New stores are drafts until you publish them in the studio.</div></div></div>`;
}
function editDesign(id, pid) {
  let s = store(id),
    p = prod(pid);
  if (!s || (pid && (!p || p.store !== id)))
    return missing("Design not found.");
  if (!design || design.store !== id || design.editId !== (pid || "")) {
    design = p
      ? {
          ...structuredClone(p),
          editId: pid,
          side: "front",
          preview: p.colors[0],
        }
      : {
          store: id,
          editId: "",
          kind: "tee",
          title: "",
          price: 26,
          colors: [0, 1, 2],
          sizes: [...sizes],
          front: blank(s.name.toUpperCase().slice(0, 36)),
          back: blank(),
          status: "draft",
          side: "front",
          preview: 0,
        };
  }
  let d = design,
    a = d[d.side];
  return `<a class="back" href="#admin">← Studio</a>${heading("Studio / product builder", d.editId ? "Edit your gear" : "Design your gear", s.name + " · Customize the print and set your retail price.")}<div class="split"><div class="panel">${sides(d.side, "design-side")}<div class="workspace" id="workspace">${garment(d.kind, d.preview, a, true, d.side)}</div><p class="tiny muted">Drag artwork or use the controls. The dashed rectangle is the print area.</p><strong class="tiny">Preview: ${colors[d.preview][0]}</strong>${swatches(d.colors, d.preview, "preview")}<button id="export" class="btn light small">Export design JSON</button></div><div class="panel"><label class="field">Garment (mock catalog)<select id="kind">${Object.entries(
    catalog,
  )
    .map(
      ([k, c]) =>
        `<option value="${k}" ${k === d.kind ? "selected" : ""}>${c[0]} · ${money(c[1])} base</option>`,
    )
    .join(
      "",
    )}</select></label><label class="field">Upload artwork for ${d.side}<input id="upload" type="file" accept="image/png,image/jpeg,image/webp"></label><div class="toolbar"><button id="remove-art" class="link">Remove image</button><button id="reset-art" class="link">Reset position</button></div><label class="field">Design text<input id="art-text" maxlength="36" value="${esc(a.text)}"></label><label class="field">Text color<input id="ink" type="color" value="${safeColor(a.ink)}"></label>${[
    ["Horizontal", "x", 0, 100],
    ["Vertical", "y", 0, 100],
    ["Scale", "scale", 15, 100],
    ["Rotation", "rotation", -180, 180],
  ]
    .map(
      ([label, k, min, max]) =>
        `<label class="range">${label}<input type="range" data-range="${k}" min="${min}" max="${max}" value="${a[k]}"><output data-out="${k}">${a[k]}</output></label>`,
    )
    .join(
      "",
    )}<hr style="border:0;border-top:1px solid #dedfd5;margin:20px 0"><h3>Product details</h3><label class="field">Product title<input id="title" maxlength="65" value="${esc(d.title)}" placeholder="Company field tee"></label><strong class="tiny">Available colors</strong><div class="checklist">${colors.map((c, i) => `<label><input type="checkbox" data-variant="colors" value="${i}" ${d.colors.includes(i) ? "checked" : ""}>${c[0]}</label>`).join("")}</div><strong class="tiny">Available sizes</strong><div class="checklist">${sizes.map((s) => `<label><input type="checkbox" data-variant="sizes" value="${s}" ${d.sizes.includes(s) ? "checked" : ""}>${s}</label>`).join("")}</div><label class="field">Retail price (USD)<input id="price" type="number" min="1" max="500" step="0.01" value="${d.price}"></label><div id="margin" class="notice">${margin(d)}</div><div class="actions"><button class="btn light" data-save="draft">Save draft</button><button class="btn" data-save="published">Publish product</button></div><p class="tiny muted">No actual Printify product is created.</p></div></div>`;
}
const margin = (d) =>
  `Estimated gross margin: ${money(d.price - catalog[d.kind][1])} / item before shipping, fees and tax`;
function admin() {
  return `${heading("Creator studio", "Your stores", "Manage your collections as the demo administrator. No login is required.")}<div class="statgrid"><div class="stat"><strong>${state.stores.length}</strong><small>Stores</small></div><div class="stat"><strong>${state.products.length}</strong><small>Products</small></div><div class="stat"><strong>${state.orders.length}</strong><small>Demo orders</small></div></div><div class="actions">${btn("+ Create store", "create")}<button id="reset" class="btn light">Reset demo data</button></div><section class="section"><h2>Store management</h2>${state.stores
    .map(
      (s) =>
        `<section class="panel" style="margin-bottom:12px"><div class="phead"><div><h3>${esc(s.name)}</h3><span class="chip ${s.status === "draft" ? "draft" : ""}">${s.status}</span></div><div class="toolbar">${btn("Edit", "edit/" + s.id, "light small")}${s.status === "published" ? btn("View", "store/" + s.id, "light small") : ""}<button data-toggle-store="${esc(s.id)}" class="btn small ${s.status === "published" ? "light" : ""}">${s.status === "published" ? "Unpublish" : "Publish store"}</button></div></div><div class="actions">${btn("+ Design product", "design/" + s.id, "small")}</div>${state.products
          .filter((p) => p.store === s.id)
          .map(
            (p) =>
              `<div class="rowline"><div><strong>${esc(p.title)}</strong><p class="tiny muted">${money(p.price)} · ${p.status}</p></div><div class="toolbar">${btn("Edit", "design/" + s.id + "/" + p.id, "light small")}<button class="btn light small" data-toggle-product="${esc(p.id)}">${p.status === "published" ? "Unpublish" : "Publish"}</button></div></div>`,
          )
          .join("")}</section>`,
    )
    .join(
      "",
    )}</section><section class="section"><h2>Demo order history</h2>${state.orders.length ? state.orders.map((o) => `<div class="panel rowline" style="margin-bottom:10px"><div><strong>${esc(o.id)}</strong><p class="tiny muted">${esc(new Date(o.date).toLocaleString())} · ${o.items.reduce((a, b) => a + b.qty, 0)} items · Simulated</p></div><strong>${money(o.total)}</strong></div>`).join("") : '<p class="muted">No orders yet. Try the customer checkout flow.</p>'}</section>`;
}
function totals() {
  let subtotal = state.cart.reduce((a, b) => a + b.qty * b.price, 0),
    shipping = state.cart.length ? 5 : 0;
  return { subtotal, shipping, total: subtotal + shipping };
}
function summary() {
  let t = totals();
  return `<div class="rowline"><span>Subtotal</span><strong>${money(t.subtotal)}</strong></div><div class="rowline"><span>Mock shipping</span><strong>${money(t.shipping)}</strong></div><div class="rowline"><strong>Total</strong><strong class="checkout-total">${money(t.total)}</strong></div>`;
}
function cart() {
  return `${heading("Customer checkout", "Your bag", "Review your gear before placing a simulated order.")}${!state.cart.length ? `<div class="panel empty section"><h2>Your bag is empty.</h2>${btn("Explore stores", "stores")}</div>` : `<div class="split"><div class="panel">${state.cart.map((i) => `<div class="order-line"><div class="order-img">${garment(i.kind, i.color, i.front)}</div><div class="info"><h3>${esc(i.title)}</h3><p class="tiny muted">${colors[i.color][0]} / ${esc(i.size)}</p><strong>${money(i.price)}</strong><div class="qty"><button data-qty="${esc(i.id)}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${i.qty}</span><button data-qty="${esc(i.id)}" data-delta="1" aria-label="Increase quantity">+</button><button data-remove="${esc(i.id)}" class="link">Remove</button></div></div><strong>${money(i.price * i.qty)}</strong></div>`).join("")}</div><div class="panel"><h2>Order summary</h2>${summary()}<p class="notice">No payment or personal data collected. Taxes are not calculated.</p>${btn("Continue to demo checkout", "checkout", "full")}</div></div>`}`;
}
function checkout() {
  if (!state.cart.length) return cart();
  return `${heading("Customer checkout", "Place a demo order", "Experience checkout without real payments or personal details.")}<div class="split"><div class="panel"><h2>Mock delivery</h2><p>Demo Customer<br>Sample Address (not collected)<br>Standard mock shipping</p><p class="notice">No data will leave this browser. This is a local simulated order.</p><label class="field" style="display:flex;align-items:center"><input id="ack" type="checkbox" style="width:20px;min-height:20px"> I understand that this is a simulated order.</label><button id="place" class="btn full" disabled>Place demo order — ${money(totals().total)}</button></div><div class="panel"><h2>Summary</h2>${summary()}</div></div>`;
}
function confirmation(id) {
  let o = state.orders.find((o) => o.id === id);
  return o
    ? `<div class="panel empty"><p class="eyebrow">Simulation complete</p><h1 class="page-title">You're all set.</h1><p>Demo order <strong>${esc(o.id)}</strong> was saved on this device.</p><p class="checkout-total">${money(o.total)}</p><p class="muted">Nothing was purchased, charged or sent to a printer.</p><div class="actions" style="justify-content:center">${btn("Keep shopping", "stores")}${btn("View in studio", "admin", "light")}</div></div>`
    : missing("Order not found.");
}
function missing(t) {
  return `<div class="panel empty"><h1 class="page-title">Not available</h1><p>${esc(t)}</p>${btn("Back to stores", "stores")}</div>`;
}
function render() {
  let [page, id, pid] = (location.hash.slice(1) || "home").split("/"),
    views = {
      home,
      directory,
      stores: directory,
      store: shop,
      product: item,
      create,
      edit: create,
      design: editDesign,
      admin,
      cart,
      checkout,
      order: confirmation,
    };
  $("#app").innerHTML = Object.hasOwn(views, page)
    ? views[page](id, pid)
    : missing("Page not found.");
  $("#bag-count").textContent = state.cart.reduce((a, b) => a + b.qty, 0);
  bind(page, id);
}
const on = (s, event, fn) => $(s)?.addEventListener(event, fn),
  all = (s, event, fn) =>
    document
      .querySelectorAll(s)
      .forEach((el) => el.addEventListener(event, () => fn(el)));
async function imageFile(f) {
  if (
    !f ||
    !["image/png", "image/jpeg", "image/webp"].includes(f.type) ||
    f.size > 8 * 1024 * 1024
  )
    throw Error("Choose a PNG, JPG or WebP under 8 MB.");
  let url = URL.createObjectURL(f);
  try {
    let im = new Image();
    im.src = url;
    await im.decode();
    let r = Math.min(1, 480 / Math.max(im.naturalWidth, im.naturalHeight)),
      c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(im.naturalWidth * r));
    c.height = Math.max(1, Math.round(im.naturalHeight * r));
    c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
    return c.toDataURL("image/webp", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}
function refreshArt() {
  if (!$("#workspace") || !design) return;
  let d = design;
  $("#workspace").innerHTML = garment(
    d.kind,
    d.preview,
    d[d.side],
    true,
    d.side,
  );
  drag();
}
function drag() {
  let svg = $("#workspace svg"),
    art = svg?.querySelector(".drag-art");
  if (!art) return;
  let active = false,
    dx = 0,
    dy = 0;
  const point = (e) => {
    let p = svg.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  };
  art.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    let p = point(e),
      a = design[design.side];
    dx = p.x - (area.x + (area.w * a.x) / 100);
    dy = p.y - (area.y + (area.h * a.y) / 100);
    active = true;
    art.setPointerCapture(e.pointerId);
  });
  art.addEventListener("pointermove", (e) => {
    if (!active) return;
    let p = point(e),
      a = design[design.side];
    a.x = clamp(Math.round(((p.x - dx - area.x) / area.w) * 100), 0, 100);
    a.y = clamp(Math.round(((p.y - dy - area.y) / area.h) * 100), 0, 100);
    art.setAttribute(
      "transform",
      `translate(${area.x + (area.w * a.x) / 100} ${area.y + (area.h * a.y) / 100}) rotate(${a.rotation})`,
    );
    for (let k of ["x", "y"]) {
      $(`[data-range="${k}"]`).value = a[k];
      $(`[data-out="${k}"]`).textContent = a[k];
    }
  });
  for (let e of ["pointerup", "pointercancel", "lostpointercapture"])
    art.addEventListener(e, () => (active = false));
}
function download(data) {
  let url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    ),
    a = document.createElement("a");
  a.href = url;
  a.download = "unit-swag-design.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
let uploading = 0;
function bind(page, id) {
  if (page === "stores" || page === "directory")
    on("#search", "input", (e) => {
      $("#results").innerHTML = grid(
        state.stores.filter(
          (s) =>
            s.status === "published" &&
            `${s.name} ${s.tag}`
              .toLowerCase()
              .includes(e.target.value.toLowerCase()),
        ),
        storeCard,
      );
    });
  if (page === "store") {
    const f = () => {
      $("#results").innerHTML = grid(
        state.products.filter(
          (p) =>
            p.store === id &&
            visible(p) &&
            p.title.toLowerCase().includes($("#search").value.toLowerCase()) &&
            ($("#filter").value === "all" || p.kind === $("#filter").value),
        ),
        productCard,
      );
    };
    on("#search", "input", f);
    on("#filter", "change", f);
    on("#share", "click", async () => {
      try {
        await navigator.clipboard.writeText(location.href);
        toast("Link copied. Custom stores exist only on this device.");
      } catch {
        prompt("Copy link (custom stores are local only):", location.href);
      }
    });
  }
  if (page === "product") {
    all("[data-item-side]", "click", (e) => {
      selection.side = e.dataset.itemSide;
      render();
    });
    all("[data-item-color]", "click", (e) => {
      selection.color = Number(e.dataset.itemColor);
      render();
    });
    on("#buy-size", "change", (e) => (selection.size = e.target.value));
    on("#buy-qty", "input", (e) => (selection.qty = e.target.value));
    on("#add", "click", () => {
      let p = prod(id),
        v = selection,
        q = Number(v.qty);
      if (!Number.isInteger(q) || q < 1 || q > 20) {
        toast("Enter a quantity between 1 and 20.");
        return;
      }
      let n = copy();
      n.cart.push({
        id: uid(),
        productId: p.id,
        title: p.title,
        kind: p.kind,
        color: v.color,
        size: v.size,
        qty: q,
        price: p.price,
        front: p.front,
        back: p.back,
      });
      if (save(n)) {
        toast("Added to bag");
        go("cart");
      }
    });
  }
  if (page === "create" || page === "edit") {
    let s = store(id),
      f = $("#store-form"),
      img = s?.logo || "",
      pending = false;
    if (!f) return;
    const make = () => ({
        id: s?.id || "preview",
        name: f.elements.name.value.trim() || "Your unit",
        tag: f.elements.tag.value.trim() || "Built for the team.",
        description: f.elements.description.value.trim(),
        color: f.elements.color.value,
        logo: img,
        status: s?.status || "draft",
      }),
      preview = () => {
        $("#store-preview").innerHTML = storeCard(make());
        $("#store-preview a").removeAttribute("href");
      };
    preview();
    f.addEventListener("input", preview);
    on("[name=logo]", "change", async (e) => {
      if (!e.target.files[0] || pending) return;
      pending = true;
      try {
        img = await imageFile(e.target.files[0]);
        if (f.isConnected) {
          preview();
          toast("Logo uploaded");
        }
      } catch (err) {
        toast(err.message);
      } finally {
        pending = false;
      }
    });
    on("#remove-logo", "click", () => {
      if (pending) return;
      img = "";
      f.elements.logo.value = "";
      preview();
    });
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      if (pending) {
        toast("Image is processing.");
        return;
      }
      if (!f.elements.name.value.trim()) {
        toast("Enter a store name.");
        return;
      }
      let v = make(),
        n = copy();
      if (s) n.stores = n.stores.map((x) => (x.id === id ? v : x));
      else {
        v.id =
          (v.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") || "unit") +
          "-" +
          uid().slice(0, 6);
        n.stores.push(v);
      }
      if (save(n)) {
        toast(s ? "Store saved" : "Draft store created");
        go(s ? "admin" : "design/" + v.id);
      }
    });
  }
  if (page === "design" && $("#workspace")) {
    let d = design;
    drag();
    all("[data-design-side]", "click", (e) => {
      d.side = e.dataset.designSide;
      render();
    });
    all("[data-preview]", "click", (e) => {
      d.preview = Number(e.dataset.preview);
      render();
    });
    on("#kind", "change", (e) => {
      d.kind = e.target.value;
      d.price = catalog[d.kind][2];
      render();
    });
    on("#upload", "change", async (e) => {
      if (!e.target.files[0] || uploading) return;
      uploading++;
      let side = d.side;
      try {
        let img = await imageFile(e.target.files[0]);
        if (design === d) {
          d[side].image = img;
          refreshArt();
          toast("Artwork uploaded");
        }
      } catch (err) {
        toast(err.message);
      } finally {
        uploading--;
      }
    });
    on("#remove-art", "click", () => {
      if (uploading) return;
      d[d.side].image = "";
      $("#upload").value = "";
      refreshArt();
    });
    on("#reset-art", "click", () => {
      Object.assign(d[d.side], { x: 50, y: 44, scale: 70, rotation: 0 });
      render();
    });
    on("#art-text", "input", (e) => {
      d[d.side].text = e.target.value;
      refreshArt();
    });
    on("#ink", "input", (e) => {
      d[d.side].ink = e.target.value;
      refreshArt();
    });
    document.querySelectorAll("[data-range]").forEach((el) =>
      el.addEventListener("input", () => {
        let k = el.dataset.range;
        d[d.side][k] = Number(el.value);
        $(`[data-out="${k}"]`).textContent = el.value;
        refreshArt();
      }),
    );
    on("#title", "input", (e) => (d.title = e.target.value));
    on("#price", "input", (e) => {
      d.price = Number(e.target.value);
      $("#margin").textContent = margin(d);
    });
    all("[data-variant]", "change", (el) => {
      let k = el.dataset.variant,
        v = k === "colors" ? Number(el.value) : el.value,
        a = d[k];
      if (el.checked && !a.includes(v)) a.push(v);
      if (!el.checked) {
        if (a.length === 1) {
          el.checked = true;
          toast("Keep at least one variant.");
          return;
        }
        a.splice(a.indexOf(v), 1);
      }
      if (k === "colors") {
        if (!a.includes(d.preview)) d.preview = a[0];
        render();
      }
    });
    on("#export", "click", () => download({ ...d, prototype: true }));
    all("[data-save]", "click", (el) => {
      if (uploading) {
        toast("Image is processing.");
        return;
      }
      if (
        !d.title.trim() ||
        !Number.isFinite(d.price) ||
        d.price < 1 ||
        d.price > 500
      ) {
        toast("Enter a product title and price from $1 to $500.");
        return;
      }
      let { editId, side, preview, ...p } = structuredClone(d);
      p.id = editId || uid();
      p.title = p.title.trim();
      p.price = Math.round(p.price * 100) / 100;
      p.status = el.dataset.save;
      let n = copy();
      n.products = editId
        ? n.products.map((x) => (x.id === editId ? p : x))
        : [...n.products, p];
      if (save(n)) {
        design = null;
        toast("Product " + p.status + " locally");
        go("admin");
      }
    });
  }
  if (page === "admin") {
    all("[data-toggle-store]", "click", (el) => {
      let n = copy(),
        s = n.stores.find((s) => s.id === el.dataset.toggleStore);
      s.status = s.status === "published" ? "draft" : "published";
      if (save(n)) render();
    });
    all("[data-toggle-product]", "click", (el) => {
      let n = copy(),
        p = n.products.find((p) => p.id === el.dataset.toggleProduct);
      p.status = p.status === "published" ? "draft" : "published";
      if (save(n)) render();
    });
    on("#reset", "click", () => {
      if (
        confirm("Reset all local demo stores, products, bags and orders?") &&
        save(seed())
      ) {
        design = null;
        selection = null;
        render();
        toast("Demo reset");
      }
    });
  }
  if (page === "cart") {
    all("[data-qty]", "click", (el) => {
      let n = copy(),
        i = n.cart.find((i) => i.id === el.dataset.qty);
      i.qty = clamp(i.qty + Number(el.dataset.delta), 1, 99);
      if (save(n)) render();
    });
    all("[data-remove]", "click", (el) => {
      let n = copy();
      n.cart = n.cart.filter((i) => i.id !== el.dataset.remove);
      if (save(n)) render();
    });
  }
  if (page === "checkout") {
    on("#ack", "change", (e) => ($("#place").disabled = !e.target.checked));
    on("#place", "click", () => {
      if (!$("#ack").checked || !state.cart.length) return;
      let n = copy(),
        o = {
          id: "DEMO-" + uid().slice(0, 8).toUpperCase(),
          date: new Date().toISOString(),
          items: n.cart,
          ...totals(),
        };
      n.orders.unshift(o);
      n.cart = [];
      if (save(n)) go("order/" + o.id);
    });
  }
}
window.addEventListener("hashchange", () => {
  let page = location.hash.slice(1).split("/")[0];
  if (page !== "product") selection = null;
  if (page !== "design") design = null;
  render();
  window.scrollTo(0, 0);
});
render();
