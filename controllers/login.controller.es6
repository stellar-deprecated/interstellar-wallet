let StellarWallet = require('stellar-wallet-js-sdk');

export class LoginController {
  constructor(config, sessions, state) {
    this.config   = config;
    this.sessions = sessions;
    this.state    = state;

    if (this.sessions.hasDefault()) {
      this.state.go("dashboard");
    }
  }

  submit() {
    let params = {
      server: 'http://localhost:3000/v2',
      username: this.username.toLowerCase(),
      password: this.password
    };

    return StellarWallet.getWallet(params)
      .then(this.onSuccessfulLogin)
      .catch(StellarWallet.errors.TotpCodeRequired, e => {
        this.totpRequired = true;
        this.onError("2-Factor-Authentication code is required to login.", e);
      })
      .catch(StellarWallet.errors.WalletNotFound,
             StellarWallet.errors.Forbidden, e => {
        this.onError("Login credentials are incorrect.", e);
      })
      .catch(StellarWallet.errors.ConnectionError, e => {
        this.onError("Error connecting wallet server. Please try again later.", e);
      })
      .catch(e => {
        // TODO logging
        this.onError("Unknown error. Please try again later.", e);
      });
  };

  onSuccessfulLogin(wallet) {
    let keychainData = JSON.parse(wallet.getKeychainData());
    let secret = keychainData.signingKeys.secret;
    this.sessions.createDefault({secret});
    // It would be great to be able to configure every module
    // and set params like this (ex. `successfulLoginRoute`):
    // this.state.go(config.get("mcs-login/successfulLoginRoute"));
  }

  onError(userMessage, error) {
    this.error = userMessage;
  }
}
