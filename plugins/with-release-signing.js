// Injects a release signing config into the generated Android project.
//
// Credentials live outside the repo at ~/.capital-quiz/keystore.properties so
// `expo prebuild` can be run at any time without losing the signing setup.
// If the file is missing (e.g. on CI or another machine), release builds fall
// back to the debug keystore so development still works.
const { withAppBuildGradle } = require('@expo/config-plugins');

const DEBUG_CLOSE = `            keyPassword 'android'
        }
    }`;

const RELEASE_BLOCK = `            keyPassword 'android'
        }
        release {
            if (releaseKeystorePropsFile.exists()) {
                storeFile file(releaseKeystoreProps['storeFile'])
                storePassword releaseKeystoreProps['storePassword']
                keyAlias releaseKeystoreProps['keyAlias']
                keyPassword releaseKeystoreProps['keyPassword']
            }
        }
    }`;

const PROPS_BLOCK = `    // Release signing credentials live outside the repo; see ~/.capital-quiz/keystore.properties.
    def releaseKeystorePropsFile = new File(System.getProperty("user.home"), ".capital-quiz/keystore.properties")
    def releaseKeystoreProps = new Properties()
    if (releaseKeystorePropsFile.exists()) {
        releaseKeystorePropsFile.withInputStream { releaseKeystoreProps.load(it) }
    }
    signingConfigs {`;

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    if (!contents.includes('releaseKeystorePropsFile')) {
      if (!contents.includes('    signingConfigs {')) {
        throw new Error('with-release-signing: signingConfigs block not found');
      }
      contents = contents.replace('    signingConfigs {', PROPS_BLOCK);

      if (!contents.includes(DEBUG_CLOSE)) {
        throw new Error('with-release-signing: debug signing block not found');
      }
      contents = contents.replace(DEBUG_CLOSE, RELEASE_BLOCK);

      let replaced = 0;
      contents = contents.replace(/signingConfig signingConfigs\.debug/g, (match) => {
        replaced += 1;
        return replaced === 1
          ? match
          : 'signingConfig releaseKeystorePropsFile.exists() ? signingConfigs.release : signingConfigs.debug';
      });
      if (replaced !== 2) {
        throw new Error(`with-release-signing: expected 2 debug signingConfigs, found ${replaced}`);
      }
    }

    config.modResults.contents = contents;
    return config;
  });
};
