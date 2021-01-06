import { BlueBase, BootOptions, createPlugin } from '@bluebase/core';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default createPlugin({
	description: 'Save BlueBase configs in persistant cache',
	key: '@bluebase/plugin-config-persist',
	name: 'BlueBase Config Persist',
	version: '1.0.0',

	defaultConfigs: {
		'plugin.config-persist.key': 'bluebase.configs',
	},

	filters: {
		'bluebase.configs.register': [
			{
				key: 'bluebase-configs-persist-register',
				priority: 10,
				value: async (bootOptions: BootOptions, _ctx: any, BB: BlueBase) => {

					// Fetch plugin configs
					const VERSION = BB.Configs.getValue('version');
					const STORAGE_KEY = BB.Configs.getValue('plugin.config-persist.key');

					// Load previous configs from cache
					const configs: any = await AsyncStorage.getItem(STORAGE_KEY);

					// If there are configs in the cache, then load them in the app
					if (configs) {
						let Configs = JSON.parse(configs);
						const CACHE_VERSION = Configs['version'];

						if (VERSION !== CACHE_VERSION) {
							Configs = await BB.Filters.run('plugin.config-persist.migration', Configs, { previousVersion: CACHE_VERSION, version: VERSION });
						}

						await BB.Configs.registerCollection(Configs);
					}

					async function saveConfigs(_bootOptions: BootOptions) {
						const configsObj = BB.Configs.filterValues(_x => true);
						await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(configsObj));
						return _bootOptions;
					}

					await saveConfigs(bootOptions);


					// Whenever a config is set in the application,
					// save it to the cache
					await BB.Filters.register({
						event: 'bluebase.configs.set',
						key: 'bluebase-configs-register-from-config-persist-plugin',
						value: saveConfigs,
					});

					// Upgrade version in cache, when an app is upgraded
					await BB.Filters.register({
						event: 'plugin.config-persist.migration',
						key: 'bluebase-configs-upgrade-version-on-migration',
						value: (Configs: any) => {
							return { ...Configs, version: VERSION }
						},
					});

					return bootOptions;
				},
			},
		],

		'bluebase.reset': [
			{
				key: 'bluebase-configs-persist-reset',
				priority: 2,
				value: async (cache: any, _ctx: any, BB: BlueBase) => {
					const STORAGE_KEY = BB.Configs.getValue('plugin.config-persist.key');
					await AsyncStorage.removeItem(STORAGE_KEY);
					return cache;
				},
			},
		],
	},
});
