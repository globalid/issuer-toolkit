# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- [Usage documentation](README.md#usage)
- Validation for function and method parameters.

### Changed

- Renamed package to `@globalid/issuer-toolkit`
- Renamed `payload` to `data` in the `CredentialRequest` interface
- Aligned JSDocs with usage documentation

### Fixed

- Corrected a couple typos in the JSDocs

### Removed

- `downloadFile` is now only a utility and no longer a method of `GidClient`

## [0.1.1] - 2022-01-04

### Fixed

- Generating version module (via [`genversion`](https://www.npmjs.com/package/genversion)) to correct published files

## [0.1.0] - 2021-12-23

### Added

- `GidClient` for working with issuer-specific operations in the GlobaliD API
- Testing utilities for [`nock`](https://www.npmjs.com/package/nock) and [`sinon`](https://sinonjs.org/)

[0.1.1]: https://gitlab.com/globalid/credentials-issuer/issuer-toolkit/-/compare/v0.1.0...v0.1.1
[0.1.0]: https://gitlab.com/globalid/credentials-issuer/issuer-toolkit/-/tags/v0.1.0
