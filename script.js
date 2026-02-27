const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const searchResult = document.getElementById("searchResult");
const content = document.getElementById("content");
const sections = Array.from(document.querySelectorAll("details.section"));

function unwrapMarks() {
  const marks = content.querySelectorAll("mark.search-hit");
  marks.forEach((mark) => {
    const text = document.createTextNode(mark.textContent || "");
    mark.replaceWith(text);
  });
}

function highlightText(term) {
  const lowerTerm = term.toLowerCase();
  let total = 0;

  const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (!node.nodeValue || !node.nodeValue.trim()) {
        return NodeFilter.FILTER_REJECT;
      }
      const parent = node.parentElement;
      if (!parent) {
        return NodeFilter.FILTER_REJECT;
      }
      if (parent.closest("mark")) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }

  nodes.forEach((node) => {
    const text = node.nodeValue;
    const lowerText = text.toLowerCase();
    let index = lowerText.indexOf(lowerTerm);

    if (index === -1) {
      return;
    }

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    while (index !== -1) {
      if (index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, index)));
      }

      const mark = document.createElement("mark");
      mark.className = "search-hit";
      mark.textContent = text.slice(index, index + term.length);
      fragment.appendChild(mark);
      total += 1;

      lastIndex = index + term.length;
      index = lowerText.indexOf(lowerTerm, lastIndex);
    }

    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    node.replaceWith(fragment);
  });

  return total;
}

function openSectionsWithHits() {
  sections.forEach((section) => {
    const hasHit = section.querySelector("mark.search-hit");
    if (hasHit) {
      section.open = true;
    }
  });
}

function updateResult(count) {
  searchResult.textContent = `一致: ${count}`;
}

function runSearch() {
  const term = searchInput.value.trim();

  unwrapMarks();

  if (term.length < 2) {
    updateResult(0);
    return;
  }

  const count = highlightText(term);
  openSectionsWithHits();
  updateResult(count);
}

function clearSearch() {
  searchInput.value = "";
  unwrapMarks();
  updateResult(0);
}

searchBtn.addEventListener("click", runSearch);
clearBtn.addEventListener("click", clearSearch);
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    runSearch();
  }
});

function openFromHash() {
  const id = window.location.hash.replace("#", "");
  if (!id) {
    return;
  }
  const target = document.getElementById(id);
  if (target && target.tagName.toLowerCase() === "details") {
    target.open = true;
  }
}

window.addEventListener("hashchange", openFromHash);
window.addEventListener("load", openFromHash);
