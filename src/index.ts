// @ts-ignore
import "intersection-observer";

import Router from "./components/Router/Router";

import Home from "./components/Home/Home";
import Projects from "./components/Projects/Projects";
import Error from "./components/Error/Error";

const siteTitle = `Иван Соловьев – Frontend разработчик`;

const home = new Home();
const projects = new Projects();
const error = new Error();

const router = new Router([
	{
		url: "/",
		title: siteTitle,
		callback: () => {
			home.init();
			error.hide();
			projects
				.hide()
				.then(home.show);
		},
	},
	{
		url: "/projects",
		title: `Мои работы. ${siteTitle}`,
		callback: () => {
			home.hide();
			error.hide();
			projects.show();
		},
	},
	{
		wrong: true,
		title: `Мои работы. ${siteTitle}`,
		callback: () => {
			home.hide();
			projects.hide();
			error.show();
		},
	},
]);

router.listen();

document.body.addEventListener("click", (event) => {
	// @ts-ignore
	const link: HTMLLinkElement = event.target.closest("a");
	if (link && link.href.match(window.location.origin)) {
		event.preventDefault();

		window.scrollTo({
			top: 0,
		});

		router.navigate(link.getAttribute("href"));
	}
});
