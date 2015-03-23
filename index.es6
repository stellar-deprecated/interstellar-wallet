import { Module } from "mcs-core";

export { LoginController } from "./controllers/login.controller.es6";

export const mod = new Module('mcs-login');
mod.templates    = require.context("raw!./templates", true);
mod.define();

export * from "./errors";
