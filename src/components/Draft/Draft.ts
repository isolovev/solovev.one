import { getElement } from "../../utils/getElements";
import DraftImage, { DraftImageItemType } from "../DraftImage/DraftImage";
import { ProjectTypes } from "../../utils/projectTypes";
import { getOpensourceIcon } from "../Opensource/Opensource";

export interface DraftItem {
	title: string;
	text: string;
	url: string;
	desktop: [string, string];
	mobile: [string, string];
	type: ProjectTypes;
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
		let title = item.title;

		if (item.type !== ProjectTypes.project) {
			title = [getOpensourceIcon(), item.title].join("");
		}

		getElement(".draft__title", root).innerHTML = title;
		getElement(".draft__text", root).innerText = item.text;

		if (item.url) {
			const more = getElement(".draft__link", root);
			const link = getElement("a", more) as HTMLLinkElement;

			more.hidden = false;
			link.href = item.url;
		}

		if (item.desktop[0]) {
			const image = DraftImage.render({
				type: DraftImageItemType.desktop,
				source: item.desktop[0],
				sourceWebP: item.desktop[1],
			});

			images.appendChild(image);
		}

		if (item.mobile[0]) {
			const image = DraftImage.render({
				type: item.desktop[0] ? DraftImageItemType.mobile : DraftImageItemType.mobile_only,
				source: item.mobile[0],
				sourceWebP: item.mobile[1],
			});

			images.appendChild(image);
		}

		if (item.mobile[0] && item.desktop[0]) {
			images.classList.add("draft__screens--offset");
		}

		return {fragment, root};
	}

	private static template = template;
}

export default Draft;
