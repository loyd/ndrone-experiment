#### Compiler
TSC = ./node_modules/.bin/tsc
TSFLAGS = -m commonjs -t ES5

#### Linter
TSLINT = ./node_modules/.bin/tslint

#### Definitions
TSDREPO = http://github.com/borisyankov/DefinitelyTyped/raw/master
TSDDIR  = definitions

#### Parts
EMBED = embed/ndrone.ts \
        embed/flight/flight.ts \
        embed/fpv/fpv.ts

CLIENT = client/index.ts

################################################################################
.DEFAULT_GOAL = package

build: build/embed build/client
	cp package.json $(_out)

build/embed: $(shell find libs embed -name '*.ts') config.ts
	mkdir -p $(@D)
	$(TSC) $(TSFLAGS) $(EMBED) --outDir $(_out)

build/client: $(shell find libs client -name '*.ts') config.ts
	mkdir -p $(addprefix $(_out)/, $(shell find client -type d))
	$(TSC) $(TSFLAGS) $(CLIENT) --outDir $(_out)/client
	cp $(shell find client -type f ! -name '*.ts') $(_out)/client

package: _out = /tmp/ndrone
package: build
	npm shrinkwrap && mv npm-shrinkwrap.json $(_out)/
	mkdir -p build
	cd $(_out) && tar -cf "$(CURDIR)/build/ndrone-`date +%s`.tar" *

lint:
	$(foreach file, $(shell find libs embed client -name '*.ts'), \
		$(TSLINT) -f $(file)$(\n))

load = curl -L --create-dirs $(TSDREPO)/$1/$1.d.ts -o $(TSDDIR)/$1/$1.d.ts
install-tsd:
	$(call load,node)
	$(call load,node-ffi)

tree:
	@tree -CFa --dirsfirst -I '.git|node_modules|definitions|build' | head -n -2

labels:
	@egrep -Hnor --include '*.ts' '//#(TODO|FIXME|XXX):.*' libs embed client |\
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
