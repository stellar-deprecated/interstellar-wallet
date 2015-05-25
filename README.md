`mcs-stellar-wallet`
=============

The `mcs-stellar-wallet` is part of the Modular Client System.

> Quick start to developing in the MCS eco-system:
>
> * Install [`mcs-workspace`](https://github.com/stellar/mcs-workspace).
> * Read the technical overview of the system.
> * Contribute to our open-source modules or develop your own.

The `mcs-stellar-wallet` module provides controllers and widgets responsible for login using [`stellar-wallet`](https://github.com/stellar/stellar-wallet) server.

## Module contents

#### Classes
* [`LoginController`](#logincontroller-class)

#### Services
None.

#### Widgets
* [`<mcs-stellar-wallet-login-form>`](#mcs-stellar-wallet-login-form-widget)

## `LoginController` class

`LoginController` is extendable class that supports login to [`stellar-wallet`](https://github.com/stellar/stellar-wallet) server. Default implementation creates default `Session` using [`mcs-session`](https://github.com/stellar/mcs-session) and sends `SHOW_DASHBOARD` [Intent](https://github.com/stellar/mcs-core#intent-class) after successful login, however a developer can extend `onSuccessfulLogin(wallet)` (`wallet` is stellar-wallet-js-sdk [`Wallet`](https://github.com/stellar/stellar-wallet-js-sdk#wallet-object) object) method with custom implementation.

## `<mcs-stellar-wallet-login-form>` widget

TODO - screenshot

This widget displays login form.