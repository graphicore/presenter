This is online [here](http://graphicore.github.io/presenter). Firefox doesn't use the webfonts when the svg is a background image, chrome/chromium should look good.

Presenter
=========
This is the presenation I held at the LGM. Beeing no native english speaker, I basically had a lot of text prepared in a cheat sheet. So this is not only slides but what I said, too.

*I wrote a tool for presentation and everybody I showed it liked the Idea, so I share it.*

The code is not perfect, it was just ad-hoc coding.

Give me feedback if you want to use this, too. We can make it work for anyone.

Run
===

 1. To have the fonts displayed propperly, install Pt-Sans and PT-Sans-Caption:
http://www.fontstock.com/public/PTSans.zip
 2. Navigate to the root directory of the repository
 3. Start a simple webserver: `$ python -m SimpleHTTPServer 8000`
 4. Navigate your browser to http://localhost:8000  

Use
===
 * The site is made for my screen at 1920x1080 pixels.
 * use the "add slave" button to open a window that's dissplaying just the slides without the helper tools
 * use your browsers builtin fullscreen mode (press"F11") to cover the whole projector screen with the slave window.
 * use arrow keys, the space bar, pos1, end to navigate the slides
 * or klick on a thumbnail at the bottom.
 * use normal scrolling, drag'n'drop or a touchscreen to scroll the texts on the right side, if they are too long for one page.

Licenses:
=========

the presentation is under:
creative commons 
Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)
https://creativecommons.org/licenses/by-nd/4.0/

By presenation I mean everything in the slides directory and the globals.slides data in index.html

Everything else is AGPLv3
http://www.gnu.org/licenses/agpl-3.0.html
