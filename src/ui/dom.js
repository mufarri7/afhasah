export function element(tagName, options = {}, children = []) {
  const node = document.createElement(tagName);

  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  if (options.id) node.id = options.id;

  for (const [name, value] of Object.entries(options.attributes ?? {})) {
    if (value !== null && value !== undefined) node.setAttribute(name, String(value));
  }

  for (const child of Array.isArray(children) ? children : [children]) {
    if (child) node.append(child);
  }

  return node;
}

export function clear(node) {
  node.replaceChildren();
}
