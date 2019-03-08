import Draft, { DraftItem } from "../Draft/Draft";
import { getElement } from "../../utils/getElements";
import request from "../../utils/request";

class Projects {
	private static list = getElement(".projects__list");

	constructor() {
		request(`/project-list`)
			.then(this.createList);
	}

	private createList = (items: DraftItem[]): void => {
		items.forEach((item: DraftItem) => {
			Projects.list.appendChild(Draft.render(item));
		});
	}
}

export default Projects;
