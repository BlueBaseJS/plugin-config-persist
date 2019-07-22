import { BlueBase, BootOptions, createPlugin } from '@bluebase/core';

import { AsyncStorage } from 'react-native';

const STORAGE_KEY = 'bluebase.configs';

async function saveConfigs(_bootOptions: BootOptions, _ctx: any, BB: BlueBase) {
	const configs = BB.Configs.filterValues(_x => true);
	await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

export default createPlugin({
	description: 'Save BlueBase configs in persistant cache',
	key: '@bluebase/plugin-config-persist',
	name: 'BlueBase Config Persist',
	version: '1.0.0',

	defaultConfigs: {
		'plugin.config-persist.configs': {},
	},

	filters: {
		'bluebase.configs.register': async (bootOptions: BootOptions, ctx: any, BB: BlueBase) => {
			const configs = await AsyncStorage.getItem(STORAGE_KEY);

			if (configs) {
				await BB.Configs.registerCollection(JSON.parse(configs));
			}

			await saveConfigs(bootOptions, ctx, BB);
			await BB.Filters.register('bluebase.configs.set', saveConfigs);

			return bootOptions;
		},

		'bluebase.reset': async (cache: any, _ctx: any, _BB: BlueBase) => {
			await AsyncStorage.removeItem(STORAGE_KEY);
			return cache;
		},
	},
});
