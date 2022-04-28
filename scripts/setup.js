require('colors');

const replace = require('replace-in-file');
const readline = require('readline');
const fs = require('fs');

try {
	fs.renameSync('._github', '.github');
} catch (err) {
	// ignore
}

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

async function input(prompt) {
	console.log(prompt);
	return (await rl[Symbol.asyncIterator]().next()).value;
}

async function main() {
	console.log('Welcome to BlueBase plugin boilerplate!'.underline.bold.green);
	console.log('Please answer the following questions to complete the setup:'.blue);

	let name = await input('Name: (Example: "My App") ');

	if (!name) {
		name = 'BlueBase Boilerplate';
	}

	let slug = await input('Slug: (Example: "my-app") ');

	if (!slug) {
		slug = 'plugin-boilerplate';
	}

	let description = await input('Description: ');

	if (!description) {
		description = '🍛 A boilerplate to create BlueBase plugins or apps';
	}

	let githubOrg = await input('GitHub User or Organization: (Example: "BlueBaseJS") ');

	if (!githubOrg) {
		githubOrg = 'BlueBaseJS';
	}

	let githubRepo = await input('GitHub Repo: ');

	if (!githubRepo) {
		githubRepo = 'plugin-boilerplate';
	}

	try {
		// name
		replace.sync({
			files: ['app.config.js', './src/index.ts'],
			from: /["']?name["']?: (["'])(?:(?=(\\?))\2.)*?\1/g,
			to: `name: '${name}'`,
		});
		replace.sync({
			files: ['README.md'],
			from: '<%= PROJECT_TITLE %>',
			to: name,
		});

		// slug
		replace.sync({
			files: ['app.config.js'],
			from: /["']?slug["']?: (["'])(?:(?=(\\?))\2.)*?\1/g,
			to: `slug: '${slug}'`,
		});
		replace.sync({
			files: ['./src/index.ts'],
			from: /["']?key["']?: (["'])(?:(?=(\\?))\2.)*?\1/g,
			to: `key: '${slug}'`,
		});
		replace.sync({
			files: ['package.json'],
			from: /["']?name["']?: (["'])(?:(?=(\\?))\2.)*?\1/g,
			to: `"name": "${slug}"`,
		});

		// description
		replace.sync({
			files: ['app.config.js', './src/index.ts'],
			from: /["']?description["']?: (["'])(?:(?=(\\?))\2.)*?\1/g,
			to: `description: '${description}'`,
		});
		replace.sync({
			files: ['package.json'],
			from: /["']?description["']?: (["'])(?:(?=(\\?))\2.)*?\1/g,
			to: `"description": "${description}"`,
		});
		replace.sync({
			files: ['README.md'],
			from: '<%= PROJECT_DESCRIPTION %>',
			to: description,
		});

		// repository
		replace.sync({
			files: ['app.config.js'],
			from: /["']?githubUrl["']?: (["'])(?:(?=(\\?))\2.)*?\1/g,
			to: `githubUrl: 'https://github.com/${githubOrg}/${githubRepo}'`,
		});
		replace.sync({
			files: ['package.json'],
			from: /["']?repository["']?: (["'])(?:(?=(\\?))\2.)*?\1/g,
			to: `"repository": "github:${githubOrg}/${githubRepo}"`,
		});
		replace.sync({
			files: ['README.md'],
			from: '<%= GIT_ORG %>',
			to: githubOrg,
		});
		replace.sync({
			files: ['README.md'],
			from: '<%= GIT_REPO %>',
			to: githubRepo,
		});
	}
	catch (error) {
		console.error('Error occurred:', error);
	}

	rl.close();
}

main();
