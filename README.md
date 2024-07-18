[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://makeapullrequest.com)

# NestJS REST API Template

This repo is a template to create a REST API using [NestJS](https://nestjs.com) for everyday use.

## Features
- [x] Database: [PostgreSQL](https://www.postgresql.org/) with [TypeORM](https://typeorm.io/)
- [x] Authentication & Authorization: [Passport](https://www.passportjs.org/), [Twilio](https://www.twilio.com/), and [JWT](https://jwt.io/)
  + *OTP is used for authentication instead of the usual email and password. The OTP will be sent as SMS to the user's
    registered phone number, hence the use of Twilio API.*
- [x] Logging: [Pino](https://github.com/pinojs/pino)
- [x] Linter: [ESLint](https://eslint.org/) using [Airbnb code style](https://github.com/iamturns/eslint-config-airbnb-typescript) & [Prettier](https://prettier.io/)
- [x] Testing: [Jest](https://jestjs.io/)
- [x] Documentation: [Compodoc](https://compodoc.app/) and [Swagger](https://swagger.io/)

## License

[MIT](LICENSE)
