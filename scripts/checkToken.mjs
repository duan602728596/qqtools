import fs from 'node:fs/promises';
import path from 'path';
import { cwd } from './utils.mjs';

async function checkLoginHttpFile(NIMTestDir) {
  const loginHttpFile = path.join(NIMTestDir, 'http/login.http');
  const file = await fs.readFile(loginHttpFile, { encoding: 'utf8' });

  if (!(/"username": ""/.test(file) && /"password": ""/.test(file))) {
    throw new Error('有敏感信息。');
  }
}

async function checkCreateRoomIdFile(NIMTestDir) {
  const createRoomIdFile = path.join(NIMTestDir, 'node/createRoomId.js');
  const file = await fs.readFile(createRoomIdFile, { encoding: 'utf8' });

  if (!(/token = ''/.test(file) && /pa = ''/.test(file))) {
    throw new Error('有敏感信息。');
  }
}

async function checkToken() {
  const NIMTestDir = path.join(cwd, 'packages/NIMTest');

  await Promise.all([
    checkLoginHttpFile(NIMTestDir),
    checkCreateRoomIdFile(NIMTestDir)
  ]);
}

checkToken();