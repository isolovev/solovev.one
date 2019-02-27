export function getElement<K extends keyof HTMLElementTagNameMap>(
	selector: string,
	context: Document|HTMLElementTagNameMap[K]|DocumentFragment = document,
): HTMLElementTagNameMap[K] {
	return context.querySelector(selector);
}

export function getElementsList<K extends keyof HTMLElementTagNameMap>(
	selector: string,
	context: Document|HTMLElementTagNameMap[K]|DocumentFragment = document,
): NodeList {
	return context.querySelectorAll(selector);
}
