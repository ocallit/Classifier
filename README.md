# ClassifyIt a Classifier

Utils to classify items:

- **TagIt** for 1 item view or manage Tags/Classifications
- **ClassifyIt** For a Tag/Classification view/manage items tagged or classified

## TagIt

	TagIt transforms <select> elements into editable tag management interfaces with CRUD operations in draggable modals; DialogIt provides the underlying promise-based, drag-enabled dialog system with SCH design system integration.


### Summary

TagIt is a JavaScript widget that enhances standard HTML &lt;select> elements (powered by Tom Select) with a modal dialog interface for managing tags/categories. It allows users to add, edit, delete, and search through options in a draggable, accessible dialog while keeping the underlying select element synchronized. The companion DialogIt provides the foundational modal system with drag-and-drop capabilities, CSS variable theming, and promise-based APIs.
One-Liner

## ClassifyIt

**ClassifyIt** is a lightweight, interactive JavaScript widget designed for categorizing items into distinct buckets.
It provides a modal-driven interface for managing permissions, product categories, user roles, and more.

## 🚀 Key Features

* **Native Dialog Support**: Uses the native HTML `<dialog>` element for efficient modal handling and accessibility.
* **Intuitive Drag-and-Drop**: Powered by **SortableJS**, optimized for desktop, touch devices (iOS/Safari), and trackpads.
* **Classification Methods**:
	* **Individual**: Drag items or use dedicated item-level action buttons.
	* **Templates (Plantillas)**: Save and apply predefined classification layouts.
	* **Groups**: Move entire group of items to a specific category at once.
* **Group Creation**: Allows creating groups of items to ease classification. Groups are created using the same widget interface (flagged to avoid recursion).
* **Data Integrity**: Automatic handling of "unassigned" items or items with invalid categories via a configurable default category.
* **Search & Filtering**: Real-time filtering to locate items within large datasets quickly.
* **Read-Only Mode**: A secure viewing mode that disables modifications while maintaining the visual layout.

## 🧠 AI & Developer Reference
* **Core Logic:** [classifyIt_docs.md](docs/classifyIt_docs.md) API, options, events
> **Integration Note:** This widget is agnostic to the project's data model.
> **AI Instruction:** When implementing, you MUST map the project's specific database fields (e.g., `product_id`, `sku`) to the widget's expected `id` and `name` format during initialization. Do not rename project variables to match this documentation. code here is example to code must be adapted to the project

## 📦 Installation

Ensure you include the required dependency and project files in your HTML:

```html

<script
    src="[https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js](https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js)"></script>

<link rel="stylesheet" href="src/ClassifyIt.css">
<script src="src/ClassifyIt.js"></script>
```

## 🛠 Basic Usage
Initialize the widget by providing categories and the items you wish to classify.

```html
<script>
const categories = [
    { id: 'none', label: 'X', title: 'No Access' },
    { id: 'read', label: 'RO', title: 'Read Only' },
    { id: 'write', label: 'RW', title: 'Read/Write' }
];

const items = [
    { id: 1, name: "John Doe", category: "none" },
    { id: 2, name: "Jane Smith", category: "read" }
];

const classifier = new ClassifyIt(categories, items, {
    title: 'User Permissions',
    editable: true
});

// Open the dialog and handle the result
classifier.openDialog()
    .then(result => {
        console.log('Classification Saved:', result);
    })
    .catch(error => {
        console.log('Classification Cancelled:', error.message);
    });
</script>
```

## Core Concepts

### Item Classification
Items are categorized based on a specific property key, which defaults to `category` but is configurable via the ` itemCategoryKey` option. The widget maps each item's unique identifier, defined by `itemIdKey`, to a specific category column in the user interface.

### Data Integrity and Fallbacks
To ensure data consistency, the widget includes logic to handle items with missing or invalid category assignments.
* **Default Assignment**: If an item has an unrecognized or null category, it is automatically moved to a default category during initialization.
* **Configurable Defaults**: Users can specify this fallback category using the `fallbackClassificationId` option; otherwise, it defaults to the first category in the provided array.

### Classification Templates (Plantillas)
The "Plantilla" method allows for saving and applying entire classification states.
* **Template Structure**: A template stores a mapping of multiple item IDs to their respective categories.
* **Efficiency**: Applying a template instantly redistributes items across the interface columns, which is ideal for standardizing setups or reverting to known states.

### Group-Based Classification
Beyond moving items individually, the widget supports batch operations through a group classification method.
* **Batch Movement**: This feature allows moving all items belonging to a specific group (e.g., "Administrators") to a target category (e.g., "Write Access") in a single action.
* **Dynamic Loading**: Groups can be defined locally in the configuration or fetched from external API endpoints.

### Composite Groups (The Recursion "Trick")
A unique architectural feature of `ClassifyIt` is its ability to handle "groups of groups" through recursive instantiation.
* **Self-Calling Logic**: When managing groups, the widget can open a second instance of itself to treat existing groups as items.
* **Recursion Guard**: To prevent infinite loops, the child instance is explicitly configured with `groupEditable: false`, which acts as a critical safety flag.
* **Use Case**: This allows users to classify base groups into higher-level "Composite Groups" using the same familiar drag-and-drop interface.

## ⚙️ Configuration Options

The `ClassifyIt` constructor accepts an optional `options` object to customize the widget's behavior and appearance.

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | `'Classification'` | The title displayed in the dialog header. |
| `itemNamePlural` | String | `'Items'` | Label used for the items in counters and search placeholders. |
| `itemIdKey` | String | `'id'` | The property name in the items array used as a unique identifier. |
| `itemlabelKey` | String | `'name'` | The property name in the items array used for display labels. |
| ` itemCategoryKey` | String | `'category'` | The property name in the items array that stores the category ID. |
| `editable` | Boolean | `true` | When `false`, disables drag-and-drop, hides toolbars, and sets the interface to read-only. |
| `showItemButtons` | Boolean | `true` | Determines whether the quick-action category buttons are visible on each item. |
| `fallbackClassificationId` | String | `null` | Category ID where items with invalid or missing categories are placed. |
| `presetsEnabled` | Boolean | `true` | Enables the template management interface (Plantillas). |
| `presetsEditable` | Boolean | `false` | Allows users to save current classifications as new templates. |
| `groupEnabled` | Boolean | `false` | Enables the group-based classification interface. |
| `groupEditable` | Boolean | `false` | Enables the "Manage Groups" button for recursive composite group creation. |
| `presetValues` | Array | `[]` | Initial list of predefined classification templates. |
| `groups` | Array | `[]` | Initial list of available groups for batch classification. |
| `apiUrl`               | String      | See below | API endpoint |

## 🧪 Testing

The `ClassifyIt` widget includes a comprehensive automated test suite built with **QUnit** to ensure stability across updates.

### Running Tests
To execute the test suite, open the following file in any modern web browser:
`test/classifyIt_tests.html`


## 📄 License

This project is licensed under the **MIT License**.
Copyright (c) 2025 ocallit
