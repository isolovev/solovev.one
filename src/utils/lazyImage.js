import {webPSupport} from "./webPSupport";

/**
 * Lazy load image
 * @param imageElement {HTMLImageElement} image element
 * @param rootElement {HTMLElement} container element
 * @returns {IntersectionObserver}
 */
export function createLazyImage(imageElement, rootElement) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        const { isIntersecting } = entry;

        if (isIntersecting) {
          const src = imageElement.getAttribute("data-src");
          const srcWebP = imageElement.getAttribute("data-src-webp");
          webPSupport()
            .then(() => {
              if (srcWebP && srcWebP !== "null") {
                imageElement.src = srcWebP;
              }
              else {
                imageElement.src = src;
              }
            })
            .catch(() => {
              imageElement.src = src;
            });

          observer.disconnect();
        }
      });
    });

  observer.observe(rootElement);

  return observer;
}

/**
 * Destroy lazy load image
 * @param observer {IntersectionObserver}
 */
export function destroyLazyImage(observer) {
  observer.disconnect();
}
