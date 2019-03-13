import { getElement } from "../../utils/getElements";

class Home {
	private root = getElement(".home");

	public show = () => {
		this.root.classList.remove("home--hide");
		this.root.hidden = false;
	}

	public hide(): void {
		this.root.classList.add("home--hide");
	}
}

export default Home;
