const WebSocket = require('ws');
const localStorage = require('localStorage');
const sessionStorage = require('sessionstorage');

globalThis.localStorage = localStorage;
globalThis.sessionStorage = sessionStorage;
globalThis.WebSocket = WebSocket;

globalThis.window = globalThis.self = globalThis;