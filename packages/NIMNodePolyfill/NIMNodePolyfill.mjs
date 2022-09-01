import { WebSocket } from 'ws';
import localStorage from 'localStorage';
import sessionStorage from 'sessionstorage';

globalThis.localStorage = localStorage;
globalThis.sessionStorage = sessionStorage;
globalThis.WebSocket = WebSocket;

globalThis.window = globalThis.self = globalThis;