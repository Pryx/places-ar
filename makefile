BUILD_FOLDER:=places-ar
VERSION_MAIN:=1.0.0

define get_build_date
	@ $(eval REV_COUNT="`git rev-list --count \`git describe --tags --abbrev=0\`..HEAD`")
	@ $(eval BUILD_DATE="`[ -n \"\`git status --porcelain\`\" ] && date +%Y%m%d || git log -1 --format=%cd --date=format:'%Y%m%d' `")
endef

define write_version
	@ sed -i "/define('PLACES_AR_VER/c\    define('PLACES_AR_VER', '${VERSION}');" $(BUILD_FOLDER)/index.php
endef

define clean
	rm -f $(BUILD_FOLDER)/composer.json
	rm -f $(BUILD_FOLDER)/composer.lock
	find $(BUILD_FOLDER)/js/. -type f -print0 | xargs --null grep -Z -L '.min.' | xargs --null rm
	rm -rf $(BUILD_FOLDER)/js/.build
endef

deploy:
	@ tput setaf 3
	@ tput smso
	@ echo " -- Deploying PlacesAR -- "
	@ tput rmso
	@ tput sgr0
	@ $(get_build_date)
	@ $(eval VERSION:="${VERSION_MAIN}-${REV_COUNT}-${BUILD_DATE}-`git log --pretty=format:'%h' -n 1`")
	@ tput setaf 2
	@ echo "ⓘ Version: ${VERSION}"
	@ tput sgr0
	@ echo "Setting up workspace"
	@ rm -rf $(BUILD_FOLDER)
	@ mkdir $(BUILD_FOLDER)
	@ echo "Building JS"
	@ npm config set loglevel warn
	@ npm run build
	@ cp -r src/* $(BUILD_FOLDER)
	@ echo "Removing unwanted files"
	@ $(clean)
	@ rm -rf $(BUILD_FOLDER)/docs
	@ $(write_version)
	@ php -f ./build_tools/deployment.phar plugin.deploy
	@ rm -rf $(BUILD_FOLDER)
	@ tput setaf 3
	@ tput smso
	@ echo " -- Deploy complete -- "
	@ tput rmso
	@ tput sgr0

deploy-ci:
	@ echo " -- Deploying PlacesAR -- "
	@ $(get_build_date)
	@ $(eval VERSION:="${VERSION_MAIN}-${REV_COUNT}-${BUILD_DATE}-`git log --pretty=format:'%h' -n 1`")
	@ echo "ⓘ Version: ${VERSION}"
	@ echo "Setting up workspace"
	@ rm -rf $(BUILD_FOLDER)
	@ mkdir $(BUILD_FOLDER)
	@ echo "Building JS"
	@ npm config set loglevel warn
	@ npm run build
	@ cp -r src/* $(BUILD_FOLDER)
	@ echo "Removing unwanted files"
	@ $(clean)
	@ $(write_version)
	@ sed -i 's|###replace###|'"${PLACES_AR_CREDENTIALS}"'|' ci.deploy
	@ php -f ./build_tools/deployment.phar ci.deploy
	@ rm -rf $(BUILD_FOLDER)
	@ echo " -- Deploy complete -- "

ci:
	@ $(get_build_date)
	@ $(eval VERSION:="${VERSION_MAIN}-${REV_COUNT}-${BUILD_DATE}-`git log --pretty=format:'%h' -n 1`")
	@ echo "⚠ This is an automatic build!"
	@ echo "ⓘ Version: ${VERSION}"
	@ echo " -- Build is starting. -- "
	@ echo "Setting up workspace"
	@ echo "Generating documentation"
	@ ./node_modules/.bin/esdoc
	@ rm -rf $(BUILD_FOLDER)
	@ mkdir $(BUILD_FOLDER)
	@ echo "Building JS"
	@ npm config set loglevel warn
	@ npm run build
	@ cp -r src/* $(BUILD_FOLDER)
	@ $(write_version)
	@ echo "Removing unwanted files"
	@ $(clean)
	@ echo "Cleaning up"
	@ rm -rf $(BUILD_FOLDER)/
	@ echo " -- Build is complete. -- "

doc:
	@ echo "=== Generating documentation === "
	@ ./node_modules/.bin/esdoc

test:
	@ npm run test

lint:
	@ echo " -- Lint is starting. -- "
	@ echo " == JS =="
	@ npm run build
	@ echo ""
	@ echo " == CSS =="
	@ ./node_modules/.bin/stylelint src/css/**/*.css

setup:
	@ echo "--- Installing NPM depedencies ---"
	@ npm install
	@ echo "--- NPM depedency installation complete ---"

lint-fix:
	@ echo " == JS =="
	@ ./node_modules/.bin/eslint src/js/ --fix --quiet
