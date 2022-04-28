import { BlueBase } from '@bluebase/core';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Plugin from '../index';

test('Plugin should be correctly registered', async () => {
	const BB = new BlueBase();
	await BB.Plugins.register(Plugin);

	expect(BB.Plugins.has('@bluebase/plugin-config-persist')).toBeTruthy();
});

test('Plugin should load configs from AsyncStorage on boot', async () => {
	(AsyncStorage.getItem as any).mockResolvedValue(
		JSON.stringify([
			{ key: 'foo', value: 'bar' },
			{ key: 'bar', value: false },
		])
	);

	const BB = new BlueBase();
	await BB.Plugins.register(Plugin);
	await BB.boot();

	expect(BB.Configs.getValue('foo')).toBe('bar');
	expect(BB.Configs.getValue('bar')).toBe(false);
	expect(BB.Configs.size()).toBe(16);
});

test('Plugin should not load configs if AsyncStorage returns null', async () => {
	(AsyncStorage.getItem as any).mockResolvedValue(null);

	const BB = new BlueBase();
	await BB.Plugins.register(Plugin);
	await BB.boot();

	expect(BB.Configs.size()).toBe(14);
});

test('Plugin should not load configs if AsyncStorage returns null', async () => {
	(AsyncStorage.getItem as any).mockResolvedValue(null);
	(AsyncStorage.removeItem as any).mockResolvedValue(null);

	const BB = new BlueBase();
	await BB.Plugins.register(Plugin);
	await BB.boot();

	expect(BB.Configs.size()).toBe(14);
	expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(0);

	await BB.reset();
	expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(1);
});
