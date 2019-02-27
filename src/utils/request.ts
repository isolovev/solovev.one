import { apiUrl } from "./settings";

export interface IOptions {
	body?: any;
	headers?: any;
	method?: string;
}

const defaultOptions: IOptions = {
	body: null,
	headers: {},
	method: "GET",
};

export default function request(url: string, options: IOptions = defaultOptions): Promise<any> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		xhr.open(
			options.method,
			[apiUrl, url].join(""),
		);

		if (options.headers) {
			Object
				.keys(options.headers)
				.forEach((key: any) => {
					xhr.setRequestHeader(key, options.headers[key]);
				});
		}

		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				resolve( JSON.parse(xhr.response) );
			} else {
				reject(xhr.statusText);
			}
		};
		xhr.onerror = () => reject(xhr.statusText);

		xhr.send(options.body);
	});
}
