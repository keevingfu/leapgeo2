#!/usr/bin/env python3
"""
Quick fix for SQLAlchemy 2.0 text() requirement
"""
import re
import os

routers_path = "/users/cavin/desktop/dev/leapgeo2/backend/app/routers"
files_to_fix = ["stats.py", "prompts.py", "citations.py"]

for filename in files_to_fix:
    filepath = os.path.join(routers_path, filename)

    with open(filepath, 'r') as f:
        content = f.read()

    # Add text import if not present
    if 'from sqlalchemy import' in content and 'text' not in content:
        content = re.sub(
            r'(from sqlalchemy import [^)]+)',
            r'\1, text',
            content
        )

    # Wrap SQL strings in text()
    # Pattern 1: await conn.execute("...")
    content = re.sub(
        r'await conn\.execute\("([^"]+)"\)',
        r'await conn.execute(text("\1"))',
        content
    )

    # Pattern 2: await conn.execute("""...""")
    content = re.sub(
        r'await conn\.execute\("""',
        r'await conn.execute(text("""',
        content
    )

    # Close the text() for triple quotes
    # Find patterns like: text("""...""", {...)
    content = re.sub(
        r'(text\("""[^"]+""")(\s*,\s*\{)',
        r'\1)\2',
        content
    )

    # Find patterns like: text("""...""")
    # but not already closed
    lines = content.split('\n')
    fixed_lines = []
    in_text_block = False

    for line in lines:
        if 'text("""' in line and not line.strip().endswith(')))'):
            in_text_block = True

        if in_text_block and '"""' in line and 'text("""' not in line:
            if not line.strip().endswith(')'):
                line = line.replace('"""', '""")')
            in_text_block = False

        fixed_lines.append(line)

    content = '\n'.join(fixed_lines)

    with open(filepath, 'w') as f:
        f.write(content)

    print(f"✅ Fixed {filename}")

print("\n🎉 All files fixed!")
