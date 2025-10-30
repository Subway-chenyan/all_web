#!/usr/bin/env python3
"""
Simple translation compilation script since msgfmt is not available
This script creates .mo files from .po files using a basic approach
"""

import os
import struct
from pathlib import Path

def compile_po_to_mo(po_file_path, mo_file_path):
    """Compile a .po file to .mo file format"""

    # Read the PO file
    with open(po_file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Parse the PO file
    translations = {}
    msgid = None
    msgstr = None

    for line in content.split('\n'):
        line = line.strip()

        if line.startswith('msgid '):
            # Save previous translation if exists
            if msgid is not None and msgstr is not None:
                translations[msgid] = msgstr

            # Start new translation
            msgid = line[7:-1]  # Remove 'msgid ' and quotes
            msgstr = ""

        elif line.startswith('msgstr '):
            msgstr = line[8:-1]  # Remove 'msgstr ' and quotes

        elif line.startswith('"') and msgid is not None:
            # Continuation line for msgid or msgstr
            if msgstr == "":
                msgid += line[1:-1]  # Remove quotes
            else:
                msgstr += line[1:-1]  # Remove quotes

    # Save last translation
    if msgid is not None and msgstr is not None:
        translations[msgid] = msgstr

    # Remove empty string translation (header)
    if '' in translations:
        del translations['']

    # Create .mo file
    keys = sorted(translations.keys())

    # Calculate offsets
    koffsets = []
    voffsets = []
    kencoded = []
    vencoded = []

    for key in keys:
        k = key.encode('utf-8')
        v = translations[key].encode('utf-8')
        kencoded.append(k)
        vencoded.append(v)

    # Header
    magic = 0x950412de
    version = 0
    num_strings = len(keys)

    # Calculate table offsets
    original_table_offset = 7 * 4  # 7 fields * 4 bytes each
    translation_table_offset = original_table_offset + num_strings * 8  # Each entry is 8 bytes

    # Calculate string positions
    pos = translation_table_offset + num_strings * 8

    # Build original table
    original_table = []
    for k in kencoded:
        length = len(k)
        original_table.append((length, pos))
        pos += length + 1  # +1 for null terminator

    # Build translation table
    translation_table = []
    for v in vencoded:
        length = len(v)
        translation_table.append((length, pos))
        pos += length + 1  # +1 for null terminator

    # Write .mo file
    with open(mo_file_path, 'wb') as f:
        # Header
        f.write(struct.pack('<I', magic))
        f.write(struct.pack('<I', version))
        f.write(struct.pack('<I', num_strings))
        f.write(struct.pack('<I', original_table_offset))
        f.write(struct.pack('<I', translation_table_offset))
        f.write(struct.pack('<I', 0))  # hash size
        f.write(struct.pack('<I', 0))  # hash offset

        # Original table
        for length, offset in original_table:
            f.write(struct.pack('<I', length))
            f.write(struct.pack('<I', offset))

        # Translation table
        for length, offset in translation_table:
            f.write(struct.pack('<I', length))
            f.write(struct.pack('<I', offset))

        # Strings
        for k in kencoded:
            f.write(k + b'\x00')

        for v in vencoded:
            f.write(v + b'\x00')

    print(f"Compiled {po_file_path} -> {mo_file_path} ({num_strings} strings)")

def find_and_compile_translations():
    """Find all .po files and compile them to .mo files"""

    base_path = Path(".")
    po_files = list(base_path.rglob("*.po"))

    if not po_files:
        print("No .po files found")
        return

    for po_file in po_files:
        mo_file = po_file.with_suffix('.mo')
        try:
            compile_po_to_mo(po_file, mo_file)
        except Exception as e:
            print(f"Error compiling {po_file}: {e}")

if __name__ == "__main__":
    find_and_compile_translations()