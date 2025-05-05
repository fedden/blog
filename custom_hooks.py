import re


def replace_sidenotes(match):
    id_val = match.group(1)
    text = match.group(2)
    return "".join([
        f'<span class="sidenote-wrapper">',
        f'<label for="sn-{id_val}" class="sidenote-toggle sidenote-number"></label>',
        f'<input type="checkbox" id="sn-{id_val}" class="sidenote-toggle" />',
        f'<span class="sidenote">{text}</span>',
        f'</span>'
    ])


def on_page_markdown(markdown: str, **kwargs):
    # Regular expression to find [id]{text}
    # This version properly handles text before and after the sidenote
    pattern = r'\[(\d+)\]\{([^}]*)\}'
    
    # Track the current position in the string
    position = 0
    result = []
    
    # Find all matches
    for match in re.finditer(pattern, markdown):
        # Get the text before the match
        result.append(markdown[position:match.start()])
        
        # Get the replacement for the match
        id_val = match.group(1)
        text = match.group(2)
        replacement = ''.join([
            f'<span class="sidenote-wrapper">',
            f'<a href="#sidenote-{id_val}" class="sidenote-number-link">',
            f'<label for="sn-{id_val}" class="sidenote-toggle sidenote-number"></label>',
            f'</a>',
            f'<input type="checkbox" id="sn-{id_val}" class="sidenote-toggle" />',
            f'<span id="sidenote-{id_val}" class="sidenote">',
            f'<a href="#sidenote-{id_val}" class="sidenote-link">{text}</a>',
            f'</span>',
            f'</span>'
        ])
        
        result.append(replacement)
        position = match.end()
    
    # Add any remaining text
    result.append(markdown[position:])
    
    # Join all the pieces
    return ''.join(result)
