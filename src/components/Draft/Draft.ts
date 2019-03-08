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

const template = (getElement("#project-item") as HTMLTemplateElement).content;

class Draft {
	public static render(item: DraftItem): Node {
		const fragment = document.importNode(Draft.template, true);
		const images = getElement(".draft__screens", fragment);

		getElement(".draft__title", fragment).innerText = item.title;
		getElement(".draft__text", fragment).innerText = item.text;

		if (item.url) {
			const more = getElement(".draft__link", fragment);
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

		return fragment;
	}

	private static template = template;
}

export default Draft;
