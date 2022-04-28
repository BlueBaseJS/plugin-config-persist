import { RegistryItem } from '@bluebase/core';

export function mergetConfigs(
	initialConfigs: RegistryItem<any>[],
	cacheConfigs: RegistryItem<any>[],
	dontResetOnUpdate: string[]
): RegistryItem<any>[] {
	const currentVersion = getVersion(initialConfigs);
	const cacheVersion = getVersion(cacheConfigs);

	if (currentVersion === cacheVersion) {
		return cacheConfigs;
	}

	const configs = [...initialConfigs];

	cacheConfigs.forEach((config) => {
		const index = configs.findIndex((c) => c.key === config.key);

		// If the config key is not in the dontResetOnUpdate, then we return
		// so the initial version is used instead of the cache version.
		if (!dontResetOnUpdate.includes(config.key) || config.key === 'version') {
			return;
		}

		if (index === -1) {
			configs.push(config);
		} else {
			configs[index] = config;
		}
	});

	return configs;
}

function getVersion(configs: RegistryItem<any>[] = []) {
	const version = configs.find((config) => config.key === 'version');

	if (!version) {
		return null;
	}

	return version.value;
}
