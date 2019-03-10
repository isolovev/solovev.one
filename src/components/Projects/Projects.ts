import Draft, { DraftItem } from "../Draft/Draft";
import { getElement } from "../../utils/getElements";
import request from "../../utils/request";
import { getTransitionTime } from "../../utils/getTransitionTime";
import lazyImages from "../../utils/lazyImages";

class Projects {
	private root = getElement(".projects");
	private list = getElement(".projects__list");

	private timeTransition = getTransitionTime(this.root);

	private draftObserver = new IntersectionObserver(lazyImages);

	constructor() {
		request(`/project-list`)
			.then(this.createList);
	}

	public show(): void {
		this.root.hidden = false;
		// tslint:disable-next-line:no-unused-expression
		void this.root.offsetWidth;

		this.root.classList.add("projects--show");
	}

	public hide(): Promise<never> {
		return new Promise((resolve) => {
			this.root.classList.remove("projects--show");

			setTimeout(() => {
				this.root.hidden = true;
				resolve();
			}, this.timeTransition);
		});
	}

	private createList = (items: DraftItem[]): void => {
		items.forEach((item: DraftItem) => {
			const {fragment, root} = Draft.render(item);
			this.draftObserver.observe(root);
			this.list.appendChild(fragment);
		});
	}
}

export default Projects;
