This prompt is designed to ensure any future AI interaction correctly interprets the dual-nature of the TagIt.js widget and its relationship with your specific MySQL schema.

# Instructions for TagIt.js Development & Integration


## 1. The Dual-Functionality Architecture
TagIt.js operates across two distinct data layers. You must distinguish between them to prevent database corruption:

### Layer A: Record Tagging (Table: `classifier_assignments`)
* **Purpose:** Assigning/unassigning specific tags to a single record (e.g., assigning "SUV" to "Car ID 500").
* **Key Components:** `item_id`, `classifier_tag_id`, `item_table`.
* **Persistence Logic:** Controlled by the `autoPersist` flag.
	* **If `autoPersist: true`:** TagIt calls the API immediately upon dropdown selection or removal.
	* **If `autoPersist: false`:** TagIt updates the internal DOM state only; the parent HTML form is responsible for saving the final state of assignments.
* **Database Constraint:** Rely on the UNIQUE KEY (`item_id`, `classifier_tag_id`, `item_table`) to prevent duplicate assignments.

### Layer B: Taxonomy CRUD (Table: `classifier_tags`)
* **Purpose:** Managing the "dictionary" of available tags for a whole category (e.g., adding "Crossover" as a new option in the "Car Categories" catalog).
* **Key Components:** `classifier_catalog_id`, `tag_label`.
* **Persistence Logic:** **Always Immediate.** CRUD actions (Save/Edit/Delete in the dialog) hit the API directly because they modify global metadata, not individual record state.
* **Database Constraint:** Rely on the UNIQUE KEY (`classifier_catalog_id`, `tag_label`) to prevent duplicate tag names within the same catalog.

## 2. Configuration & Priority
When initializing or modifying the widget, follow this strict priority order for settings:
1. **JavaScript Options:** Explicit values passed to the `new TagIt(el, options)` constructor.
2. **Data Attributes:** `data-tagit-*` attributes on the HTML element.
3. **Defaults:** The internal hardcoded defaults within the class.

## 3. Database Mapping Reference
To avoid "silly bugs," ensure all API payloads and internal keys match the schema:
* **Catalog ID:** Use `classifier_catalog_id` (replaces legacy `catalogId`).
* **Tag ID:** Use `classifier_tag_id` for primary keys.
* **Tables:** * `classifier_catalogs`: System metadata.
	* `classifier_tags`: The tag options.
	* `classifier_assignments`: Which record has which tag.
	* `classifier_groups`: Bulk item groups for ClassifyIt integration.

## 4. Operational Guardrails
* **CRUD Dialog:** `saveNewOption()` and `saveInlineEdit()` manage the **Taxonomy (Layer B)**. They should never attempt to modify `classifier_assignments`.
* **Initialization:** `fetchItemTags()` retrieves **Assignments (Layer A)** for the specific `item_id` and `item_table` context.