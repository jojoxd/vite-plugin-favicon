import favicons from 'favicons';
import {normalizePath} from 'vite';
import type {PluginContext} from 'rollup';
import {ViteFaviconsPluginOptions} from './index.js';
import {parseFragment} from 'parse5';
import {HtmlTag} from './lib/HtmlTag';

interface FragmentNode
{
	nodeName: string;

	attrs: Array<{ name: string, value: string }>;
}

export interface FaviconExportResponse
{
	tags: Array<HtmlTag>;
}

/**
 * Emits files to vite
 */
export class FaviconExportBuilder
{
	protected res: favicons.FaviconResponse;

	protected options: ViteFaviconsPluginOptions;

	public static readonly ROOT_PATH = '%ROOT_PATH%';

	constructor (options: ViteFaviconsPluginOptions, res: favicons.FaviconResponse)
	{
		this.res = res;

		this.options = options;
	}

	handle (ctx: PluginContext): FaviconExportResponse
	{
		const files = new Map<string, string>();
		const assets = new Map<string, string>();

		// emit files as-is
		for(const {name, contents: source} of this.res.files) {
			const assetId = ctx.emitFile({
				type: 'asset',
				fileName: name,
				source: undefined, // deferred source
			});

			files.set(assetId, source);
			assets.set(name, assetId);
		}

		// emit images as asset with fixed paths
		for(const {name, contents: source} of this.res.images) {
			const assetId = ctx.emitFile({
				type: 'asset',
				fileName: normalizePath(`${this.root}/${name}`),
				source,
			});

			assets.set(name, assetId);
		}

		// Convert HTML
		const nodes = this.nodes.map((node) => {
			node.attrs = node.attrs.map((attr) => {
				const normalizedValue = attr.value.slice(FaviconExportBuilder.ROOT_PATH.length + 1); // favicons adds a slash

				if(assets.has(normalizedValue)) {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					const fileName = ctx.getFileName(assets.get(normalizedValue)!);

					attr.value = normalizePath(`/${fileName}`);
				}

				return attr;
			});

			return node;
		});

		// rewrite files to correct uri's,
		// add maskable property
		// eslint-disable-next-line prefer-const
		for(let [assetId, source] of files.entries()) {

			console.log('=====>', assetId, ctx.getFileName(assetId));
			if(this.options.maskable && ctx.getFileName(assetId) === 'manifest.json') {
				const manifest = JSON.parse(source);

				console.log(manifest);

				if(manifest) {
					if(typeof this.options.maskable === 'function') {
						this.options.maskable(manifest);
					} else {
						for(const icon of manifest.icons) {
							icon.purpose = this.options.maskable;
						}
					}
				}

				source = JSON.stringify(manifest, null, 4);
			}

			ctx.setAssetSource(assetId, source.replaceAll(FaviconExportBuilder.ROOT_PATH + '/', `/${this.root}`));
		}

		return {
			tags: this.convertFragmentsToHtmlTag(nodes),
		};
	}

	protected get root (): string
	{
		if(this.options.path?.startsWith('/')) {
			return this.options.path.slice(1);
		}

		return this.options.path ?? 'assets/';
	}

	protected get nodes (): Array<FragmentNode>
	{
		return this.res.html.map((tag) => <FragmentNode><unknown>parseFragment(tag).childNodes[0]);
	}

	protected convertFragmentsToHtmlTag (fragments: Array<FragmentNode>): Array<HtmlTag>
	{
		return fragments.map((node) => {
			return new HtmlTag(node.nodeName, 'head-prepend', node.attrs.reduce((acc, attr) => {
				acc[attr.name] = attr.value;
				return acc;
			}, <Record<string, string>>{}));
		});
	}
}
