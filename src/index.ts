// @ts-ignore
import "intersection-observer";
// @ts-ignore
import route from "riot-route";

import Home from "./components/Home/Home";
import Projects from "./components/Projects/Projects";

const home = new Home();
const projects = new Projects();

route("/", () => {
	home.init();
	projects
		.hide()
		.then(home.show);
});

route("projects", () => {
	home.hide();
	projects.show();
});

route.base("/");
route.start(true);

document.body.addEventListener("click", (event) => {
	// @ts-ignore
	const link: HTMLLinkElement = event.target.closest("a");
	if (link && link.href.match(window.location.origin)) {
		event.preventDefault();

		window.scrollTo({
			top: 0,
		});

		route(link.getAttribute("href"));
	}
});
