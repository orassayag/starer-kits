const fs = require('fs-extra');
const path = require('path');
const createMongoFromJSONFilesScript = require('./createMongoFromJSONFiles.script');

class LoadJSONFilesScript {

	constructor() {
		this.distPath = './src/dist/';
		this.moviesList = [];
		this.lastId = 0;
	}

	async run() {
		// Initiate.
		this.setProcess();
		// Load all JSON files into the memory.
		await this.loadJSONFiles();
	}

	async loadJSONFiles() {
		this.logStatus('Start load JSON files.');
		let files = await fs.readdir(this.distPath);
		files = files.filter(file => {
			return this.isTypeFile({ fileName: file, fileExtension: 'json' });
		});
		for (let i = 0, length = files.length; i < length; i++) {
			const jsonMovie = await fs.readFile(`${this.distPath}${files[i]}`, 'utf-8');
			const movie = JSON.parse(jsonMovie);
			this.moviesList.push(movie);
			const movieId = parseInt(movie.id);
			if (this.lastId < movieId) {
				this.lastId = movieId;
			}
		}
		this.logStatus('Finish load JSON files.');
		createMongoFromJSONFilesScript.run(this.moviesList);
	}

	setProcess() {
		process.on('uncaughtException', (error) => {
			console.log(error);
		});
		process.on('unhandledRejection', (reason, promise) => {
			console.log(reason);
			console.log(promise);
		});
	}

	logStatus(text) {
		console.log(`===${text}===`);
	}

	isTypeFile(data) {
		const { fileName, fileExtension } = data;
		const extension = path.extname(fileName);
		if (!extension) {
			throw new Error(`Extension not received: ${extension} (1000034)`);
		}
		return extension.toLowerCase() === `.${fileExtension.toLowerCase()}`;
	}
}

module.exports = new LoadJSONFilesScript();