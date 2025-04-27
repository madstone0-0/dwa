/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IFetch {
	get: (url: string) => Promise<any>;
	post: (url: string, data: any) => Promise<any>;
	put: (url: string, data: any) => Promise<any>;
	delete: (url: string) => Promise<any>;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export type Item = {
	iid: string;
	vid: string;
	name: string;
	pictureUrl: string;
	description: string;
	cost: number;
};
