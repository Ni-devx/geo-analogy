const searchInput = document.getElementById("searchInput");
const searchClear = document.getElementById("searchClear");
const searchDropdown = document.getElementById("searchDropdown");
const searchList = document.getElementById("searchList");
const searchCount = document.getElementById("searchCount");

const headings = Array.from(document.querySelectorAll("main h3"));

function collectTextForHeading(h3) {
  let text = h3.textContent || "";
  let node = h3.nextElementSibling;

  while (node && node.tagName.toLowerCase() !== "h3") {
    text += ` ${node.textContent || ""}`;
    node = node.nextElementSibling;
  }

  return text.replace(/\s+/g, " ").trim();
}

const index = headings.map((h3) => {
  const section = h3.closest("section");
  const h2 = section ? section.querySelector("h2") : null;
  const h2Text = h2 ? h2.textContent.trim() : "";
  const contentText = collectTextForHeading(h3);

  return {
    id: h3.id,
    h3: h3.textContent.trim(),
    h2: h2Text,
    content: contentText,
    haystack: `${h2Text} ${contentText}`.toLowerCase(),
  };
});

function buildSnippet(text, term, radius = 40) {
  const lowerText = text.toLowerCase();
  const index = lowerText.indexOf(term);
  if (index === -1) {
    return "";
  }

  const start = Math.max(0, index - 20);
  const end = Math.min(text.length, index + term.length + radius);
  const snippet = text.slice(start, end).trim();
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return `${prefix}${snippet}${suffix}`;
}

function renderResults(results, term) {
  searchList.innerHTML = "";
  searchCount.textContent = `一致: ${results.length}`;

  if (results.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "該当なし";
    searchList.appendChild(empty);
    return;
  }

  results.slice(0, 20).forEach((item) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${item.id}`;

    const h2Span = document.createElement("span");
    h2Span.className = "search-h2";
    h2Span.textContent = item.h2;

    const h3Span = document.createElement("span");
    h3Span.className = "search-h3";
    h3Span.textContent = item.h3;

    const snippet = buildSnippet(item.content, term);
    const snippetSpan = document.createElement("span");
    snippetSpan.className = "search-snippet";
    snippetSpan.textContent = snippet;

    a.appendChild(h2Span);
    a.appendChild(h3Span);
    if (snippet) {
      a.appendChild(snippetSpan);
    }
    li.appendChild(a);
    searchList.appendChild(li);
  });
}

function openDropdown() {
  searchDropdown.hidden = false;
}

function closeDropdown() {
  searchDropdown.hidden = true;
}

function runSearch() {
  const term = searchInput.value.trim().toLowerCase();
  if (term.length < 2) {
    closeDropdown();
    return;
  }

  const results = index.filter((item) => item.haystack.includes(term));

  renderResults(results, term);
  openDropdown();
}

searchInput.addEventListener("input", runSearch);
searchClear.addEventListener("click", () => {
  searchInput.value = "";
  closeDropdown();
});

searchList.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    closeDropdown();
  }
});

window.addEventListener("click", (event) => {
  if (!event.target.closest(".search-wrapper")) {
    closeDropdown();
  }
});
