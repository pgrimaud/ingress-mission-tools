#!/usr/bin/env python
# coding: utf-8

# kml2csv.py    -- export a summary of a KML file to a CSV file.
#
# Usage:
#   kml2csv.py <inputfile>.kml [<outputfile>.csv]

# Useful modules
import sys
from os.path import splitext
from xml.etree.ElementTree import parse
import csv

# Display usage
if len(sys.argv) <= 1:
    print """
    Usage: {} <inputfile>.kml [<outputfile>.csv]
    """.format(sys.argv[0])
    sys.exit(1)

# File names
kmlname = sys.argv[1]
csvname = sys.argv[2] if len(sys.argv) > 2 else splitext(kmlname)[0] + '.csv'

# Load the KML document
xml_root = parse(kmlname).getroot()
ns = xml_root.tag.split('}', 1)[0] + '}'

# Function to get a field's content
def get_content(elmt, fieldname):
    obj = elmt.find(ns + fieldname)
    if obj is None: raise Exception('No XML field "' + fieldname + '" in ' + str(elmt))
    return obj.text.encode('utf-8').strip()

# Function to get a marker's data
def get_data(marker):
    elmt = marker.find(ns + 'Point')
    if elmt is None: elmt = marker.find(ns + 'LineString')
    if elmt is None: raise Exception('Cannot find data')
    return get_content(elmt, 'coordinates')

# Get all markers
document = xml_root[0]
layers = document.findall(ns + 'Folder')
markers = { M: L for L in layers for M in L.findall(ns + 'Placemark') }

# Save into a CSV file
with open(csvname, 'wb') as csvfile:
    wter = csv.writer(csvfile, delimiter=';')
    wter.writerow(['Nom de la mission', 'Catégorie', 'Style du marqueur', 'Coordonnées'])
    for M, L in markers.items():
        name, category = get_content(M, 'name'), get_content(L, 'name')
        data, style = get_data(M), get_content(M, 'styleUrl')
        wter.writerow([name, category, style, data])
