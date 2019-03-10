import { getElement } from "../../utils/getElements";

class Home {
	private root = getElement(".home");

	public show = () => {
		this.root.classList.remove("home--hide");
	}

	public hide(): void {
		this.root.classList.add("home--hide");
	}
}

export default Home;
