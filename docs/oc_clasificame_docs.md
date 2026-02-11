# ocClasificame Widget Documentation
> **Context:** This file serves as the Single Source of Truth (SSOT) for the `oc_clasificame` module.
> **Scope:** Defines data structures, UI naming conventions, and logic flow.
> **Integration Note:** This widget is agnostic to the project's data model.
> **AI Instruction:** When implementing, you MUST map the project's specific database fields (e.g., `product_id`, `sku`) to the widget's expected `id` and `name` format during initialization. Do not rename project variables to match this documentation. code here is example to code must be adapted to the project

## Overview

`ocClasificame` is a JavaScript widget for creating interactive classification interfaces. It allows users to categorize items using drag-and-drop functionality, individual item buttons, template management, and group-based classification. The widget supports both editable and read-only modes.



## Constructor

```javascript
new ocClasificame(categories, items, options = {})
```

### Parameters

- **`categories`** (Array): Array of category objects defining the classification columns
- **`items`** (Array): Array of items to be classified
- **`options`** (Object): Configuration options (see Options section)

### Category Object Structure

```javascript
{
    id: 'unique_id',        // Unique identifier for the category
    label: 'Short Label',   // Short label (used in buttons)
    title: 'Full Title'     // Full title (displayed as column header)
}
```

### Item Object Structure

```javascript
{
    id: 'unique_id',           // Unique identifier (valueId option)
    name: 'Display Name',     // Display name (valueDisplay option)
    category: 'category_id'   // Current category (itemsCategoryIdKey option)
}
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | String | `'Classification'` | Dialog title |
| `que_clasifica` | String | `'producto'` | Type of items being classified (for API/database) |
| `que_clasifica_label` | String | `'Items'` | Label for items in UI |
| `valueId` | String | `'id'` | Property name for item unique identifier |
| `valueDisplay` | String | `'name'` | Property name for item display text |
| `itemsCategoryIdKey` | String | `'category'` | Property name for item's current category |
| `editable` | Boolean | `true` | Whether classification can be modified |
| `showToolbar` | Boolean | `true` | Show individual item action buttons |
| `savedClassifications` | Array | `[]` | Array of saved classification templates |
| `showPlantillaMethod` | Boolean | `true` | Enable template/individual classification mode |
| `canSavePlantillaMethod` | Boolean | `false` | Allow saving new templates |
| `showGroupMethod` | Boolean | `false` | Enable group-based classification mode |
| `crudGroupMethod` | Boolean | `false` | Allow creating/editing groups |
| `groups` | Array | `[]` | Array of available groups |
| `apiEndpoints` | Object | See below | API endpoint configurations |
| `debug` | Boolean | `false` | Enable debug logging |
| `unassignedDefaultTo` | String/null | `null` | Default category for items with invalid categories |

### API Endpoints Object

```javascript
// DEFAULT configuration (Override these with project-specific routes)
apiEndpoints: {
    save: '',
    load: '',
    getGroups: '',
    getGroupItems: '',
    saveGroup: '',
    deleteGroup: ''
}
```

### Saved Classification Object Structure

```javascript
{
    id: 'unique_id',
    name: 'Template Name',
    description: 'Template description',
    classification: {
        category_id: ['item_id_1', 'item_id_2'],
        // ... for each category
    }
}
```

### Group Object Structure

```javascript
{
    id: 'unique_id',
    name: 'Group Name',
    itemCount: 5,
    description: 'Group description',
    isEditable: true
}
```

## Public Methods

### openDialog(dialogOptions = {})

Opens the classification dialog and returns a Promise.

```javascript
const result = await clasificame.openDialog({
    title: 'Custom Dialog Title',
    width: '90vw',
    height: '80vh'
});
```

**Returns:** Promise that resolves with classification results or rejects if cancelled

**Dialog Options:**
- `title`: Custom dialog title
- `width`: Dialog width (CSS value)
- `height`: Dialog height (CSS value)

### closeDialog(save = false)

Programmatically closes the dialog.

```javascript
clasificame.closeDialog(true);  // Save and close
clasificame.closeDialog(false); // Cancel and close
```

### getValue()

Returns the current classification state without closing the dialog.

```javascript
const currentState = clasificame.getValue();
// Returns: { category_id: ['item_id_1', 'item_id_2'], ... }
```

### search(searchTerm)

Filters visible items based on search term.

```javascript
clasificame.search('john'); // Shows only items containing 'john'
clasificame.search('');     // Shows all items
```

### applyClassification(classificationId)

Applies a saved classification template.

```javascript
await clasificame.applyClassification('template_id');
```

### applyGroupClassification(groupId, targetCategory)

Moves all items from a group to a specific category.

```javascript
clasificame.applyGroupClassification('admin_group', 'write_access');
```

## Public Properties

| Property | Type | Description |
|----------|------|-------------|
| `categories` | Array | Current categories array |
| `items` | Array | Current items array |
| `options` | Object | Current options configuration |
| `currentValues` | Object | Current classification state |
| `isOpen` | Boolean | Whether dialog is currently open |
| `selectedGroupItems` | Array | Currently selected group items |

## Usage Examples

### Basic Editable Classification  Example code

```javascript
const categories = [
    { id: 'none', label: 'X', title: 'No Access' },
    { id: 'read', label: 'R', title: 'Read Only' },
    { id: 'write', label: 'RW', title: 'Read/Write' }
];

const users = [
    { id: 1, name: 'John Doe', category: 'none' },
    { id: 2, name: 'Jane Smith', category: 'read' }
];

const clasificame = new ocClasificame(categories, users, {
    title: 'User Permissions',
    editable: true,
    showToolbar: true
});

try {
    const result = await clasificame.openDialog();
    console.log('Saved classification:', result);
    // Result: { none: ['1'], read: ['2'], write: [] }
} catch (error) {
    console.log('User cancelled');
}
```

### Read-Only Mode Example code

```javascript
const clasificame = new ocClasificame(categories, users, {
    title: 'View Permissions',
    editable: false,
    showToolbar: false
});

try {
    await clasificame.openDialog();
    console.log('Dialog closed');
} catch (error) {
    console.log('Dialog closed');
}
```

### With Template Management Example code

```javascript
// @example
const savedTemplates = [
    {
        id: '1',
        name: 'Admin Setup',
        description: 'Standard admin configuration',
        classification: {
            none: ['1'],
            read: ['2'],
            write: ['3']
        }
    }
];

const clasificame = new ocClasificame(categories, users, {
    title: 'User Permissions',
    editable: true,
    savedClassifications: savedTemplates,
    showPlantillaMethod: true,
    canSavePlantillaMethod: true
});
```

### With Group Management Example code

```javascript
const groups = [
    { id: 'admins', name: 'Administrators', itemCount: 2 },
    { id: 'users', name: 'Regular Users', itemCount: 5 }
];

const clasificame = new ocClasificame(categories, users, {
    title: 'User Permissions',
    editable: true,
    showGroupMethod: true,
    crudGroupMethod: true,
    groups: groups
});
```

### Custom Default Category Example code

```javascript
const clasificame = new ocClasificame(categories, users, {
    title: 'User Permissions',
    unassignedDefaultTo: 'read', // Items with invalid categories go to 'read'
    editable: true
});
```

## ocClasificame Widget Event Handling

### Success (Save)

```javascript
try {
    const result = await clasificame.openDialog();
    // User clicked Save or pressed a save action
    console.log('Classification saved:', result);
    
    // Process the result
    Object.entries(result).forEach(([categoryId, itemIds]) => {
        console.log(`Category ${categoryId}:`, itemIds);
    });
} catch (error) {
    // Handle cancellation
}
```

### ocClasificame Widget Cancellation

The Promise rejects in these scenarios:
- User clicks "Cancel" button
- User clicks the "X" close button
- User presses Escape key (native dialog behavior)
- `closeDialog(false)` is called programmatically

```javascript
try {
    const result = await clasificame.openDialog();
    // Success handling
} catch (error) {
    if (error.message === 'User cancelled') {
        console.log('User cancelled the classification');
        // Handle cancellation (e.g., revert changes, show message)
    }
}
```

## ocClasificame Widget CSS Customization

The widget uses CSS classes prefixed with `oc-`. Key classes:

- `.oc-dialog` - Main dialog container
- `.oc-readonly` - Applied in read-only mode
- `.oc-item` - Individual items
- `.oc-item-readonly` - Read-only items
- `.oc-column` - Category columns
- `.oc-classification-manager` - Template management area
- `.oc-group-section` - Group management area

## ocClasificame Widget Browser Compatibility

- Requires modern browser with support for:
  - ES6 classes and async/await
  - Native `<dialog>` element (or polyfill)
  - CSS Grid and Flexbox
  - SortableJS library for drag-and-drop

## Dependencies

- **SortableJS**: Required for drag-and-drop functionality See `../docs/sortablejs_guide.md` for api, options and event summary
- **Font Awesome**: Optional, for icons in UI buttons

## ocClasificame Widget Best Practices

1. **Set appropriate default category** using `unassignedDefaultTo` for data integrity
2. **Use read-only mode** for display-only scenarios to prevent accidental changes


## ocClasificame Widget Error Handling

Common error scenarios:
- Empty categories array → Widget initialization fails
- Invalid category references in items → Items moved to default category
- Missing required properties in items → Items may not display correctly
- Network errors in template/group operations → User should retry

Always wrap `openDialog()` calls in try-catch blocks and provide appropriate user feedback.
