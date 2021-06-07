import type { Plugin } from 'vite';
import type { PluginContext } from 'rollup';

import favicons from 'favicons';
import path from 'path';

import {Oracle} from './Oracle';
import {mergeFaviconConfig} from './faviconsDefaults';
import {FaviconExportBuilder} from './FaviconExportBuilder.js';
import {HtmlTag} from './lib/HtmlTag';

import { ViteFaviconsPluginOptions } from './ViteFaviconsPluginOptions';

type FaviconsPluginArgs = Partial<ViteFaviconsPluginOptions> | ViteFaviconsPluginOptions['logo'];

function ViteFaviconsPlugin (options: FaviconsPluginArgs = {}): Plugin
{
	const lOptions = typeof options === 'string' ? { logo: options } : options;

	lOptions.inject ??= true;
	lOptions.projectRoot ??= process.cwd();
	lOptions.path ??= 'assets/';
	lOptions.favicons ??= {};
	lOptions.maskable ??= false;

	// This option is used to regenerate the Output HTML
	lOptions.favicons.path = FaviconExportBuilder.ROOT_PATH;

	// Load default app variables from package.json
	const oracle = new Oracle(lOptions.projectRoot);
	lOptions.favicons = oracle.commit(lOptions.favicons);

	const LOGO_PATH = path.resolve(lOptions.logo || path.join('assets', 'logo.png'));
	const faviconConfig = mergeFaviconConfig(lOptions); // @TODO: Move to mergeConfig from 'vite'?

	const getFavicons = async () => {
		return favicons(LOGO_PATH, faviconConfig);
	};

	let tags: Array<HtmlTag> = [];

	const rebuildFavicons = async (ctx: PluginContext) => {
		ctx.addWatchFile(LOGO_PATH);
		const res = await getFavicons();

		const faviconExportBuilder = new FaviconExportBuilder(lOptions, res);

		const data = faviconExportBuilder.handle(ctx);
		tags = data.tags;
	};

	return {
		name: 'vite-plugin-favicon',

		async buildStart () {
			await rebuildFavicons(this);
		},

		transformIndexHtml () {
			if (lOptions.inject) {
				return tags;
			}
		},
	};
}

export {
	ViteFaviconsPluginOptions,
	ViteFaviconsPlugin,
};

export default ViteFaviconsPlugin;
