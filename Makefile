#### Compiler
TSC = ./node_modules/.bin/tsc
TSFLAGS = -m commonjs -t ES5 --noImplicitAny

#### Linter
TSLINT = ./node_modules/.bin/tslint
TSLINTFLAGS =

#### Browser adapter
BRFY = ./node_modules/.bin/browserify
BRFYFLAGS = --dg

#### Definitions
TSDREPO = http://github.com/borisyankov/DefinitelyTyped/raw/master
TSDDIR  = definitions

TSDLIST = node \
          node-ffi

#### Parts
EMBED = embed/ndrone.ts \
        embed/flight/flight.ts \
        embed/fpv/fpv.ts

CLIENT = client/index.ts

#### Remote
RTARGET ?= raspi@ndrone
RPATH   ?= /home

################################################################################
.DEFAULT_GOAL = package

#### Targets
build: build/embed build/client

build/embed: $(shell find embed shared libs -name '*.ts') config.ts
	mkdir -p $(_out)/embed
	$(TSC) $(TSFLAGS) $(EMBED) --outDir $(_out)

build/client: $(shell find client shared libs -type f) config.ts
	mkdir -p $(_out)/client
	$(TSC) $(TSFLAGS) $(CLIENT) --outDir /tmp/ndrone/
	$(BRFY) $(BRFYFLAGS) /tmp/ndrone/$(CLIENT:.ts=.js) -o $(_out)/client/bundle.js
	$(foreach file, $(shell find client -type f ! -name '*.ts'), \
		mkdir -p $(_out)/$(dir $(file))$(\n) \
		cp $(file) $(_out)/$(file)$(\n))

#### Tasks
deploy: package
	scp $(shell ls build | grep ndrone- | tail -n 1) '$(RTARGET):$(RPATH)/ndrone.tar'
	ssh $(RTARGET) 'cd $(RPATH) && tar -xvf ndrone.tar && rm ndrone.tar'

package: _out = /tmp/ndrone
package: build
	$(eval _PKGID = $(shell echo "obase=16; (`date +%s`-1384201244)/60" | bc))
	cp package.json $(_out)
	npm shrinkwrap && mv npm-shrinkwrap.json $(_out)
	mkdir -p build
	cd $(_out) && tar -cf "$(CURDIR)/build/ndrone-$(_PKGID).tar" *

lint:
	$(foreach file, $(shell find libs embed client shared -name '*.ts'), \
		$(TSLINT) -f $(file)$(\n))

setup:   setup\:nm   setup\:tsd
update: update\:nm  update\:tsd

setup\:nm:
	npm install

update\:nm:
	npm update

load = curl -L --create-dirs $(TSDREPO)/$1/$1.d.ts -o $(TSDDIR)/$1/$1.d.ts
setup\:tsd update\:tsd:
	$(foreach name, $(TSDLIST), $(call load,$(name))$(\n))

tree:
	@tree -CFa --dirsfirst -I '.git|node_modules|definitions|build' | head -n -2

labels:
	@egrep -Hnor --include '*.ts' '//#(TODO|FIXME|XXX):.*' libs embed client shared |\
		awk -F'://#' '\
			/#FIXME:/ { print "\033[0;31m"$$2"\033[0m", "("$$1")" }\
			/#TODO:/  { print "\033[0;32m"$$2"\033[0m", "("$$1")" }\
			/#XXX:/   { print "\033[0;33m"$$2"\033[0m", "("$$1")" }\
		' | sort

clean:
	rm -rf build
	rm -rf /tmp/ndrone

#### Private
_out = build
define \n


endef
