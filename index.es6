import { Module } from "mcs-core";

export { LoginController } from "./controllers/login.controller.es6";

const mod = new Module('mcs-login');
export default mod;
mod.templates  = require.context("raw!./templates", true);
mod.directives = require.context("./directives", true);

let addConfig = ConfigProvider => {
  ConfigProvider.addModuleConfig(mod.name, {
    server: 'https://wallet.stellar.org'
  });
};
addConfig.$inject = ['mcs-core.ConfigProvider'];
mod.config(addConfig);

mod.define();

export * from "./errors";
