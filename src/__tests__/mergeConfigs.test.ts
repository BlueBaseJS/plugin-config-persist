import { RegistryItem } from '@bluebase/core';

import { mergetConfigs } from '../mergeConfigs';

it('should return cachedConfigs where version is same', async () => {
	const initialConfigs: RegistryItem<any>[] = [
		{
			key: 'version',
			value: '3',
			source: { type: 'boot' },
		},
		{
			key: 'title',
			value: 'Hello',
			source: { type: 'boot' },
		},
		{
			key: 'foo',
			value: 15,
			source: { type: 'boot' },
		},
		{
			key: 'bar',
			value: 'baz',
			source: { type: 'boot' },
		},
	];

	const cacheConfigs: RegistryItem<any>[] = [
		{
			key: 'version',
			value: '3',
			source: { type: 'boot' },
		},
		{
			key: 'title',
			value: 'World',
			source: { type: 'boot' },
		},
		{
			key: 'foo',
			value: 10,
			source: { type: 'boot' },
		},
	];

	const result = mergetConfigs(initialConfigs, cacheConfigs, ['foo']);

	expect(result).toEqual(cacheConfigs);
});

it('should return initialConfigs where version is not same', async () => {
	const initialConfigs: RegistryItem<any>[] = [
		{
			key: 'version',
			value: '4',
			source: { type: 'boot' },
		},
		{
			key: 'title',
			value: 'Hello',
			source: { type: 'boot' },
		},
		{
			key: 'foo',
			value: 15,
			source: { type: 'boot' },
		},
		{
			key: 'bar',
			value: 'baz',
			source: { type: 'boot' },
		},
	];

	const cacheConfigs: RegistryItem<any>[] = [
		{
			key: 'version',
			value: '3',
			source: { type: 'boot' },
		},
		{
			key: 'title',
			value: 'World',
			source: { type: 'boot' },
		},
		{
			key: 'foo',
			value: 10,
			source: { type: 'boot' },
		},
	];

	const result = mergetConfigs(initialConfigs, cacheConfigs, []);

	expect(result).toEqual(initialConfigs);
});

it('should load foo from cache even if version has changed', async () => {
	const initialConfigs: RegistryItem<any>[] = [
		{
			key: 'version',
			value: '4',
			source: { type: 'boot' },
		},
		{
			key: 'title',
			value: 'Hello',
			source: { type: 'boot' },
		},
		{
			key: 'foo',
			value: 15,
			source: { type: 'boot' },
		},
		{
			key: 'bar',
			value: 'baz',
			source: { type: 'boot' },
		},
	];

	const cacheConfigs: RegistryItem<any>[] = [
		{
			key: 'version',
			value: '3',
			source: { type: 'boot' },
		},
		{
			key: 'title',
			value: 'World',
			source: { type: 'boot' },
		},
		{
			key: 'foo',
			value: 10,
			source: { type: 'boot' },
		},
	];

	const result = mergetConfigs(initialConfigs, cacheConfigs, ['foo']);

	expect(result).toEqual([
		{
			key: 'version',
			value: '4',
			source: { type: 'boot' },
		},
		{
			key: 'title',
			value: 'Hello',
			source: { type: 'boot' },
		},
		{
			key: 'foo',
			value: 10,
			source: { type: 'boot' },
		},
		{
			key: 'bar',
			value: 'baz',
			source: { type: 'boot' },
		},
	]);
});

it('should not load version even if it is added in the dontResetOnUpdate array', async () => {
	const initialConfigs: RegistryItem<any>[] = [
		{
			key: 'version',
			value: '4',
			source: { type: 'boot' },
		},
		{
			key: 'title',
			value: 'Hello',
			source: { type: 'boot' },
		},
		{
			key: 'foo',
			value: 15,
			source: { type: 'boot' },
		},
		{
			key: 'bar',
			value: 'baz',
			source: { type: 'boot' },
		},
	];

	const cacheConfigs: RegistryItem<any>[] = [
		{
			key: 'version',
			value: '3',
			source: { type: 'boot' },
		},
		{
			key: 'title',
			value: 'World',
			source: { type: 'boot' },
		},
		{
			key: 'foo',
			value: 10,
			source: { type: 'boot' },
		},
	];

	const result = mergetConfigs(initialConfigs, cacheConfigs, ['foo', 'version']);

	expect(result).toEqual([
		{
			key: 'version',
			value: '4',
			source: { type: 'boot' },
		},
		{
			key: 'title',
			value: 'Hello',
			source: { type: 'boot' },
		},
		{
			key: 'foo',
			value: 10,
			source: { type: 'boot' },
		},
		{
			key: 'bar',
			value: 'baz',
			source: { type: 'boot' },
		},
	]);
});
