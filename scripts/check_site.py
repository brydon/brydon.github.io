#!/usr/bin/env python3
"""Check local links and required files for the hand-authored site pages."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
REQUIRED_FILES = ("CNAME", ".nojekyll")
REMOTE_SCHEMES = {"data", "http", "https", "javascript", "mailto", "tel"}


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []
        self.anchors = set()

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        for attribute in ("href", "src"):
            if values.get(attribute):
                self.references.append(values[attribute])
        if values.get("id"):
            self.anchors.add(values["id"])
        if tag == "a" and values.get("name"):
            self.anchors.add(values["name"])


def parse_page(path, cache):
    if path not in cache:
        parser = PageParser()
        parser.feed(path.read_text(encoding="utf-8"))
        cache[path] = parser
    return cache[path]


def local_target(source, reference):
    parsed = urlsplit(reference)
    if parsed.scheme.lower() in REMOTE_SCHEMES or parsed.netloc:
        return None, None

    raw_path = unquote(parsed.path)
    if raw_path.startswith("/"):
        target = ROOT / raw_path.lstrip("/")
    elif raw_path:
        target = source.parent / raw_path
    else:
        target = source

    target = target.resolve()
    try:
        target.relative_to(ROOT)
    except ValueError:
        return target, parsed.fragment

    if target.is_dir():
        target = target / "index.html"
    return target, unquote(parsed.fragment)


def display_path(path):
    try:
        return path.relative_to(ROOT)
    except ValueError:
        return path


def main():
    errors = []
    cache = {}

    for required in REQUIRED_FILES:
        if not (ROOT / required).is_file():
            errors.append(f"missing required file: {required}")

    pages = sorted(ROOT.glob("*.html"))
    if not pages:
        errors.append("no top-level HTML pages found")

    for page in pages:
        parser = parse_page(page, cache)
        for reference in parser.references:
            target, fragment = local_target(page, reference)
            if target is None:
                continue
            display = display_path(target)
            if not target.is_file():
                errors.append(f"{page.name}: {reference!r} points to missing {display}")
                continue
            if fragment and target.suffix.lower() == ".html":
                target_parser = parse_page(target, cache)
                if fragment not in target_parser.anchors:
                    errors.append(
                        f"{page.name}: {reference!r} points to missing anchor "
                        f"#{fragment} in {display}"
                    )

    if errors:
        print("Local site checks failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"Checked {len(pages)} top-level HTML pages and their local references.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
