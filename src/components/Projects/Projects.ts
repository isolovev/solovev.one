import Draft, { DraftItem } from "../Draft/Draft";
import { getElement } from "../../utils/getElements";
import request from "../../utils/request";
import { getTransitionTime } from "../../utils/getTransitionTime";

class Projects {
	private root = getElement(".projects");
	private wrap = getElement(".projects__wrap");
	private list = getElement(".projects__list");

	private timeTransition = getTransitionTime(this.root);

	constructor() {
		request(`/project-list`)
			.then(this.createList);
	}

	public show(): void {
		this.root.hidden = false;

		setTimeout(() => {
			this.root.classList.add("projects--show");
			this.wrap.classList.add("projects__wrap--show");
		}, 1);
	}

	public hide(): void {
		this.root.classList.remove("projects--show");
		this.wrap.classList.remove("projects__wrap--show");

		setTimeout(() => {
			this.root.hidden = true;
		}, this.timeTransition);
	}

	private createList = (items: DraftItem[]): void => {
		items.forEach((item: DraftItem) => {
			this.list.appendChild(Draft.render(item));
		});
	}
}

export default Projects;
