#!/usr/bin/env python3
"""Builds src/data/hudRents.json from HUD's Small Area Fair Market Rents (SAFMR) workbook.

Usage:  python3 scripts/build-hud-rents.py path/to/FY27_safmrs.xlsx

Download the workbook from https://www.huduser.gov/portal/datasets/fmr.html
(Fair Market Rents -> Small Area FMRs -> the current fiscal year's Excel file).
Only ZIP codes the app already recognises (src/data/texasZipAreas.json) are kept,
and only the base SAFMR for 0-4 bedrooms (not the 90%/110% payment standards).
Uses the Python standard library only.
"""
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
ROOT = Path(__file__).resolve().parent.parent
BASE_COLUMNS = (3, 6, 9, 12, 15)  # SAFMR 0BR, 1BR, 2BR, 3BR, 4BR


def column_index(ref):
    index = 0
    for letter in re.match(r'[A-Z]+', ref).group():
        index = index * 26 + ord(letter) - 64
    return index - 1


def read_rows(path):
    with zipfile.ZipFile(path) as book:
        shared = [''.join(t.text or '' for t in si.iter(NS + 't'))
                  for si in ET.fromstring(book.read('xl/sharedStrings.xml')).findall(NS + 'si')]
        for _, element in ET.iterparse(book.open('xl/worksheets/sheet1.xml'), events=('end',)):
            if element.tag != NS + 'row':
                continue
            cells = {}
            for cell in element.findall(NS + 'c'):
                value = cell.find(NS + 'v')
                if value is not None:
                    cells[column_index(cell.get('r'))] = shared[int(value.text)] if cell.get('t') == 's' else value.text
            yield [cells.get(i) for i in range(max(cells) + 1)] if cells else []
            element.clear()


def main(path):
    areas = json.loads((ROOT / 'src/data/texasZipAreas.json').read_text())
    known = {zip_code for group in areas['countyGroups'].values() for zip_code in group.split(' ')}
    rows = read_rows(path)
    header = next(rows)
    expected = [f'SAFMR\n{n}BR' for n in range(5)]
    if [header[i] for i in BASE_COLUMNS] != expected:
        sys.exit(f'Unexpected column layout in workbook header: {header[:7]}')

    zips = {}
    for row in rows:
        if len(row) <= BASE_COLUMNS[-1] or row[0] not in known:
            continue
        values = [int(row[i]) for i in BASE_COLUMNS]
        # A ZIP can appear once per HUD area it touches; the published values agree.
        if zips.setdefault(row[0], values) != values:
            sys.exit(f'Conflicting rents for ZIP {row[0]}')

    output = {
        'fiscalYear': 2027,
        'source': 'HUD User, FY2027 Small Area Fair Market Rents',
        'sourceUrl': 'https://www.huduser.gov/portal/datasets/fmr.html',
        'bedrooms': ['0BR', '1BR', '2BR', '3BR', '4BR'],
        'zips': dict(sorted(zips.items())),
    }
    target = ROOT / 'src/data/hudRents.json'
    target.write_text(json.dumps(output, separators=(',', ':')) + '\n')
    print(f'Wrote {len(zips)} ZIP codes to {target.relative_to(ROOT)}')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
