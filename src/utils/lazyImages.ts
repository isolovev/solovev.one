import { getElementsList } from "./getElements";
import { webPSupport } from "./webPSupport";

export default function lazyImages(entries: IntersectionObserverEntry[]) {
	entries
		.filter((entry) => entry.isIntersecting)
		.forEach((entry) => {
			const listImages = getElementsList(".draft-image__picture", entry.target);

			Array.prototype.slice.call(listImages)
				.filter((image: HTMLImageElement) => !image.src)
				.forEach((image: HTMLImageElement) => {
					webPSupport()
						.then(() => image.src = image.getAttribute("data-src-webp"))
						.catch(() => image.src = image.getAttribute("data-src"));

					image.onload = () => {
						// @ts-ignore
						image.nextElementSibling.style.display = "none";
					};
				});
		});
}
