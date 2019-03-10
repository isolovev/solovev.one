import { getElementsList } from "./getElements";

export default function lazyImages(entries: IntersectionObserverEntry[]) {
	entries
		.filter((entry) => entry.isIntersecting)
		.forEach((entry) => {
			const listImages = getElementsList(".draft-image__picture", entry.target);

			Array.prototype.slice.call(listImages)
				.filter((image: HTMLImageElement) => !image.src)
				.forEach((image: HTMLImageElement) => {
					image.src = image.getAttribute("data-src");
				});
		});
}
