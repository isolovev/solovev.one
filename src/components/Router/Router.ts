interface Route {
	url?: string;
	title: string;
	callback: () => void;
	wrong?: boolean;
}

class Router {
	private readonly routes: Route[] = [];
	private readonly wrongRoute: Route;

	constructor(routes: Route[]) {
		this.routes = routes;
		this.wrongRoute = routes.find((route: Route) => route.wrong);
	}

	public listen(): void {
		let currentPath = window.location.pathname;

		setInterval(() => {
			const tempPath = window.location.pathname;
			if (currentPath !== tempPath) {
				currentPath = tempPath;
				this.check();
			}
		}, 100);

		this.check();
	}

	public navigate(path: string = "/"): void {
		const currentRoute: Route = this.routes.find((route: Route) => route.url === path);
		let title = null;

		if (currentRoute) {
			title = currentRoute.title;
		}

		window.history.pushState(null, title, path);
	}

	private check(): void {
		const currentPath = window.location.pathname;
		const currentRoute: Route = this.routes.find((route: Route) => route.url === currentPath);

		if (currentRoute) {
			currentRoute.callback.apply({});
			document.title = currentRoute.title;
		} else if (this.wrongRoute) {
			this.wrongRoute.callback.apply({});
			document.title = this.wrongRoute.title;
		}
	}
}

export default Router;
