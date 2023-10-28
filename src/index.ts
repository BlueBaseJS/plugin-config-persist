import { BlueBase, BootOptions, ConfigResisteryItem, createPlugin } from '@bluebase/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import AES from 'crypto-js/aes';

import { VERSION } from './version';

async function readConfigs(opts: {
	ENCRYPTION_ENABLE: boolean;
	ENCRYPTION_KEY: string | null;
	STORAGE_KEY: string;
}) {
	try {
		let configs = await AsyncStorage.getItem(opts.STORAGE_KEY);

		if (!configs) {
			return [];
		}

		if (opts.ENCRYPTION_ENABLE && opts.ENCRYPTION_KEY) {
			const bytes = AES.decrypt(configs, opts.ENCRYPTION_KEY) as any;
			configs = bytes.toString(CryptoJS.enc.Utf8);
		}

		return JSON.parse(configs || '[]');
	} catch (error) {
		return [];
	}
}

export default createPlugin({
	description: 'Save BlueBase configs in persistant cache',
	key: '@bluebase/plugin-config-persist',
	name: 'plugin-config-persist',
	version: VERSION,

	defaultConfigs: {
		'plugin.config-persist.encryptionEnable': false,
		'plugin.config-persist.encryptionKey': null,
		'plugin.config-persist.key': 'bluebase-config',
	},

	filters: {
		'bluebase.configs.register': async (bootOptions: BootOptions, _ctx: any, BB: BlueBase) => {
			const ENCRYPTION_ENABLE = BB.Configs.getValue('plugin.config-persist.encryptionEnable');
			const ENCRYPTION_KEY =
				process.env.BB_CONFIGS_ENCRYPTION_KEY ||
				BB.Configs.getValue('plugin.config-persist.encryptionKey');

			const STORAGE_KEY = BB.Configs.getValue('plugin.config-persist.key');

			const cachedConfigs: ConfigResisteryItem[] = await readConfigs({
				ENCRYPTION_ENABLE,
				ENCRYPTION_KEY,
				STORAGE_KEY
			});

			const mutatedConfigs = cachedConfigs.filter(c => c.mutated);

			await BB.Configs.registerCollection(mutatedConfigs);

			async function saveConfigs(_bootOptions: BootOptions) {
				const configsObj = Array.from(BB.Configs.values()).filter((c) => c.mutated);
				const configStr = ENCRYPTION_ENABLE
					? AES.encrypt(JSON.stringify(configsObj), ENCRYPTION_KEY).toString()
					: JSON.stringify(configsObj);

				await AsyncStorage.setItem(STORAGE_KEY, configStr);
				return _bootOptions;
			}

			await saveConfigs(bootOptions);
			await BB.Filters.register({
				event: 'bluebase.configs.set',
				key: 'plugin-config-persist',
				value: saveConfigs,
			});

			return bootOptions;
		},

		'bluebase.reset': async (cache: any, _ctx: any, BB: BlueBase) => {
			const STORAGE_KEY = BB.Configs.getValue('plugin.config-persist.key');
			await AsyncStorage.removeItem(STORAGE_KEY);
			return cache;
		},
	},
});
