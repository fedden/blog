import re


def replace_sidenotes(match):
    id_val = match.group(1)
    text = match.group(2)
    return "".join([
        f'<label for="sn-{id_val}" class="sidenote-toggle sidenote-number" />',
        f'<input type="checkbox" id="sn-{id_val}" class="sidenote-toggle" />',
        f'<span class="sidenote">{text}</span>'
    ])


def on_page_markdown(markdown: str, **kwargs):
    # Regular expression to find [id]{text}
    pattern = r'\[(\d+)\]\{([^}]*)\}'
    # Perform the substitution
    updated_markdown = re.sub(pattern, replace_sidenotes, markdown)
    return updated_markdown
