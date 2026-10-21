"""Tests for tests/check_site.py, plus a run against the real site.

Fixtures are fake pages written to a temp dir; nothing touches the network.
Run: python -m unittest discover -s tests -v
"""
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import check_site  # noqa: E402

REPO = Path(__file__).resolve().parent.parent

GOOD = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="styles.css?v=3">
  <link href="https://fonts.example.invalid/css" rel="stylesheet">
</head>
<body>
  <a href="#top" id="top">top</a>
  <a href="mailto:someone@example.invalid">mail</a>
  <a href="sub/">sub</a>
  <img src="img/logo.svg" alt="">
  <br/>
  <ul><li>one<li>two</ul>
  <script src="app.js?v=1"></script>
</body>
</html>
"""


class CheckSiteTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        for rel in ("styles.css", "app.js", "img/logo.svg", "sub/index.html"):
            p = self.root / rel
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text("<!DOCTYPE html><html></html>" if rel.endswith(".html") else "")

    def tearDown(self):
        self.tmp.cleanup()

    def page(self, html, name="index.html"):
        (self.root / name).write_text(html, encoding="utf-8")
        return check_site.check_site(self.root)

    def assertOneError(self, errors, fragment):
        self.assertEqual(len(errors), 1, errors)
        self.assertIn(fragment, errors[0])

    def test_good_page_is_clean(self):
        self.assertEqual(self.page(GOOD), [])

    def test_missing_local_file(self):
        errors = self.page(GOOD.replace("app.js?v=1", "missing.js?v=1"))
        self.assertOneError(errors, "'missing.js?v=1' does not resolve")

    def test_missing_fragment_target(self):
        errors = self.page(GOOD.replace('href="#top"', 'href="#nowhere"'))
        self.assertOneError(errors, "'#nowhere': no element with that id")

    def test_link_outside_site(self):
        errors = self.page(GOOD.replace("styles.css?v=3", "../etc/passwd"))
        self.assertOneError(errors, "points outside the site")

    def test_unclosed_element(self):
        errors = self.page(GOOD.replace("</body>", "<div>\n</body>"))
        self.assertTrue(any("<div>" in e for e in errors), errors)

    def test_misnested_elements(self):
        errors = self.page(GOOD.replace("<br/>", "<div><span></div></span>"))
        self.assertTrue(any("closes <span>" in e for e in errors), errors)

    def test_stray_end_tag(self):
        errors = self.page(GOOD.replace("<br/>", "</section>"))
        self.assertOneError(errors, "stray end tag </section>")

    def test_void_end_tag(self):
        errors = self.page(GOOD.replace("<br/>", "<br></br>"))
        self.assertOneError(errors, "void element")

    def test_duplicate_id(self):
        errors = self.page(GOOD.replace("<br/>", '<span id="top"></span>'))
        self.assertOneError(errors, "duplicate id 'top'")

    def test_missing_doctype(self):
        errors = self.page(GOOD.replace("<!DOCTYPE html>\n", ""))
        self.assertOneError(errors, "missing <!DOCTYPE html>")

    def test_no_pages(self):
        (self.root / "sub/index.html").unlink()
        self.assertOneError(check_site.check_site(self.root), "no .html files")


class RealSiteTests(unittest.TestCase):
    def test_repo_site_is_clean(self):
        self.assertEqual(check_site.check_site(REPO), [])


if __name__ == "__main__":
    unittest.main()
