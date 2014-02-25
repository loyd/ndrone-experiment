ndrone
======
Quadrocopter based on nodejs.

                    ┌─────────────────┐
                       main [master]
                     ────────────────
                     • availability
                     • communication
                    └─────────────────┘
    ┌─────────────────┐              ┌─────────────────┐               ┌──────────────────┐
      flight [worker]      state         fpv [worker]    video & state    index [master]
     ─────────────────  ═══════════>  ─────────────────  ════════════>  ──────────────────
     • sensors                        • capture                          • video decoding
     • stabilization    <═══════════  • video encoding   <════════════   • OSD
     • rotors control      control    • server              control      • driving
    └─────────────────┘              └─────────────────┘               └──────────────────┘

Start development
-----------------
`make setup`

Use `make`:
```sh
make                  # same as `make deploy`
make build            # build project to `/tmp/ndrone/` (by default)
make deploy           # build and deploy project to raspi@ndrone:/home/ndrone (by default)
make setup[:nm|:tsd]  # development environment setup
make update[:nm|:tsd] # development environment update
make lint             # use tslint to check `libs/`, `embed/`, `client/` and `shared/`
make tree             # print structure of project
make labels           # generate list of #TODOs, #FIXMEs and #XXXs
make clean            # get rid of the garbage
```

Commit message conventions
--------------------------
[Please use AngularJS conventions](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#).

Amendments to commit message conventions
----------------------------------------
1. Target contains sufficent path that one can definitely say what is message about.  
  1a. Directory path ends with `/`.
2. All extensions are specified, but `.ts`.
3. Use `""` for quoting in commit messages.

Committing
----------
1. If work was done in one commit then `push` to `master`.  
2. If word requires more than one commit then:  
  2a. create branch `{work name}`;  
  2b. commit message conventions are still actual within branches;  
  2c. when work is done, do `pull` and `rebase` with `master`;  
  2d. `merge` with `--edit --no-ff` and name it according to objectives (`feat/fix/chore`) `({work subject}): {work description}`;  
  2e. then `push`.

Order of items within classes
-----------------------------
* static fields
* static accessors
* static methods
* instance fields
* instance accessors
* constructor
* instance methods

Within each of these groups order by access:

* public
* private

*This order is recomended, but not a dogma.*

Code style and principles
-------------------------
[Please use mostly Google style](https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml).

Amendments to code style
------------------------
* do not do `@const`
* do `if(...)`, `while(...)`, etc
* prefer nodejs features (do not use `.charAt()` etc)
* use `file_names_like_this`
* use `lowerCamelCase` for TS enumerators
* identation in 4 whitespaces
* 80-90 symbols per line
* always align multiline arguments or conditions for readability
* do not use `{}` for single operators
* multiline ternars:

```javascript
a = b ? c
  : d ? t
  : e
```  

* make prototype extentions in `libs/` only
* always align `:` or `=` by blocks with difference in < 3 symbols
* `:` without whitespace after variable, but before type
* name imported modules equal to they real names
* use `//#TODO: ...`, `//#FIXME: ...` and `//#XXX: ...`
