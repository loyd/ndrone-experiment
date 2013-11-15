TSFLAGS = -m commonjs
OUT = build

TSC = ./node_modules/.bin/tsc
tmp = $(OUT)

all:
	@echo 'Use make <task>.'

build:
	$(TSC) $(TSFLAGS) src/ndrone.ts --outDir $(tmp)/out
	$(TSC) $(TSFLAGS) src/flight/flight.ts --outDir $(tmp)/out/flight
	$(TSC) $(TSFLAGS) src/fpv/fpv.ts --outDir $(tmp)/out/fpv
	cp config.json $(tmp)/config.json

package: tmp = /tmp/ndrone
package: build
	npm shrinkwrap && mv npm-shrinkwrap.json $(tmp)/
	@mkdir -p $(OUT)
	cd $(tmp) && tar -cf $(CURDIR)/$(OUT)/ndrone-`date +%s`.tar *

tree:
	@tree -CFa --dirsfirst -I '.git|node_modules|definitions' | head -n -2

labels:
	@egrep -Hnor --include '*.ts' '//#(TODO|FIXME|XXX):.*' src lib |\
		awk -F'://#' '\
			/#FIXME:/ { print "\033[0;31m"$$2"\033[0m", "("$$1")" }\
			/#TODO:/  { print "\033[0;32m"$$2"\033[0m", "("$$1")" }\
			/#XXX:/   { print "\033[0;33m"$$2"\033[0m", "("$$1")" }\
		' | sort

clean:
	rm -rf build
	rm -rf /tmp/ndrone
