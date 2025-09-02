# Basic Concepts

Understand the fundamental concepts and components of ocClasificame.

## 🏗️ Core Architecture

ocClasificame is built around three main concepts:

1. **Categories** - The classification buckets or columns
2. **Items** - The objects being classified  
3. **Classification State** - The current assignment of items to categories

## 📊 Categories

Categories define the classification structure - they are the "buckets" or "columns" where items can be placed.

### Category Structure

```javascript
const category = {
    id: 'unique_identifier',    // Unique ID for the category
    label: 'Short Label',       // Short text for buttons (e.g., 'RW')
    title: 'Full Title'         // Full name for column headers (e.g., 'Read/Write')
};
```

### Examples

```javascript
// Permission categories
const permissions = [
    { id: 'none', label: '❌', title: 'No Access' },
    { id: 'read', label: '👀', title: 'Read Only' },
    { id: 'write', label: '✏️', title: 'Read/Write' },
    { id: 'admin', label: '👑', title: 'Administrator' }
];

// Task status categories
const taskStatuses = [
    { id: 'backlog', label: '📋', title: 'Backlog' },
    { id: 'todo', label: '📝', title: 'To Do' },
    { id: 'doing', label: '🔄', title: 'In Progress' },
    { id: 'review', label: '👀', title: 'Review' },
    { id: 'done', label: '✅', title: 'Done' }
];

// Product categories
const productCategories = [
    { id: 'electronics', label: '💻', title: 'Electronics' },
    { id: 'clothing', label: '👕', title: 'Clothing' },
    { id: 'books', label: '📚', title: 'Books' },
    { id: 'home', label: '🏠', title: 'Home & Garden' }
];
```

### Category Best Practices

- **Use meaningful IDs**: Choose IDs that make sense in your domain
- **Keep labels short**: Labels appear on buttons and should be concise
- **Make titles descriptive**: Titles are column headers and can be longer
- **Consider icons**: Emojis or Font Awesome icons enhance usability
- **Plan for growth**: Design categories that can scale with your needs

## 📦 Items

Items are the objects being classified. They represent the data you want to organize into categories.

### Item Structure

```javascript
const item = {
    id: 'unique_identifier',        // Unique ID for the item
    name: 'Display Name',           // What users see in the interface
    category: 'current_category_id' // Current category assignment
};
```

### Configurable Properties

The property names are configurable through options:

```javascript
const options = {
    valueId: 'id',              // Property name for unique identifier
    valueDisplay: 'name',       // Property name for display text
    itemsCategoryIdKey: 'category' // Property name for current category
};

// This allows for different data structures:
const customItem = {
    userId: 123,                // valueId: 'userId'
    fullName: 'John Doe',       // valueDisplay: 'fullName'
    permission: 'read'          // itemsCategoryIdKey: 'permission'
};
```

### Examples

```javascript
// User permissions
const users = [
    { id: 1, name: 'John Doe', category: 'read' },
    { id: 2, name: 'Jane Smith', category: 'write' },
    { id: 3, name: 'Bob Admin', category: 'admin' }
];

// Project tasks
const tasks = [
    { id: 't1', name: 'Design homepage', category: 'doing' },
    { id: 't2', name: 'Write API docs', category: 'todo' },
    { id: 't3', name: 'Setup CI/CD', category: 'done' }
];

// E-commerce products
const products = [
    { id: 'p1', name: 'Laptop Computer', category: 'electronics' },
    { id: 'p2', name: 'Blue Jeans', category: 'clothing' },
    { id: 'p3', name: 'Programming Book', category: 'books' }
];

// Custom structure
const employees = [
    { empId: 'E001', fullName: 'Alice Johnson', dept: 'engineering' },
    { empId: 'E002', fullName: 'Bob Wilson', dept: 'marketing' },
    { empId: 'E003', fullName: 'Carol Davis', dept: 'sales' }
];

// Configuration for custom structure
const customOptions = {
    valueId: 'empId',
    valueDisplay: 'fullName',
    itemsCategoryIdKey: 'dept'
};
```

### Item Validation

The widget handles various edge cases:

```javascript
const itemsWithIssues = [
    { id: 1, name: 'Valid Item', category: 'valid_category' },
    { id: 2, name: 'No Category' },                           // Missing category
    { id: 3, name: 'Null Category', category: null },          // Null category
    { id: 4, name: 'Invalid Category', category: 'invalid' },  // Non-existent category
    { id: 5, name: 'Empty Category', category: '' }            // Empty category
];

// Items with issues are automatically moved to the default category
const options = {
    unassignedDefaultTo: 'pending' // Specify default category
    // OR leave null to use first category
};
```

## 🔄 Classification State

The classification state represents the current assignment of items to categories.

### State Format

The widget maintains and returns state as an object:

```javascript
const classificationState = {
    category1: ['item1', 'item3', 'item5'],  // Array of item IDs
    category2: ['item2', 'item4'],
    category3: []                            // Empty category
};
```

### Getting Current State

```javascript
// Get current state without closing dialog
const currentState = classifier.getValue();

// Get final state when saving
try {
    const finalState = await classifier.openDialog();
    console.log('Final classification:', finalState);
} catch (error) {
    console.log('User cancelled');
}
```

### State Operations

```javascript
// Initialize with existing state
const items = [
    { id: 1, name: 'Item 1', category: 'category1' },
    { id: 2, name: 'Item 2', category: 'category2' }
];

// Programmatically change state
classifier._moveItemTo('1', 'category2');

// Apply saved template
await classifier.applyClassification('template_id');

// Apply group classification
classifier.applyGroupClassification('group_id', 'target_category');
```

## 🎛️ Modes and Features

### Classification Modes

**Individual Mode:**
- Move items one by one
- Use drag-and-drop or action buttons
- Fine-grained control

**Template Mode:**
- Save and load classification setups
- Quick application of common patterns
- Reusable configurations

**Group Mode:**
- Bulk operations on predefined groups
- Efficient for large datasets
- Team or category-based operations

### Interaction Methods

**Drag and Drop:**
```javascript
// Enabled by default when editable: true
const dragDropClassifier = new ocClasificame(categories, items, {
    editable: true  // Enables drag-and-drop
});
```

**Action Buttons:**
```javascript
// Individual item buttons for each category
const buttonClassifier = new ocClasificame(categories, items, {
    showToolbar: true  // Shows category buttons on each item
});
```

**Navigation Buttons:**
```javascript
// Move all visible items between adjacent categories
// Automatically available in editable mode
// Shows arrows to move items left/right
```

**Search and Filter:**
```javascript
// Real-time search through item names
classifier.search('search term');

// Automatically filters visible items
// Updates counters accordingly
```

## 🎨 User Interface Components

### Dialog Structure

```
┌─────────────────────────────────────┐
│ Dialog Header (Title + Close)       │
├─────────────────────────────────────┤
│ Management Section (Optional)       │
│ - Templates or Groups               │
├─────────────────────────────────────┤
│ Search Bar + Statistics             │
├─────────────────────────────────────┤
│ Classification Columns              │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │
│ │Cat 1│ │Cat 2│ │Cat 3│ │Cat 4│    │
│ │Items│ │Items│ │Items│ │Items│    │
│ │ ... │ │ ... │ │ ... │ │ ... │    │
│ └─────┘ └─────┘ └─────┘ └─────┘    │
├─────────────────────────────────────┤
│ Footer (Cancel + Save buttons)      │
└─────────────────────────────────────┘
```

### Column Structure

Each category becomes a column with:
- **Header**: Category title
- **Items List**: Scrollable container with items
- **Navigation**: Counter, sort button, move buttons
- **Drop Zone**: Accepts dragged items

### Item Structure

Each item displays:
- **Label**: Item display name
- **Toolbar**: Category action buttons (if enabled)
- **Visual State**: Highlighting, selection, etc.

## 🔧 Configuration Patterns

### Read-Only Display

```javascript
const readOnlyClassifier = new ocClasificame(categories, items, {
    editable: false,        // Disable all modifications
    showToolbar: false      // Hide action buttons
});
```

### Minimal Interface

```javascript
const minimalClassifier = new ocClasificame(categories, items, {
    showPlantillaMethod: false,  // No template features
    showGroupMethod: false,      // No group features
    showToolbar: false          // No individual buttons
});
```

### Full-Featured Interface

```javascript
const fullClassifier = new ocClasificame(categories, items, {
    showPlantillaMethod: true,
    canSavePlantillaMethod: true,
    showGroupMethod: true,
    crudGroupMethod: true,
    savedClassifications: templates,
    groups: groups
});
```

## 🌊 Data Flow

Understanding how data flows through the widget:

```
Input Data
    ↓
Validation & Initialization
    ↓
UI Rendering
    ↓
User Interactions
    ↓
State Updates
    ↓
Output Results
```

### Detailed Flow

1. **Initialization**:
   - Validate categories and items
   - Initialize classification state
   - Set up default category handling

2. **UI Creation**:
   - Generate HTML structure
   - Apply styling and responsive design
   - Setup event listeners

3. **User Interaction**:
   - Handle drag-and-drop events
   - Process button clicks
   - Update search filters

4. **State Management**:
   - Update internal state
   - Refresh UI counters
   - Maintain data consistency

5. **Result Generation**:
   - Collect final state
   - Format output data
   - Handle save/cancel actions

## 🎯 Use Case Patterns

### Workflow Management

```javascript
// Items progress through stages
const workflowStages = [
    { id: 'new', label: 'New', title: 'New Requests' },
    { id: 'review', label: 'Review', title: 'Under Review' },
    { id: 'approved', label: 'Approved', title: 'Approved' },
    { id: 'completed', label: 'Done', title: 'Completed' }
];
```

### Access Control

```javascript
// Users assigned to permission levels
const accessLevels = [
    { id: 'denied', label: '🚫', title: 'Access Denied' },
    { id: 'limited', label: '🔒', title: 'Limited Access' },
    { id: 'full', label: '🔓', title: 'Full Access' }
];
```

### Content Organization

```javascript
// Content sorted by status or category
const contentTypes = [
    { id: 'draft', label: '✏️', title: 'Draft' },
    { id: 'published', label: '🌐', title: 'Published' },
    { id: 'archived', label: '📦', title: 'Archived' }
];
```

## 🚀 Next Steps

Now that you understand the basic concepts:

1. **[Quick Start Guide](Quick-Start.md)** - Build your first classification
2. **[Configuration Guide](Configuration.md)** - Explore all options
3. **[Examples & Tutorials](Examples.md)** - See real-world implementations
4. **[Template Management](Template-Management.md)** - Learn about templates
5. **[Group Management](Group-Management.md)** - Understand group operations

---

**Questions about concepts?** Check out our [Examples](Examples.md) to see these concepts in action, or review the [API Reference](../docs/oc_clasificame_docs.md) for technical details.