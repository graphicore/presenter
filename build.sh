#! /usr/bin/env bash
cd slides;
mkdir pdf;
rm -rf pdf/*;
find -maxdepth 1 -type f -name '*0.svg' -exec inkscape -f '{}' -A './pdf/{}.pdf' \; \
&& pdfunite ./pdf/*.svg.pdf ../slides.pdf
