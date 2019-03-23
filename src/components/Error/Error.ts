import { getElement } from "../../utils/getElements";
import { getTransitionTime } from "../../utils/getTransitionTime";

class Error {
	private readonly root = getElement(".error");
	private readonly timeTransition = getTransitionTime(this.root);

	public init(): void {
		this.root.hidden = false;
	}

	public show(): void {
		this.root.hidden = false;
		// tslint:disable-next-line:no-unused-expression
		void this.root.offsetWidth;
		this.root.classList.add("error--show");
	}

	public hide(): void {
		this.root.classList.remove("error--show");

		setTimeout(() => {
			this.root.hidden = true;
		}, this.timeTransition);
	}
}

export default Error;
