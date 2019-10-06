import { BlueBase, BootOptions, createPlugin } from '@bluebase/core';

import { AsyncStorage } from 'react-native';

export default createPlugin({
	description: 'Save BlueBase configs in persistant cache',
	key: '@bluebase/plugin-config-persist',
	name: 'BlueBase Config Persist',
	version: '1.0.0',

	defaultConfigs: {
		'plugin.config-persist.key': 'bluebase.configs',
	},

	filters: {
		'bluebase.configs.register': async (bootOptions: BootOptions, _ctx: any, BB: BlueBase) => {
			const STORAGE_KEY = BB.Configs.getValue('plugin.config-persist.key');
			const configs = await AsyncStorage.getItem(STORAGE_KEY);

			if (configs) {
				await BB.Configs.registerCollection(JSON.parse(configs));
			}

			async function saveConfigs(_bootOptions: BootOptions) {
				const configsObj = BB.Configs.filterValues(_x => true);
				await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(configsObj));
				return _bootOptions;
			}

			await saveConfigs(bootOptions);
			await BB.Filters.register({
				event: 'bluebase.configs.set',
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
