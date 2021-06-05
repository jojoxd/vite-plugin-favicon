import { FaviconOptions } from 'favicons';
import { ViteFaviconsPluginOptions } from './index.js';

export function mergeFaviconConfig (options: ViteFaviconsPluginOptions): Partial<FaviconOptions>
{
	return {
		appShortName: null,
		dir: 'auto',
		lang: 'en-US',
		background: '#fff',
		theme_color: '#fff',
		appleStatusBarStyle: 'black-translucent',
		display: 'standalone',
		orientation: 'any',
		scope: '/',
		start_url: '/?homescreen=1',
		version: '1.0',
		logging: false,
		pixel_art: false,
		loadManifestWithCredentials: false,

		...options.favicons,

		icons: {
			android: true,
			appleIcon: true,
			appleStartup: true,
			coast: true,
			favicons: true,
			firefox: true,
			windows: true,
			yandex: true,

			...options.favicons?.icons,
		},
	};
}
