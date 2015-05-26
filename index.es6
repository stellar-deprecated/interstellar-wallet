import { Module } from "mcs-core";

export { LoginController } from "./controllers/login.controller.es6";

export const mod = new Module('mcs-login');
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
