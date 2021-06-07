import {FaviconOptions} from 'favicons';

export interface ViteFaviconsPluginOptions
{
	/**
	 * Path to your Source Logo
	 * @default 'assets/logo.png'
	 */
	logo?: string;

	/**
	 * Inject html metadata
	 * @default true
	 */
	inject?: boolean;

	/**
	 * Favicons configuration options
	 * @see https://github.com/itgalaxy/favicons
	 */
	favicons?: Partial<FaviconOptions>;

	/**
	 * The root of the project from which you want to load metadata
	 * @default process.cwd()
	 */
	projectRoot?: string;

	/** The path in which to save the favicons
	 *  @default 'assets/'
	 */
	path?: string;

	/**
	 * Generate Manifest with maskable?
	 * @default false
	 */
	maskable?: ManifestTransformer | false | 'maskable' | 'any maskable';
}

type ManifestTransformer = (manifest: any) => void;
