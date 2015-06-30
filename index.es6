import {Module} from "interstellar-core";
import interstellarSessions from 'interstellar-sessions';
import angularQR from './lib/angular-qr';

const mod = new Module('interstellar-wallet');
export default mod;

mod.use(interstellarSessions);
mod.use(angularQR);

mod.controllers = require.context("./controllers",   true);
mod.templates   = require.context("raw!./templates", true);

let addConfig = ConfigProvider => {
  ConfigProvider.addModuleConfig(mod.name, {
    server: 'https://wallet.stellar.org'
  });
};
addConfig.$inject = ['interstellar-core.ConfigProvider'];
mod.config(addConfig);

mod.define();

export * from "./errors";
