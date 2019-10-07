import { AsyncStorage } from 'react-native';
import { BlueBase } from '@bluebase/core';
import Plugin from '../index';

test('Plugin should be correctly registered', async () => {
	jest.mock('react-native/Libraries/Storage/AsyncStorage', () => ({
		getItem: jest.fn(),
		removeItem: jest.fn(),
		setItem: jest.fn(),
	}));

	const BB = new BlueBase();
	await BB.Plugins.register(Plugin);

	expect(BB.Plugins.has('@bluebase/plugin-config-persist')).toBeTruthy();
});

test('Plugin should load configs from AsyncStorage on boot', async () => {
	jest.mock('react-native/Libraries/Storage/AsyncStorage', () => ({
		getItem: jest.fn(),
		removeItem: jest.fn(),
		setItem: jest.fn(),
	}));

	(AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify({ foo: 'bar', baz: false }));

	const BB = new BlueBase();
	await BB.Plugins.register(Plugin);
	await BB.boot();

	expect(BB.Configs.getValue('foo')).toBe('bar');
	expect(BB.Configs.getValue('baz')).toBe(false);
	expect(BB.Configs.size()).toBe(16);
});

test('Plugin should not load configs if AsyncStorage returns null', async () => {
	jest.mock('react-native/Libraries/Storage/AsyncStorage', () => ({
		getItem: jest.fn(),
		removeItem: jest.fn(),
		setItem: jest.fn(),
	}));

	(AsyncStorage.getItem as any).mockResolvedValue(null);

	const BB = new BlueBase();
	await BB.Plugins.register(Plugin);
	await BB.boot();

	expect(BB.Configs.size()).toBe(14);
});

test('Plugin should not load configs if AsyncStorage returns null', async () => {
	jest.mock('react-native/Libraries/Storage/AsyncStorage', () => ({
		getItem: jest.fn(),
		removeItem: jest.fn(),
		setItem: jest.fn(),
	}));

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

test('Plugin should encrypt configs', async () => {
	jest.mock('react-native/Libraries/Storage/AsyncStorage', () => ({
		getItem: jest.fn(),
		removeItem: jest.fn(),
		setItem: jest.fn(),
	}));

	const BB = new BlueBase();
	await BB.Plugins.register(Plugin);
	await BB.boot({
		configs: {
			'plugin.config-persist.encryption.enable': true,
			'plugin.config-persist.encryption.key': '123',
		},
	});

	expect(AsyncStorage.setItem).toBeCalledWith(
		// tslint:disable-next-line: max-line-length
		'U2FsdGVkX18xfRB5qZHfWdOgnGq5lFbCWbs0/kCRljRYdHOKwI5DQjXBTfMYYjV4qWgqfTcsXF+Nr5A1y++8JUDa044LyxeLG3rNIV5AyURGHwpb4VoySGDCg7qiuzxNE8qtPO6aOgIFKi7/MCKvAaPNORdw/bOmmZ0VYPqpugndHOViRxsqyxC/GekCjlWW6nbsBT++CXwiiW8D9uudMCLaFgvk4gwU6oUE8xcHyB+PjZfOjXSmkjPZEGkOEr4RwNaVk9n3Nbxl4Is6tem8iDUkHPiL4R2jRsnDcL46YX+OUdtRbjMibbprFS1DxAmZu4MkRzdMJ85oXBTYAUi1BrMhq9V2jcFbBqngotWlXpV5vqrmkKANTTqjFjArfhEYOV++vPtYG+ySgUVGc8Ujt/5tN0eXBxxMcxv8A+PnhCxzZrJ7QVODdQjAhloFqUX3OB9LvnHXP4OIp7OY3Zy4r4wF8dySXp5aRcPzxCsvUQE5V2L0+TA0WakJRPw1J3YhIIWP21Kgg2OT2q4AEqP+164qI6LpDOu533Vkp/I9663x8V0zW7HPz/5YHEFMeG/1'
	);
	expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
});
