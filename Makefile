#### Common
OUT ?= /tmp/ndrone

#### Compiler
TSC = ./node_modules/.bin/tsc
TSFLAGS = -m commonjs -t ES5 --noImplicitAny

#### Linter
TSLINT = ./node_modules/.bin/tslint
TSLINTFLAGS =

#### Definitions
TSDREPO = http://github.com/borisyankov/DefinitelyTyped/raw/master
TSDDIR = definitions

TSDLIST = node \
          node-ffi

#### Parts
EMBED = embed/main.ts \
        embed/flight/flight.ts \
        embed/fpv/fpv.ts

CLIENT = client/index.ts

#### Remote
RTARGET ?= raspi@ndrone
RPATH ?= /home/ndrone

################################################################################
.DEFAULT_GOAL = deploy

#### Targets
$(OUT)/embed: $(shell find embed shared libs -name '*.ts') config.ts
	mkdir -p $@/
	$(TSC) $(TSFLAGS) $(EMBED) --outDir $(OUT)/

$(OUT)/client: $(shell find client shared libs -name '*.ts') config.ts \
               $(addprefix $(OUT)/, $(shell find client -type f ! -name '*.ts'))
	mkdir -p $@/
	$(TSC) $(TSFLAGS) $(CLIENT) --outDir $(OUT)/
	ln -fs $(CURDIR)/node_modules $(OUT)/node_modules

# Make target to copy non-ts files
define exttarget
$(OUT)/client/%$(1): client/%$(1)
	mkdir -p $$(dir $$@) && cp $$< $$@
endef

$(foreach ext, $(shell find client -type f ! -name '*.ts' | egrep -o '\..*$$'), \
	$(eval $(call exttarget,$(ext))))

$(OUT)/package.json: package.json
	cp $< $@

$(OUT)/npm-shrinkwrap.json: package.json
	npm shrinkwrap 2>&1 | grep -v 'Excluding' && mv npm-shrinkwrap.json $(OUT)

#### Tasks
.PHONY: build deploy \
        setup  setup\:nm  setup\:tsd \
        update update\:nm update\:tsd \
        lint tree labels clean

build: $(OUT)/embed $(OUT)/client

deploy: build $(OUT)/package.json $(OUT)/npm-shrinkwrap.json
	cd $(OUT) && tar -cf ndrone-embed.tar $(shell ls $(OUT) | grep -vP 'client|node_modules')
	scp $(OUT)/ndrone-embed.tar '$(RTARGET):$(RPATH)/ndrone.tar'
	ssh $(RTARGET) 'cd $(RPATH) && tar -xvf ndrone.tar > /dev/null && rm ndrone.tar'
	rm $(OUT)/ndrone-embed.tar

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
	@tree -CFa --dirsfirst -I '.git|node_modules|definitions' | head -n -2

labels:
	@egrep -Hnor --include '*.ts' '//#(TODO|FIXME|XXX):.*' libs embed client shared |\
		awk -F'://#' '\
			/#FIXME:/ { print "\033[0;31m"$$2"\033[0m", "("$$1")" }\
			/#TODO:/  { print "\033[0;32m"$$2"\033[0m", "("$$1")" }\
			/#XXX:/   { print "\033[0;33m"$$2"\033[0m", "("$$1")" }\
		' | sort

clean:
	rm -rf $(OUT)/ 2> /dev/null

#### Misc
define \n


endef
