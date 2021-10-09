import fs from 'fs';
import path from 'path';
import pkgDir from 'pkg-dir';

import type { State } from './types';
import { getDisplays } from './utils/display';
import { acquireLock, releaseLock } from './utils/lock';

const stateFilePath = path.join(pkgDir.sync(__dirname)!, 'state.json');
const stateLockPath = path.join(pkgDir.sync(__dirname)!, 'state.json.lock');

const displays = getDisplays();
const defaultState: State = {};
for (const display of displays) {
	defaultState[display.id] = { numMasterWindows: 1 };
}

const defaultStateJson = JSON.stringify(defaultState);

async function acquireStateLock() {
	await acquireLock(stateLockPath);
}

async function releaseStateLock() {
	await releaseLock(stateLockPath);
}

export async function resetState() {
	await acquireStateLock();
	await fs.promises.writeFile(stateFilePath, defaultStateJson);
	await releaseStateLock();
}

export async function writeState(state: State) {
	await acquireStateLock();
	await fs.promises.writeFile(stateFilePath, JSON.stringify(state));
	await releaseStateLock();
}

export async function readState(): Promise<State> {
	await acquireStateLock();
	const data = (await fs.promises.readFile(stateFilePath)).toString();
	await releaseStateLock();

	return JSON.parse(data);
}
