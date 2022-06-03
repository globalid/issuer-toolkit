# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- `contextUri` and `schemauri` were made optional in `common.ts` and `epam.ts`

## [0.3.0] - 2022-05-11

### Fixed

- Corrected docs around credential request validation

### Changed

- `GidClient` was renamed to `GidIssuerClient`.
- `GidIssuerClient` is instatiated with the `createGidIssuerClient` function.

## [0.2.1] - 2022-03-16

### Changed

- Updated the default SSI URL's subdomain from `ssi` to `credentials`
- Generated encryption key for files is no longer encrypted

### Fixed

- Corrected signature validation algorithm ([IDENTPD-757](https://global-id.atlassian.net/browse/IDENTPD-757))
- File uploads to S3 now include required `Content-Length` header

## [0.2.0] - 2022-01-25

### Added

- [Usage documentation](README.md#usage)
- Validation for function and method parameters.

### Changed

- Renamed package to `@globalid/issuer-toolkit`
- Renamed `payload` to `data` in the `CredentialRequest` interface
- File names must have the format `{UUID}.{name}.{extension}`.
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

[unreleased]: https://github.com/globalid/issuer-toolkit/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/globalid/issuer-toolkit/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/globalid/issuer-toolkit/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/globalid/issuer-toolkit/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/globalid/issuer-toolkit/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/globalid/issuer-toolkit/releases/tag/v0.1.0
