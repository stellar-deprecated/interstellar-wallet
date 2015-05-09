let StellarWallet = require('stellar-wallet-js-sdk');

require('../styles/form-widget.scss');

export class LoginController {
  constructor(config, sessions, $state, $scope) {
    this.config   = config;
    this.sessions = sessions;
    this.$state   = $state;
    this.$scope   = $scope;
    this.successfulLoginRoute = 'dashboard';

    if (this.sessions.hasDefault()) {
      this.$state.go(this.successfulLoginRoute);
    }
  }

  submit() {
    if (!this.username) {
      this.username = '';
    }

    let params = {
      server: 'http://localhost:3000/v2',
      username: this.username.toLowerCase(),
      password: this.password
    };

    return StellarWallet.getWallet(params)
      .then(wallet => this.onSuccessfulLogin.call(this, wallet))
      .catch(StellarWallet.errors.TotpCodeRequired, e => {
        this.totpRequired = true;
        this.onError("2-Factor-Authentication code is required to login.", e);
      })
      .catch(StellarWallet.errors.MissingField,
             StellarWallet.errors.WalletNotFound,
             StellarWallet.errors.Forbidden, e => {
        this.onError("Login credentials are incorrect.", e);
      })
      .catch(StellarWallet.errors.ConnectionError, e => {
        this.onError("Error connecting wallet server. Please try again later.", e);
      })
      .catch(e => {
        this.onError("Unknown error. Please try again later.", e);
        throw e;
      })
      .finally(() => {
        this.$scope.$apply();
      })
  };

  onSuccessfulLogin(wallet) {
    let mainData = JSON.parse(wallet.getMainData());
    let data = JSON.parse(wallet.getKeychainData());
    let secret = data.signingKeys.secret;
    data.username = mainData.username;
    let permanent = this.permanent;
    this.sessions.createDefault({secret, data, permanent});
    this.$state.go(this.successfulLoginRoute);
  }

  onError(userMessage, error) {
    this.error = userMessage;
  }
}
