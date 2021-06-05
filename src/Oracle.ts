import path from 'path';
import findRoot from 'find-root';
import parseAuthor from 'parse-author';
import {FaviconOptions} from 'favicons';

interface PackageJson
{
	name?: string;

	description?: string;

	author?: AuthorObject | string;

	maintainers?: Array<AuthorObject | string>;

	version?: string;
}

interface AuthorObject
{
	name: string;

	email?: string;

	url?: string;
}

export class Oracle
{
	protected packageJson: PackageJson;

	constructor (startingPath: string)
	{
		try {
			this.packageJson = require(path.join(findRoot(startingPath), 'package.json'));
		} catch (_) {
			this.packageJson = {};
		}
	}

	get appName (): string | undefined
	{
		return this.packageJson.name;
	}

	get appDescription (): string | undefined
	{
		return this.packageJson.description;
	}

	get version (): string | undefined
	{
		return this.packageJson.version;
	}

	get developer (): parseAuthor.Author | undefined
	{
		if(this.packageJson.author)
			return Oracle.parseAuthor(this.packageJson.author);

		if(Array.isArray(this.packageJson.maintainers) && this.packageJson.maintainers.length > 0) {
			const maintainer = this.packageJson.maintainers.shift();

			if(maintainer)
				return Oracle.parseAuthor(maintainer);
		}

		return undefined;
	}

	protected static parseAuthor (author: AuthorObject | string): parseAuthor.Author | undefined
	{
		if(typeof author === 'string')
			return parseAuthor(author);

		if(typeof author === 'object' && !!author) {
			const { name, email, url } = author;

			return { name, email, url };
		}

		return undefined;
	}

	get developerName (): string | undefined
	{
		return this.developer?.name ?? undefined;
	}

	get developerURL (): string | undefined
	{
		return this.developer?.url ?? undefined;
	}

	public commit (options: Partial<FaviconOptions>): FaviconOptions
	{
		const {
			appName,
			appDescription,
			version,
			developerName,
			developerURL,
		} = this;

		Object.assign(options, {
			appName,
			appDescription,

			version,

			developerName,
			developerURL,

			...options,
		});

		return options as FaviconOptions;
	}
}
