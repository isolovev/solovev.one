import { getElement } from "../../utils/getElements";
import { webPSupport } from "../../utils/webPSupport";

const template = (getElement("#draft-image") as HTMLTemplateElement).content;

export enum DraftImageItemType {
	mobile,
	mobile_only,
	desktop,
}

export interface DraftImageItem {
	source: string|null;
	sourceWebP: string|null;
	type: DraftImageItemType;
}

class DraftImage {
	public static render(data: DraftImageItem): Node {
		const fragment = document.importNode(DraftImage.template, true);
		const root = getElement(".draft-image", fragment);
		const image = getElement(".draft-image__picture", fragment);

		switch (data.type) {
			case DraftImageItemType.desktop:
				root.classList.add("draft-image--desktop");
				break;

			case DraftImageItemType.mobile_only:
				root.classList.add("draft-image--only-mobile");
				break;

			case DraftImageItemType.mobile:
				root.classList.add("draft-image--mobile");
				break;
		}

		webPSupport()
			.then(() => image.setAttribute("data-src", data.sourceWebP))
			.catch(() => image.setAttribute("data-src", data.source));

		return fragment;
	}

	private static template = template;
}

export default DraftImage;