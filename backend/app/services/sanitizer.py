import re
from html import escape, unescape


ALLOWED_TAGS = {
    "p", "br", "b", "strong", "i", "em", "u", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li", "blockquote", "a", "span", "div", "hr"
}

ALLOWED_ATTRS = {
    "a": {"href", "title", "target", "rel"},
    "span": {"class"},
    "div": {"class"},
    "p": {"class"},
    "h2": {"class"},
    "h3": {"class"},
    "h4": {"class"},
}

DANGEROUS_PATTERNS = [
    re.compile(r"<\s*script[^>]*>.*?<\s*/\s*script\s*>", re.IGNORECASE | re.DOTALL),
    re.compile(r"<\s*style[^>]*>.*?<\s*/\s*style\s*>", re.IGNORECASE | re.DOTALL),
    re.compile(r"<\s*iframe[^>]*>.*?<\s*/\s*iframe\s*>", re.IGNORECASE | re.DOTALL),
    re.compile(r"<\s*object[^>]*>.*?<\s*/\s*object\s*>", re.IGNORECASE | re.DOTALL),
    re.compile(r"<\s*embed[^>]*>.*?<\s*/\s*embed\s*>", re.IGNORECASE | re.DOTALL),
    re.compile(r"on\w+\s*=", re.IGNORECASE),  # onload, onerror, onclick, etc.
    re.compile(r"javascript\s*:", re.IGNORECASE),
    re.compile(r"data\s*:\s*text/html", re.IGNORECASE),
    re.compile(r"vbscript\s*:", re.IGNORECASE),
]


def sanitize_html(html_content: str) -> str:
    """
    Sanitizes HTML content server-side to prevent Cross-Site Scripting (XSS).
    Removes script, iframe, unsafe tags, javascript: protocols, and event handlers.
    """
    if not html_content:
        return ""

    content = html_content

    # 1. Strip active dangerous blocks (scripts, styles, iframes, objects)
    for pattern in DANGEROUS_PATTERNS:
        content = pattern.sub("", content)

    # 2. Tokenize and filter HTML tags
    tag_regex = re.compile(r"(</?)([a-zA-Z0-9]+)([^>]*)(>)")

    def filter_tag(match: re.Match) -> str:
        prefix, tag_name, raw_attrs, suffix = match.groups()
        tag_lower = tag_name.lower()

        if tag_lower not in ALLOWED_TAGS:
            return ""  # Discard disallowed tag

        if prefix == "</":
            return f"</{tag_lower}>"

        # Sanitize attributes
        cleaned_attrs = []
        if tag_lower in ALLOWED_ATTRS:
            allowed_attr_names = ALLOWED_ATTRS[tag_lower]
            # Match key="value" or key='value'
            attr_matches = re.finditer(r'([a-zA-Z0-9_-]+)\s*=\s*(["\'])(.*?)\2', raw_attrs)
            for attr in attr_matches:
                attr_name = attr.group(1).lower()
                attr_val = attr.group(3).strip()

                if attr_name in allowed_attr_names:
                    # Validate URLs in href
                    if attr_name == "href":
                        val_lower = attr_val.lower()
                        if not (val_lower.startswith("http://") or val_lower.startswith("https://") or val_lower.startswith("mailto:") or val_lower.startswith("/")):
                            continue
                        cleaned_attrs.append(f'{attr_name}="{escape(attr_val)}"')
                    elif attr_name in ("target", "rel"):
                        cleaned_attrs.append(f'{attr_name}="{escape(attr_val)}"')
                    elif attr_name == "title":
                        cleaned_attrs.append(f'{attr_name}="{escape(attr_val)}"')

        if tag_lower == "a":
            # Force secure attributes on external links
            if not any('rel=' in a for a in cleaned_attrs):
                cleaned_attrs.append('rel="noopener noreferrer"')

        attrs_str = (" " + " ".join(cleaned_attrs)) if cleaned_attrs else ""
        return f"<{tag_lower}{attrs_str}>"

    sanitized = tag_regex.sub(filter_tag, content)
    return sanitized.strip()
