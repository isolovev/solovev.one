import Page from "../../interfaces/Page.interface";
import Nav from "../Nav/Nav";

import request from "../../utils/request";
import routeNames from "../../utils/routeNames";
import { getElement } from "../../utils/getElements";
import { selectorHomeRoot, selectorHomeSubTitle, selectorHomeTitle } from "../../utils/selectors";

const classes = {
	hide: "home--hide",
	show: "home--show",
};

class Home implements Page {
	private readonly root: HTMLElement = getElement(selectorHomeRoot);

	constructor() {
		Nav.build([
			{
				name: "Обо мне",
				url: routeNames.about,
			},
			{
				name: "Работы",
				url: routeNames.projects,
			},
		]);

		request("/info")
			.then(({title, subtitle}) => {
				getElement(selectorHomeTitle, this.root).innerText = title;
				getElement(selectorHomeSubTitle, this.root).innerText = subtitle;
			});

	}

	public show(): void {
		this.root.classList.remove(classes.hide);

		requestAnimationFrame(() => {
			this.root.classList.add(classes.show);
		});
	}

	public hide(): void {

	}
}

export default new Home();
