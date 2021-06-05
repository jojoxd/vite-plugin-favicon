import {HtmlTagDescriptor} from 'vite';

type InjectTo = 'head' | 'body' | 'head-prepend' | 'body-prepend';

export class HtmlTag implements HtmlTagDescriptor
{
	public tag: string;

	public attrs: Record<string, string | boolean>;

	public injectTo: InjectTo;

	constructor (tag: string, injectTo: InjectTo, attrs: Record<string, string|boolean>)
	{
		this.injectTo = injectTo;
		this.tag = tag;
		this.attrs = attrs;
	}
}
