import StellarWallet from 'stellar-wallet-js-sdk';
import {Keypair} from 'stellar-base';
import {Inject, Intent, Widget} from 'interstellar-core';

require('../styles/form-widget.scss');

@Widget('form', 'LoginController', 'interstellar-wallet/form-widget')
@Inject("interstellar-core.Config", "interstellar-core.IntentBroadcast", "interstellar-sessions.Sessions", "$http", "$scope")
export default class LoginController {
  constructor(Config, IntentBroadcast, Sessions, $http, $scope) {
    this.IntentBroadcast = IntentBroadcast;
    this.Sessions = Sessions;
    this.$http = $http;
    this.$scope = $scope;
    this.server = Config.get('modules.interstellar-wallet.server');

    this.submitting = false;

    if (this.Sessions.hasDefault()) {
      this.broadcastShowDashboardIntent();
    }
  }

  broadcastShowDashboardIntent() {
    this.IntentBroadcast.sendBroadcast(
      new Intent(
        Intent.TYPES.SHOW_DASHBOARD
      )
    );
  }

  submit() {
    this.error = null;
    this.submitting = true;

    if (!this.username) {
      this.username = '';
    }

    if (!this.password) {
      this.password = '';
    }

    let params = {
      server: `${this.server}/v2`,
      username: this.username.toLowerCase()+'@stellar.org',
      password: this.password
    };

    if (this.totpRequired) {
      params.totpCode = this.totpCode;
    }

    let success = false;
    return StellarWallet.getWallet(params)
      .then(wallet => {
        success = true;
        return this.onSuccessfulLogin.call(this, wallet)
      })
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
        if (!success) {
          this.submitting = false;
        }
        this.$scope.$apply();
      })
  };

  onChangeUsername() {
    if (!this.username) {
      return;
    }

    this.$http.post(`${this.server}/v2/wallets/show_login_params`, {
        username: this.username.toLowerCase()+'@stellar.org'
      }).success(response => {
        this.totpRequired = response.totpRequired;
      }).error((body, status) => {
        switch(status) {
          case 404:
            this.totpRequired = false;
            break;
          case 0:
            this.onError('Unable to contact the server.');
            break;
          default:
            this.onError('An error occurred.');
        }
      });
  }

  onSuccessfulLogin(wallet) {
    let mainData = JSON.parse(wallet.getMainData());
    let data = JSON.parse(wallet.getKeychainData());
    let keypair = Keypair.fromBase58Seed(data.signingKeys.secret);
    let address = keypair.address();
    let secret  = keypair.seed();

    let username = mainData.username;
    let permanent = this.permanent;
    this.Sessions.createDefault({username, address, secret, data, permanent})
      .then(() => {
        this.broadcastShowDashboardIntent();
      })
  }

  onError(userMessage, error) {
    this.error = userMessage;
  }
}
