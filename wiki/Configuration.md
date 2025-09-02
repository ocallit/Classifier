# Configuration Guide

Complete reference for all configuration options available in ocClasificame.

## 📋 Overview

The ocClasificame widget is highly configurable through the options parameter in the constructor:

```javascript
const classifier = new ocClasificame(categories, items, options);
```

## 🔧 Core Configuration

### Basic Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | String | `'Classification'` | Dialog window title |
| `que_clasifica` | String | `'producto'` | Type identifier for API/database operations |
| `que_clasifica_label` | String | `'Items'` | Plural label for items in the UI |
| `valueId` | String | `'id'` | Property name for item unique identifier |
| `valueDisplay` | String | `'name'` | Property name for item display text |
| `itemsCategoryIdKey` | String | `'category'` | Property name for item's current category |

#### Example: Basic Configuration
```javascript
const options = {
    title: 'User Permission Management',
    que_clasifica: 'usuario',
    que_clasifica_label: 'Users',
    valueId: 'userId',
    valueDisplay: 'fullName',
    itemsCategoryIdKey: 'permission'
};
```

### Behavior Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `editable` | Boolean | `true` | Whether items can be moved/modified |
| `showToolbar` | Boolean | `true` | Show individual item action buttons |
| `debug` | Boolean | `false` | Enable console debug logging |
| `unassignedDefaultTo` | String/null | `null` | Default category for invalid/missing categories |

#### Example: Read-Only Configuration
```javascript
const readOnlyOptions = {
    title: 'Current Status (Read-Only)',
    editable: false,
    showToolbar: false,
    que_clasifica_label: 'Tasks'
};
```

## 🎨 UI Customization

### Dialog Options

Configure the dialog appearance and behavior:

```javascript
// Dialog options passed to openDialog()
const dialogOptions = {
    title: 'Custom Dialog Title',    // Override default title
    width: '90vw',                   // Custom width
    height: '80vh'                   // Custom height
};

await classifier.openDialog(dialogOptions);
```

### Default Category Handling

Control how items with invalid categories are handled:

```javascript
const options = {
    unassignedDefaultTo: 'pending',  // Specific category
    // OR
    unassignedDefaultTo: null        // Use first category (default)
};
```

**Scenarios where this matters:**
- Items with `null` or `undefined` category
- Items with category IDs that don't exist in categories array
- Items with empty string categories
- New items without assigned categories

## 📋 Template Management

### Basic Template Configuration

```javascript
const templateOptions = {
    showPlantillaMethod: true,       // Enable template features
    canSavePlantillaMethod: false,   // Allow creating new templates
    savedClassifications: []         // Array of saved templates
};
```

### Saved Classifications Structure

```javascript
const savedClassifications = [
    {
        id: 'template_1',
        name: 'Standard Setup',
        description: 'Default classification for new projects',
        classification: {
            category1: ['item1', 'item2'],
            category2: ['item3'],
            category3: []
        }
    }
];
```

### Complete Template Example

```javascript
const templateClassifier = new ocClasificame(categories, items, {
    title: 'Template-Enabled Classification',
    showPlantillaMethod: true,
    canSavePlantillaMethod: true,
    savedClassifications: [
        {
            id: 'quick_setup',
            name: 'Quick Setup',
            description: 'Fast configuration for common use cases',
            classification: {
                todo: ['task1', 'task3'],
                doing: ['task2'],
                done: ['task4']
            }
        }
    ]
});
```

## 👥 Group Management

### Basic Group Configuration

```javascript
const groupOptions = {
    showGroupMethod: true,          // Enable group features
    crudGroupMethod: false,         // Allow group creation/editing
    groups: []                      // Array of available groups
};
```

### Group Structure

```javascript
const groups = [
    {
        id: 'team_alpha',
        name: 'Team Alpha',
        itemCount: 5,
        description: 'Frontend development team',
        isEditable: true
    },
    {
        id: 'team_beta',
        name: 'Team Beta',
        itemCount: 8,
        description: 'Backend development team',
        isEditable: true
    }
];
```

### Advanced Group Configuration

```javascript
const advancedGroupClassifier = new ocClasificame(categories, items, {
    title: 'Advanced Group Management',
    showGroupMethod: true,
    crudGroupMethod: true,          // Enable group CRUD operations
    groups: groups,
    editable: true
});
```

## 🌐 API Integration

### API Endpoints Configuration

```javascript
const apiOptions = {
    apiEndpoints: {
        save: '/api/classifications/save',
        load: '/api/classifications/list',
        getGroups: '/api/groups/list',
        getGroupItems: '/api/groups/:groupId/items',
        saveGroup: '/api/groups/save',
        deleteGroup: '/api/groups/delete'
    }
};
```

### Custom API Configuration

```javascript
const customApiClassifier = new ocClasificame(categories, items, {
    title: 'Custom API Integration',
    apiEndpoints: {
        save: '/custom/save-classification',
        load: '/custom/load-templates',
        getGroups: '/custom/groups',
        getGroupItems: '/custom/groups/:id/members',
        saveGroup: '/custom/groups/create',
        deleteGroup: '/custom/groups/:id/delete'
    }
});
```

## 🔄 Mode Combinations

### Individual Classification Only

```javascript
const individualOnly = new ocClasificame(categories, items, {
    title: 'Individual Classification',
    showPlantillaMethod: true,
    canSavePlantillaMethod: false,
    showGroupMethod: false,
    crudGroupMethod: false
});
```

### Group Classification Only

```javascript
const groupOnly = new ocClasificame(categories, items, {
    title: 'Group Classification',
    showPlantillaMethod: false,
    canSavePlantillaMethod: false,
    showGroupMethod: true,
    crudGroupMethod: true,
    groups: availableGroups
});
```

### Full Featured Mode

```javascript
const fullFeatured = new ocClasificame(categories, items, {
    title: 'Complete Classification System',
    showPlantillaMethod: true,
    canSavePlantillaMethod: true,
    showGroupMethod: true,
    crudGroupMethod: true,
    savedClassifications: templates,
    groups: groups,
    editable: true,
    showToolbar: true
});
```

### Read-Only Display Mode

```javascript
const readOnlyDisplay = new ocClasificame(categories, items, {
    title: 'Status Dashboard',
    editable: false,
    showToolbar: false,
    showPlantillaMethod: false,
    showGroupMethod: false
});
```

## 📱 Responsive Configuration

### Mobile-Optimized Settings

```javascript
const mobileClassifier = new ocClasificame(categories, items, {
    title: 'Mobile Classification',
    editable: true,
    showToolbar: true,          // Buttons are easier than drag on mobile
    showPlantillaMethod: false, // Simplify interface for mobile
    showGroupMethod: false
});
```

### Tablet Configuration

```javascript
const tabletClassifier = new ocClasificame(categories, items, {
    title: 'Tablet Classification',
    editable: true,
    showToolbar: true,
    showPlantillaMethod: true,
    showGroupMethod: false      // Moderate complexity for tablet
});
```

## ⚡ Performance Configuration

### Large Dataset Configuration

```javascript
const largeDatasetClassifier = new ocClasificame(categories, items, {
    title: 'Large Dataset Classification',
    editable: true,
    showToolbar: false,         // Reduce DOM elements
    showPlantillaMethod: true,
    showGroupMethod: true,      // Use groups for bulk operations
    debug: false                // Disable debug logging
});
```

### Minimal Configuration

```javascript
const minimalClassifier = new ocClasificame(categories, items, {
    title: 'Minimal Classification',
    editable: true,
    showToolbar: false,
    showPlantillaMethod: false,
    showGroupMethod: false,
    debug: false
});
```

## 🎛️ Advanced Options

### Custom Property Names

```javascript
const customPropertiesClassifier = new ocClasificame(categories, items, {
    title: 'Custom Properties',
    valueId: 'uuid',            // Instead of 'id'
    valueDisplay: 'title',      // Instead of 'name'
    itemsCategoryIdKey: 'status' // Instead of 'category'
});

// Corresponding item structure:
const customItems = [
    { uuid: '123', title: 'Custom Item', status: 'active' }
];
```

### Multi-Language Support

```javascript
const spanishClassifier = new ocClasificame(categories, items, {
    title: 'Clasificación de Elementos',
    que_clasifica: 'elemento',
    que_clasifica_label: 'Elementos'
});

const frenchClassifier = new ocClasificame(categories, items, {
    title: 'Classification des Éléments',
    que_clasifica: 'element',
    que_clasifica_label: 'Éléments'
});
```

## 🔍 Debug Configuration

### Development Mode

```javascript
const devClassifier = new ocClasificame(categories, items, {
    title: 'Development Classification',
    debug: true,                // Enable console logging
    editable: true,
    showToolbar: true,
    showPlantillaMethod: true,
    canSavePlantillaMethod: true
});
```

### Production Mode

```javascript
const prodClassifier = new ocClasificame(categories, items, {
    title: 'Production Classification',
    debug: false,               // Disable console logging
    editable: true,
    showToolbar: true,
    showPlantillaMethod: true,
    canSavePlantillaMethod: false // Prevent template creation in prod
});
```

## 📊 Configuration Examples by Use Case

### HR Department - Employee Classification

```javascript
const hrClassifier = new ocClasificame(departments, employees, {
    title: 'Employee Department Assignment',
    que_clasifica: 'empleado',
    que_clasifica_label: 'Employees',
    valueId: 'employeeId',
    valueDisplay: 'fullName',
    itemsCategoryIdKey: 'departmentId',
    editable: true,
    showToolbar: true,
    showPlantillaMethod: true,
    savedClassifications: hrTemplates,
    unassignedDefaultTo: 'unassigned'
});
```

### IT Department - Server Management

```javascript
const serverClassifier = new ocClasificame(environments, servers, {
    title: 'Server Environment Assignment',
    que_clasifica: 'servidor',
    que_clasifica_label: 'Servers',
    valueId: 'serverId',
    valueDisplay: 'hostname',
    itemsCategoryIdKey: 'environment',
    editable: true,
    showGroupMethod: true,
    groups: serverGroups,
    unassignedDefaultTo: 'staging'
});
```

### Project Management - Task Assignment

```javascript
const taskClassifier = new ocClasificame(taskStatuses, tasks, {
    title: 'Task Status Management',
    que_clasifica: 'tarea',
    que_clasifica_label: 'Tasks',
    valueId: 'taskId',
    valueDisplay: 'taskName',
    itemsCategoryIdKey: 'status',
    editable: true,
    showToolbar: true,
    showPlantillaMethod: true,
    showGroupMethod: true,
    canSavePlantillaMethod: true,
    crudGroupMethod: true,
    savedClassifications: sprintTemplates,
    groups: teams,
    unassignedDefaultTo: 'backlog'
});
```

## ⚠️ Configuration Validation

### Required Options

These combinations will cause issues:

```javascript
// ❌ Bad: Empty categories array
const badClassifier = new ocClasificame([], items, options);

// ❌ Bad: Mismatched property names
const badOptions = {
    valueId: 'id',
    valueDisplay: 'name',
    itemsCategoryIdKey: 'category'
};
const badItems = [
    { userId: 1, title: 'Item', status: 'active' } // Wrong property names
];

// ❌ Bad: Group method without groups
const badGroupOptions = {
    showGroupMethod: true,
    groups: [] // Empty groups array
};
```

### Best Practices

```javascript
// ✅ Good: Validate data before creating classifier
function createClassifier(categories, items, customOptions = {}) {
    // Validate required data
    if (!categories || categories.length === 0) {
        throw new Error('Categories array cannot be empty');
    }
    
    if (!items || !Array.isArray(items)) {
        throw new Error('Items must be an array');
    }
    
    // Merge with defaults
    const defaultOptions = {
        title: 'Classification',
        editable: true,
        showToolbar: true,
        debug: false
    };
    
    const options = { ...defaultOptions, ...customOptions };
    
    return new ocClasificame(categories, items, options);
}
```

## 📚 Next Steps

Now that you understand the configuration options:

- **[Examples & Tutorials](Examples.md)** - See configurations in action
- **[Template Management](Template-Management.md)** - Advanced template features
- **[Group Management](Group-Management.md)** - Bulk operation details
- **[Customization](Customization.md)** - Styling and theming
- **[API Reference](../docs/oc_clasificame_docs.md)** - Complete method documentation

---

**Need help with a specific configuration?** Check out our [Examples](Examples.md) or review the [Troubleshooting Guide](Troubleshooting.md).