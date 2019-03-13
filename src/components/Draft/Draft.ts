import { getElement } from "../../utils/getElements";
import DraftImage, { DraftImageItemType } from "../DraftImage/DraftImage";

export interface DraftItem {
	title: string;
	text: string;
	url: string;
	logo: string|null;
	logo_webp: string|null;
	desktop: string|null;
	desktop_webp: string|null;
	mobile: string|null;
	mobile_webp: string|null;
	type: string;
	date: string;
}

interface DraftReturn {
	fragment: Node;
	root: HTMLElement;
}

const template = (getElement("#project-item") as HTMLTemplateElement).content;

class Draft {
	public static render(item: DraftItem): DraftReturn {
		const fragment = document.importNode(Draft.template, true);
		const root = getElement(".draft", fragment);
		const images = getElement(".draft__screens", root);

		getElement(".draft__title", root).innerText = item.title;
		getElement(".draft__text", root).innerText = item.text;

		if (item.url) {
			const more = getElement(".draft__link", root);
			const link = getElement("a", more) as HTMLLinkElement;

			more.hidden = false;
			link.href = item.url;
		}

		if (item.desktop) {
			const image = DraftImage.render({
				type: DraftImageItemType.desktop,
				source: item.desktop,
				sourceWebP: item.desktop_webp,
			});

			images.appendChild(image);
		}

		if (item.mobile) {
			const image = DraftImage.render({
				type: item.desktop ? DraftImageItemType.mobile : DraftImageItemType.mobile_only,
				source: item.mobile,
				sourceWebP: item.mobile_webp,
			});

			images.appendChild(image);
		}

		if (item.mobile && item.desktop) {
			images.classList.add("draft__screens--offset");
		}

		return {fragment, root};
	}

	private static template = template;
}

export default Draft;
