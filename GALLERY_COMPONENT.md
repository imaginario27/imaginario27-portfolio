## Gallery component

Name: Gallery

### Description:
The Gallery component is a versatile and visually appealing way to showcase a collection of images or media items. 
It provides an organized and interactive layout that allows users to easily browse through the content. 
The Gallery component can be customized to fit various design styles and can include features such as lightbox functionality, pagination, and responsive design for optimal viewing on different devices. Whether you're displaying a portfolio, product images, or a photo album, the Gallery component offers an engaging and user-friendly experience for your audience.

### Features:
- **Grid Layout**: Display images in a structured grid format for easy browsing. Grid can be customized to fit different numbers of columns and spacing. 
- **Lightbox Functionality**: Click on an image to view it in a larger format with a lightbox overlay. This allows users to focus on the image without distractions and provides options for navigation between images.
- **Pagination**: If you have a large collection of images, the Gallery component can include pagination to break the content into manageable sections, improving load times and user experience.
- **Responsive Design**: The Gallery component is designed to be responsive, ensuring that it looks great on all devices, from desktops to mobile phones. The layout adjusts automatically to fit the screen size, providing an optimal viewing experience.
- **Customization Options**: The Gallery component can be customized with various styles, such as different border styles, hover effects, and caption placements. This allows you to tailor the appearance to match your brand or design preferences.
- **Accessibility**: The Gallery component is built with accessibility in mind, ensuring that it can be navigated using keyboard controls and is compatible with screen readers, making it inclusive for all users.

## Grid layout:
- The Gallery component can be configured to display images in a grid layout, allowing for a clean and organized presentation.
- The number of columns and spacing between images can be customized to fit the design requirements of the website or application.
- The grid layout can be responsive, adjusting the number of columns based on the screen size to ensure optimal viewing on different devices.
- The grid layout can also include options for sorting and filtering images, allowing users to easily find specific content within the gallery.
- The grid layout can be enhanced with hover effects, such as zooming in on images or displaying additional information when the user hovers over an image.
- The grid layout can also include options for lazy loading images, improving performance by only loading images as they come into view.
- The grid layout can be integrated with a lightbox feature, allowing users to click on an image to view it in a larger format without leaving the gallery page.
- The grid layout gap can be adjusted by passing pixel values to the component, allowing for precise control over the spacing between images in the gallery.
- The grid should allow masonic layout, where images of varying heights can be displayed in a visually appealing way without leaving large gaps between them.
- The grid layout should support setting a specific height for rows to ensure a consistent appearance, while still allowing for images of varying heights to be displayed effectively.
- The grid layout should support handling widow row image item by allowing the last row to be left-aligned, centered, or justified, depending on the desired visual presentation.
- The grid layout should enable to hide widows row image item if the last row contains only one image, ensuring a balanced and visually appealing gallery layout. 

### Styles:
- Style customization will only be made my passing tailwind classes to the component.
- The Gallery component can be styled using Tailwind CSS classes, allowing for easy customization and consistency with the overall design of the website or application.
- Tailwind CSS classes can be applied to various elements of the Gallery component, such as the grid container, individual image containers, captions, and navigation controls.
- Tailwind CSS classes can be used to adjust the layout, spacing, colors, and typography of the Gallery component, providing flexibility in design while maintaining a cohesive look and feel.
- Tailwind CSS classes can also be used to add responsive design features to the Gallery component, ensuring that it looks great on all devices by adjusting the layout and styling based on screen size.
- Tailwind CSS classes can be applied conditionally based on user interactions, such as hover effects or active states, to enhance the user experience and provide visual feedback.
- Tailwind CSS classes can be combined with custom CSS if needed, allowing for further customization beyond Tailwind's utility classes.
- Default styles should fit to the current theme tailwind classes, but can be overridden by passing custom tailwind classes to the component.
- Dark mode should work nativiley and react to store theme changes.

### Components:
- The Gallery component can be composed of several sub-components, such as:
  - **ImageItem**: Represents an individual image within the gallery, including properties for the image source, alt text, and optional caption.
  - **Lightbox**: A component that displays a larger version of the image when clicked, along with navigation controls to browse through the images in the gallery.
  - **Filter**: A component that allows users to filter the images in the gallery based on categories, tags, or other criteria, making it easier to find specific content. Use the options group field from AirUI.

Each of these sub components are individual components that can be used elsewhere in the application, but are also used within the Gallery component to provide a cohesive and interactive experience for users browsing through the collection of images.

### Pagination:
- Pagination use the AirUI pagination component to provide navigation controls for browsing through a large collection of images in the gallery.
- Max items per page can be configured to control how many images are displayed on each page of the gallery, improving load times and user experience when dealing with large collections of images.

### Props:
Props with mutliple value uses enums defined in `app/models/enums`. For example, `layout: "grid" | "masonry" | "justified"` or `paginationMode: "pagination" | "load-more" | "infinite" | "none"`.

### Lazy loading
Implemented by default

### Limit number of images to display
- The Gallery component can include a feature to limit the number of images displayed, allowing for a more focused and curated presentation of content. This can be useful for showcasing a select few images or for performance reasons when dealing with large collections. The limit can be configured based on the desired number of images to display, and additional images can be accessed through pagination or a "Load More" button if needed.

### Images:
use `nuxt/image` for optimized image rendering, including responsive sizes, lazy loading, and placeholders for better performance and user experience.
---

## Open questions

> Context: AirUI ships `SimplePagination` / `ButtonPagination` / `RowsPerPage`, `ModalDialog`, `Slider`, `OptionButtonsGroupField`, `ToggleButtonsGroupField`, and `nuxt/image`. It does **not** ship a Gallery, Lightbox, or masonry/justified layout — those need to be built. Answer inline under each question.
For pagination, use ButtonPagination and components like lightbox, gallery, masonry/justified layout should be built from scratch and stored in components folder.

### 1. Component ownership — DS or app?
Spec describes Gallery/ImageItem/Lightbox/Filter as reusable. Should they live in this app (`app/components/gallery/`) or be added to `@imaginario27/air-ui-ds`? Portfolio-specific UX → app; generic primitives (Lightbox, ImageItem) feel DS-worthy.
**Answer:**
Already answered: Gallery/ImageItem/Lightbox/Filter should live in `app/components/gallery/` since they are specific to the portfolio. Filter uses AirUI's OptionButtonsGroupField, but the Gallery-specific filter component that composes it is app-level. If we find ourselves reusing Lightbox or ImageItem elsewhere, we can always move them to the DS later.

### 2. Layout modes are three different things
Section "Grid layout" conflates three layouts that need separate code paths:
- **`grid`** — N equal columns, fixed cell, `object-cover`.
- **`masonry`** — variable heights, vertically packed (CSS columns or `vue-masonry-wall`).
- **`justified`** — fixed row height, variable widths (Flickr-style). This is what §28–§30 (specific row height + widow alignment) actually describes — not masonry.

Suggest a `layout: "grid" | "masonry" | "justified"` prop. Which are required for v1?
**Answer:**
All. Button remember, to create enums in app/models/enums. Props are passed via enums.

### 3. Widow behavior scope
The `align: left | center | justify | hide-if-single` rules only apply to **justified** mode. Confirm.
**Answer:**

NO, also to masonry mode. In justified, it applies to the last row. In masonry, it applies to the last column.

### 4. Masonry: CSS-only or library?
Pure CSS `column-count` is cheap but breaks DOM order across columns (bad for keyboard nav and lightbox index). A library like `vue-masonry-wall` preserves order. Preference?
**Answer:**
Tailwind's `columns` utilities are a CSS-only solution that breaks DOM order, which is bad for accessibility and lightbox indexing. Therefore, we should use a library like `vue-masonry-wall` that preserves DOM order while achieving the masonry layout. This will ensure better keyboard navigation and a more intuitive user experience when interacting with the gallery.

### 5. Image dimensions required?
Masonry/justified need intrinsic `width`/`height` per image to lay out without layout shift. Should `ImageItem` require `width` + `height` props (or derive from WP media)?
**Answer:**
Yes, `ImageItem` should require `width` and `height` props to ensure that the gallery can lay out images correctly without causing layout shifts. These dimensions can be derived from the WordPress media library or provided directly when defining the image items. This will allow the gallery to calculate the appropriate sizes for each image, especially in masonry and justified layouts, resulting in a more stable and visually appealing presentation.

### 6. Pagination AND Load More?
Both are mentioned. Are they alternatives or stacked? Suggest `mode: "pagination" | "load-more" | "infinite" | "none"` plus `pageSize`.
**Answer:**
They are alternatives. We can implement both, but they should be mutually exclusive based on the `mode` prop. This allows for flexibility in how users navigate through the gallery while keeping the implementation straightforward. The `pageSize` prop can be used to control how many items are displayed per page or loaded with each "Load More" action, depending on the selected mode.

### 7. `limit` vs pagination interaction
Does `limit` cap the **dataset** before paginating, or just the **initial visible count** (Load More reveals more up to dataset end)?
**Answer:**

Limit is thought for lazy loading or infinite loading. Depending on the pagination mode, it can cap either the dataset or the initial visible count. For example, in "pagination" mode, `limit` would cap the dataset before paginating, while in "load-more" mode, it would cap the initial visible count, allowing users to load more items up to the dataset end. This provides flexibility in how the gallery handles large collections of images while maintaining performance and user experience.

### 8. Data source contract
Is `items` a plain prop array `{ src, alt, caption, width, height, tags?, categories? }`, or should Gallery accept a GraphQL operation name and fetch internally? Recommendation: dumb prop, page-level wrapper does the fetch.
**Answer:**
Items pretend to be an array of ids from the WP media library, and Gallery will fetch the details internally. This allows for a cleaner separation of concerns, where the page-level wrapper can handle data fetching and pass a simple array of IDs to the Gallery component. The Gallery can then be responsible for fetching the necessary details (such as `src`, `alt`, `caption`, `width`, `height`, `tags`, and `categories`) based on those IDs, making the component more reusable and easier to integrate with different data sources in the future.

### 9. Filter field type
- `OptionButtonsGroupField` → single-select, button-style.
- `ToggleButtonsGroupField` → multi-select.

Multi-select with an "All" reset is the typical pattern. Single or multi? Filter on `categories`, `tags`, or both?
**Answer:**
Use OptionButtonGroupField. It contains all the necessary logic.


### 10. Sorting
Mentioned once (§22). In scope for v1 or drop?
**Answer:**
Sorting should be specified as prop, but shouln't appear visually as interactive intems. Just for fetching purposes. For example, `sortBy: "date" | "title" | "random"`.

### 11. Lightbox details
- Compose `ModalDialog` + `Slider`? Confirm.
- Keyboard contract: ←/→/Esc, focus trap, `aria-roledescription="carousel"`, alt-text announcements.
- Show captions inside? Counter ("3 / 12")? Thumbnail strip?
- URL-syncable open state (deep link to image index)?

**Answer:**
In this case, use a modal Dialog from AIRUI but create a new slider.

### 12. Hover effects and caption placement
§15 lists caption placement as customizable. Defaults? (overlay-bottom / below-image / none / on-hover.)
**Answer:**
Yes. Deafult will be hover with semi-transparent background and text centered in the middle.

### 13. Tailwind class API surface
Suggest a structured `:ui` prop, e.g. `{ root, item, image, caption, lightbox }`, instead of a single `class` blob — otherwise consumers can only style the outer wrapper.
**Answer:**

### 14. i18n keys
New keys needed in es/en/de: filter "All", "Load more", lightbox "Previous/Next/Close" + "Image X of Y". Namespace under `gallery.*`?
**Answer:**

Do not translate for now

### 15. Accessibility extras
Beyond §16: focus-visible rings on items, `role="list"`/`listitem`, screen-reader counters, `prefers-reduced-motion` for hover zoom. Confirm in scope.
**Answer:**
Yes, all of these accessibility features should be implemented to ensure that the Gallery component is inclusive and usable for all users. Focus-visible rings will help keyboard users navigate the gallery, while proper ARIA roles will improve screen reader compatibility. Screen-reader counters can provide context for users about their position within the gallery, and respecting `prefers-reduced-motion` will enhance the experience for users who may be sensitive to motion effects. These features are essential for creating an accessible and user-friendly gallery experience.

### 16. Tests
CLAUDE.md mandates a Vitest spec mirroring source path. Coverage target: layout switching, pagination/load-more, filter, lightbox open + keyboard. Confirm scope.
**Answer:**
Yes, all of these test scenarios should be covered to ensure the Gallery component functions correctly under various conditions. This includes verifying layout changes, pagination and load-more functionality, filter behavior, and lightbox interactions, including keyboard navigation.

### 17. `nuxt/image` usage
Use `<NuxtImg>` with `sizes` + `densities` for srcset, `loading="lazy"` by default, `placeholder` for blur-up. Confirm.
**Answer:**
Yes, `<NuxtImg>` should be used with the specified attributes to ensure optimal image loading and performance. The `sizes` and `densities` attributes will help generate appropriate `srcset` values for responsive images, while `loading="lazy"` will defer off-screen image loading until they are needed. The `placeholder` attribute can be used to provide a low-quality placeholder image that is displayed while the full image is loading, creating a smoother visual experience for users.