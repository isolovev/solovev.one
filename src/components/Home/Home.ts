import Page from "../../interfaces/Page.interface";
import Nav from "../Nav/Nav";

import request from "../../utils/request";
import routeNames from "../../utils/routeNames";
import { getElement } from "../../utils/getElements";
import {
	selectorTemplateHome,
	selectorHomeRoot,
	selectorHomeSubTitle,
	selectorHomeTitle,
	selectorNav,
} from "../../utils/selectors";
import { appElement } from "../../utils/settings";
import { getTransitionTime } from "../../utils/getTransitionTime";

const classes = {
	hide: "home--hide",
	show: "home--show",
};

class Home implements Page {
	private readonly template = getElement(selectorTemplateHome) as HTMLTemplateElement;
	private readonly rootFragment: DocumentFragment = document.importNode(this.template.content, true);
	private readonly root: HTMLElement = getElement(selectorHomeRoot, this.rootFragment);
	private readonly rootTransition: number = 1;

	constructor() {
		const nav = getElement(selectorNav, this.root);

		Nav.build(nav, [
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

		appElement.appendChild(this.rootFragment);
		this.rootTransition = getTransitionTime(this.root);
	}

	public show(): void {
		this.root.classList.remove(classes.hide);
		this.root.hidden = false;

		requestAnimationFrame(() => {
			this.root.classList.add(classes.show);
		});
	}

	public hide(): void {
		if (!this.root.classList.contains(classes.show)) {
			return;
		}

		this.root.classList.remove(classes.show);

		setTimeout(() => {
			this.root.classList.add(classes.hide);
			this.root.hidden = true;
		}, this.rootTransition);
	}
}

export default new Home();
