import { BlueBase, BootOptions, createPlugin } from '@bluebase/core';

import AES from 'crypto-js/aes';
import { AsyncStorage } from 'react-native';
import { VERSION } from './version';

async function readConfigs(opts: {
	ENCRYPTION_ENABLE: boolean;
	ENCRYPTION_KEY: string | null;
	STORAGE_KEY: string;
}) {
	let configs = await AsyncStorage.getItem(opts.STORAGE_KEY);

	if (!configs) {
		return null;
	}

	if (configs && opts.ENCRYPTION_ENABLE && opts.ENCRYPTION_KEY) {
		configs = AES.decrypt(configs, opts.ENCRYPTION_KEY) as any;
	}

	return JSON.parse(configs || '');
}

export default createPlugin({
	description: 'Save BlueBase configs in persistant cache',
	key: '@bluebase/plugin-config-persist',
	name: 'BlueBase Config Persist',
	version: VERSION,

	defaultConfigs: {
		'plugin.config-persist.encryption.enable': false,
		'plugin.config-persist.encryption.key': null,
		'plugin.config-persist.key': 'bluebase.configs',
	},

	filters: {
		'bluebase.configs.register': async (bootOptions: BootOptions, _ctx: any, BB: BlueBase) => {
			const ENCRYPTION_ENABLE = BB.Configs.getValue('plugin.config-persist.encryption.enable');
			const ENCRYPTION_KEY = BB.Configs.getValue('plugin.config-persist.encryption.key');
			const STORAGE_KEY = BB.Configs.getValue('plugin.config-persist.key');

			const configs = await readConfigs({ ENCRYPTION_ENABLE, ENCRYPTION_KEY, STORAGE_KEY });
			await BB.Configs.registerCollection(JSON.parse(configs));

			async function saveConfigs(_bootOptions: BootOptions) {
				const configsObj = BB.Configs.filterValues(_x => true);
				const configStr = ENCRYPTION_ENABLE
					? AES.encrypt(configs, ENCRYPTION_KEY).toString()
					: JSON.stringify(configsObj);

				await AsyncStorage.setItem(STORAGE_KEY, configStr);
				return _bootOptions;
			}

			await saveConfigs(bootOptions);
			await BB.Filters.register({
				event: 'bluebase.configs.set',
				key: 'bluebase-configs-register-from-config-persist-plugin',
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
