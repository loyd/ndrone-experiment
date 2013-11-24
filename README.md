ndrone
======
Quadrocopter based on nodejs.

                         ndrone [master]
                     availability of workers
                    ┌───────────────────────┐
    flight [worker] │    attitudes data     │ fpv [worker]
    ────────────────┤   ════════════════>   ├───────────────
        sensors     │        control        │ OSD
     stabilization  │   <════════════════   │ transfer video
     rotors control │                       │ driving

Start development
-----------------
`npm install && make install-tsd`

Use `make`:
```sh
make build       # build project to build/
make package     # build project to /tmp/ and pack into build/
make install-tsd # install typescript definitions (.d.ts)
make tree        # get structure of project
make labels      # generate list of #TODOs, #FIXMEs and #XXXs
make clean       # get rid of the garbage
```

Commit message conventions
--------------------------
[Please use AngularJS conventions](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#).

Commiting features
------------------
1. If feature consists of one commit then just push it to current branch.  
2. If feature requires more than one commit then:  
  2a. create branch `{feature name}`;  
  2b. commits witin branch won't be like `feat`, but `chore/fix/etc`;  
  3c. after finishing do `pull` and `rebase` with **master**;  
  3d. `merge` with `--edit --no-ff` and name `feat({feature name}): {feature description}`;  
  3e. then `push`.  

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
