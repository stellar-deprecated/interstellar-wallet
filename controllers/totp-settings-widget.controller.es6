import {Inject, Widget} from 'interstellar-core';
import StellarWallet from 'stellar-wallet-js-sdk';

@Widget('totpSettings', 'TotpSettingsWidgetController', 'interstellar-wallet/totp-settings-widget')
@Inject('$scope', '$http', 'interstellar-core.Config', 'interstellar-sessions.Sessions')
export default class TotpSettingsWidgetController {
  constructor($scope, $http, Config, Sessions) {
    if (!Sessions.hasDefault()) {
      console.error('No session. This widget should be used with active session.');
      return;
    }

    this.$scope = $scope;
    this.server = Config.get('modules.interstellar-wallet.server');
    this.session = Sessions.default;
    this.loaded = false;
    this.username = this.session.username.toLowerCase();
    $http.post(`${this.server}/v2/wallets/show_login_params`, {
      username: this.username+'@stellar.org'
    }).success(response => {
      this.totpEnabled = response.totpRequired;
      this.loaded = true;
    });
  }

  reset($event) {
    if ($event) {
      $event.preventDefault();
    }
    this.error = null;
    this.enabling = false;
    this.code = null;
    this.password = null;
    this.disabling = false;
  }


  enableTotp() {
    if (this.totpEnabled) {
      return;
    }
    this.enabling = true;
    this.rawKey = StellarWallet.util.generateRandomTotpKey();
    // Partition string into 4 chars segments
    this.key = this.rawKey.match(/.{4}/g).join(' ');
    this.uri = StellarWallet.util.generateTotpUri(this.rawKey, {
      issuer: 'Stellar Development Foundation',
      accountName: this.username
    });
  }

  confirmEnableTotp($event) {
    $event.preventDefault();
    this.error = null;

    var params = {
      server:`${this.server}/v2`,
      username: `${this.username}@stellar.org`,
      password: this.password,
      totpCode: this.code
    };

    StellarWallet.getWallet(params).then(wallet => {
      let keyPair = StellarWallet.util.generateKeyPair(this.session.getSecret());
      return wallet.enableTotp({
        totpKey: this.rawKey,
        totpCode: this.code,
        secretKey: keyPair.secretKey
      });
    })
    .then(() => {
      this.totpEnabled = true;
      this.reset();
    })
    .catch(StellarWallet.errors.WalletNotFound,
      StellarWallet.errors.Forbidden,
      StellarWallet.errors.TotpCodeRequired,
      StellarWallet.errors.InvalidTotpCode,
      StellarWallet.errors.MissingField, () => {
        this.error = "Password or TOTP code incorrect.";
      }).catch(StellarWallet.errors.ConnectionError, () => {
        this.error = 'Connection error. Please try again.';
      }).catch(e => {
        this.error = 'Unknown error. Please try again.';
      }).finally(() => {
        this.$scope.$apply();
      });
  }

  disableTotp() {
    if (!this.totpEnabled) {
      return;
    }
    this.disabling = true;
  }

  confirmDisableTotp($event) {
    $event.preventDefault();
    this.error = null;

    var params = {
      server:`${this.server}/v2`,
      username: `${this.username}@stellar.org`,
      password: this.password,
      totpCode: this.code
    };

    StellarWallet.getWallet(params).then(wallet => {
      let keyPair = StellarWallet.util.generateKeyPair(this.session.getSecret());
      return wallet.disableTotp({
        totpCode: this.code,
        secretKey: keyPair.secretKey
      });
    })
    .then(() => {
      this.totpEnabled = false;
      this.reset();
    })
    .catch(StellarWallet.errors.WalletNotFound,
      StellarWallet.errors.Forbidden,
      StellarWallet.errors.TotpCodeRequired,
      StellarWallet.errors.InvalidTotpCode,
      StellarWallet.errors.MissingField, () => {
        this.error = "Password or TOTP code incorrect.";
      }).catch(StellarWallet.errors.ConnectionError, () => {
        this.error = 'Connection error. Please try again.';
      }).catch(e => {
        this.error = 'Unknown error. Please try again.';
      }).finally(() => {
        this.$scope.$apply();
      });
  }
}
