// @ts-ignore
import route from "riot-route";

// import Home from "./components/Home/Home";
import Projects from "./components/Projects/Projects";

const projects = new Projects();

// import routeNames from "./utils/routeNames";
//
// route(routeNames.home, () => {
// 	Home.show();
// });
//
// route(routeNames.about, () => {
// 	Home.hide();
// });
//
// route(routeNames.projects, () => {
// 	Home.hide();
// });
//
// route.base("/");
// route.start(true);
//
// document.body.addEventListener("click", (event) => {
// 	// @ts-ignore
// 	const link: HTMLLinkElement = event.target.closest("a");
// 	if (link && link.href.match(window.location.origin)) {
// 		event.preventDefault();
// 		route(link.getAttribute("href"));
// 	}
// });
