import { getElement } from "../../utils/getElements";
import { selectorNavLink, selectorTemplateNav } from "../../utils/selectors";

interface BuildList {
	name: string;
	url: string;
}

class Nav {
	private readonly template: DocumentFragment = (getElement(selectorTemplateNav) as HTMLTemplateElement).content;

	public build(root: HTMLElement, list: BuildList[]): void {
		list.forEach((item) => {
			const itemHtmlFragment = document.importNode(this.template, true);
			const linkElement = getElement(selectorNavLink, itemHtmlFragment) as HTMLLinkElement;
			linkElement.href = item.url;
			linkElement.innerText = item.name;

			root.appendChild(itemHtmlFragment);
		});
	}
}

export default new Nav();
