BUILD_FOLDER:=places-ar
VERSION_MAIN:=1.0.0

define get_build_date
	@ $(eval REV_COUNT="`git rev-list --count \`git describe --tags --abbrev=0\`..HEAD`")
	@ $(eval BUILD_DATE="`[ -n \"\`git status --porcelain\`\" ] && date +%Y%m%d || git log -1 --format=%cd --date=format:'%Y%m%d' `")
endef

define write_version
	@ sed -i "/PLACES_AR_VER/c\    define('PLACES_AR_VER', '${VERSION}');" $(BUILD_FOLDER)/index.php
endef

define clean
	rm -f $(BUILD_FOLDER)/composer.json
	rm -f $(BUILD_FOLDER)/composer.lock
	bash -O extglob -c 'rm -rf $(BUILD_FOLDER)/js/!(vendor)/'
	rm -rf $(BUILD_FOLDER)/js/.build
endef

deploy:
	@ tput setaf 3
	@ tput smso
	@ echo " -- Deploying PlacesAR -- "
	@ tput rmso
	@ tput sgr0
	@ $(clean)
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
	@ php -f ./build_tools/deployment.phar plugin.deploy
	@ rm -rf $(BUILD_FOLDER)
	@ tput setaf 3
	@ tput smso
	@ echo " -- Deploy complete -- "
	@ tput rmso
	@ tput sgr0

ci:
	@ $(get_build_date)
	@ $(eval VERSION:="${VERSION_MAIN}-${REV_COUNT}-${BUILD_DATE}-`git log --pretty=format:'%h' -n 1`")
	@ echo "⚠ This is an automatic build!"
	@ echo "ⓘ Version: ${VERSION}"
	@ echo " -- Build is starting. -- "
	@ echo "Setting up workspace"
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
	@ echo "=== TODO === "

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