const { RawSource } = require("webpack-sources");
const {
  getLicenseInformationForCompilation,
  getLicenseViolations,
  getSortedLicenseInformation,
  ignoreLicenses,
  overrideLicenses,
  writeLicenseInformation
} = require("./licenseUtils");
const { getOptions } = require("./optionsUtils");

class LicenseCheckerWebpackPlugin {
  constructor(options) {
    this.options = getOptions(options);
  }

  apply(compiler) {
    const {
      filter,
      allow,
      ignore,
      override,
      emitError,
      outputFilename,
      outputWriter
    } = this.options;

    compiler.plugin('emit', (compilation, callback) => {
      let licenseInformation = getLicenseInformationForCompilation(compilation, filter);
      licenseInformation = ignoreLicenses(licenseInformation, ignore);
      licenseInformation = overrideLicenses(licenseInformation, override);

      const licenseViolations = getLicenseViolations(licenseInformation, allow);
      if (emitError) {
        compilation.errors.push(...licenseViolations);
      } else {
        compilation.warnings.push(...licenseViolations);
      }

      const sortedLicenseInformation = getSortedLicenseInformation(licenseInformation);
      compilation.assets[outputFilename] = new RawSource(
        writeLicenseInformation(outputWriter, sortedLicenseInformation)
      );
      callback();
    });
  }
}

module.exports = LicenseCheckerWebpackPlugin;
