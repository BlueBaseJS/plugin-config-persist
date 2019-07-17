import { AsyncStorage } from 'react-native';
import { BlueBase } from '@bluebase/core';
import Plugin from '../index';

jest.mock('react-native/Libraries/Storage/AsyncStorage', () => ({
	getItem: jest.fn(),
	setItem: jest.fn(),
}));

test('Plugin should be correctly registered', async () => {
	const BB = new BlueBase();
	await BB.Plugins.register(Plugin);

	expect(BB.Plugins.has('@bluebase/plugin-config-persist')).toBeTruthy();
});

test('Plugin should load configs from AsyncStorage on boot', async () => {
	(AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify({ foo: 'bar', baz: false }));

	const BB = new BlueBase();
	await BB.Plugins.register(Plugin);
	await BB.boot();

	expect(BB.Configs.getValue('foo')).toBe('bar');
	expect(BB.Configs.getValue('baz')).toBe(false);
	expect(BB.Configs.size()).toBe(13);
});

test('Plugin should not load configs if AsyncStorage returns null', async () => {
	(AsyncStorage.getItem as any).mockResolvedValue(null);

	const BB = new BlueBase();
	await BB.Plugins.register(Plugin);
	await BB.boot();

	expect(BB.Configs.size()).toBe(11);
});
