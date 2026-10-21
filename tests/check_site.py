"""Static checks for the site: HTML well-formed, internal links resolve.

Stdlib only, no network. External URLs (http:, https:, mailto:, //host)
are skipped, not fetched.

Usage: python tests/check_site.py [site_dir]   (default: repo root)
Exit 0 when clean, 1 with one line per problem otherwise.
"""
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

VOID = {
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
    "meta", "source", "track", "wbr",
}
# Elements whose end tag HTML lets you omit: closed implicitly when the
# parent closes, rather than reported as unclosed.
OPTIONAL_END = {"p", "li", "dt", "dd", "option", "tr", "td", "th", "thead",
                "tbody", "tfoot", "colgroup", "rt", "rp", "optgroup"}
LINK_ATTRS = {"href", "src"}


class _Checker(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []  # (tag, line)
        self.errors = []
        self.links = []  # (url, line)
        self.ids = {}
        self.saw_doctype = False

    def _line(self):
        return self.getpos()[0]

    def handle_decl(self, decl):
        if decl.lower().startswith("doctype"):
            self.saw_doctype = True

    def handle_starttag(self, tag, attrs):
        self._attrs(tag, attrs)
        if tag not in VOID:
            self.stack.append((tag, self._line()))

    def handle_startendtag(self, tag, attrs):
        self._attrs(tag, attrs)

    def _attrs(self, tag, attrs):
        line = self._line()
        for name, value in attrs:
            if name == "id" and value:
                if value in self.ids:
                    self.errors.append(
                        f"line {line}: duplicate id {value!r} "
                        f"(first on line {self.ids[value]})")
                else:
                    self.ids[value] = line
            if name in LINK_ATTRS and value is not None:
                self.links.append((value, line))

    def handle_endtag(self, tag):
        line = self._line()
        if tag in VOID:
            self.errors.append(f"line {line}: end tag </{tag}> for void element")
            return
        if not any(t == tag for t, _ in self.stack):
            self.errors.append(f"line {line}: stray end tag </{tag}>")
            return
        while self.stack:
            top, opened = self.stack.pop()
            if top == tag:
                return
            if top not in OPTIONAL_END:
                self.errors.append(
                    f"line {line}: </{tag}> closes <{top}> opened on line "
                    f"{opened} without its end tag")

    def finish(self):
        self.close()
        for tag, opened in self.stack:
            if tag not in OPTIONAL_END:
                self.errors.append(f"line {opened}: <{tag}> never closed")
        if not self.saw_doctype:
            self.errors.append("missing <!DOCTYPE html>")


def _is_external(url):
    parts = urlsplit(url)
    return bool(parts.scheme) or url.startswith("//")


def check_file(html_path, site_root):
    """Return a list of problem strings for one HTML file."""
    html_path = Path(html_path)
    site_root = Path(site_root).resolve()
    checker = _Checker()
    checker.feed(html_path.read_text(encoding="utf-8"))
    checker.finish()
    errors = list(checker.errors)

    for url, line in checker.links:
        url = url.strip()
        if not url or _is_external(url):
            continue
        parts = urlsplit(url)
        if not parts.path:  # same-page "#frag"
            if parts.fragment and parts.fragment not in checker.ids:
                errors.append(f"line {line}: {url!r}: no element with that id")
            continue
        base = site_root if parts.path.startswith("/") else html_path.parent
        target = (base / unquote(parts.path).lstrip("/")).resolve()
        if target.is_dir():
            target = target / "index.html"
        if site_root not in target.parents and target != site_root:
            errors.append(f"line {line}: {url!r} points outside the site")
        elif not target.is_file():
            errors.append(f"line {line}: {url!r} does not resolve to a file")

    name = html_path.name
    return [f"{name}: {e}" for e in errors]


def check_site(site_root):
    site_root = Path(site_root)
    errors = []
    pages = sorted(p for p in site_root.rglob("*.html")
                   if not any(part.startswith(".") or part == "tests"
                              for part in p.relative_to(site_root).parts))
    if not pages:
        return [f"no .html files under {site_root}"]
    for page in pages:
        errors.extend(check_file(page, site_root))
    return errors


def main(argv):
    root = Path(argv[1]) if len(argv) > 1 else Path(__file__).resolve().parent.parent
    errors = check_site(root)
    for e in errors:
        print(e)
    if not errors:
        print(f"ok: {root}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
