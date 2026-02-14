# Tom Select Complete Documentation Guide

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Installation](#installation)
4. [Basic Usage](#basic-usage)
5. [Configuration Options](#configuration-options)
   - [General Configuration](#general-configuration)
   - [Data / Searching Configuration](#data--searching-configuration)
6. [Callbacks](#callbacks)
7. [Render Templates](#render-templates)
8. [Working with Options Array](#working-with-options-array)
9. [Remote Data Loading](#remote-data-loading)
10. [API Methods](#api-methods)
11. [Plugins](#plugins)
12. [Common Examples](#common-examples)
13. [CSS Styling](#css-styling)
14. [Event Handling](#event-handling)
15. [Form Integration](#form-integration)
16. [Performance Optimization](#performance-optimization)
17. [Accessibility](#accessibility)
18. [Troubleshooting](#troubleshooting)
19. [Browser Support](#browser-support)

## Overview

Tom Select is a dynamic, framework agnostic, and lightweight (~16kb gzipped) `<select>` UI control. With autocomplete and native-feeling keyboard navigation, it's useful for tagging, contact lists, country selectors, and so on. Tom Select was forked from selectize.js with four main objectives: modernizing the code base, decoupling from jQuery, expanding functionality, and addressing issue backlogs.

## Key Features

- Smart Option Searching / Ranking - Options are efficiently scored and sorted on-the-fly (using sifter)
- Caret between items - Order matters sometimes. With the Caret Position Plugin, you can use the ← and → arrow keys to move between selected items
- Select & delete multiple items at once - Hold down command on Mac or ctrl on Windows to select more than one item to delete
- Díåcritîçs supported - Great for international environments
- Item creation - Allow users to create items on the fly (async saving is supported; the control locks until the callback is fired)
- Remote data loading - For when you have thousands of options and want them provided by the server as the user types
- Extensible - Plugin API for developing custom features (uses microplugin)
- Accessible, Touch Support, Clean API

## Installation

### CDN (Recommended for quick setup)

```html
<link href="https://cdn.jsdelivr.net/npm/tom-select@2.4.3/dist/css/tom-select.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/tom-select@2.4.3/dist/js/tom-select.complete.min.js"></script>
```

### NPM

```bash
npm i tom-select
```

### Available Files

- **tom-select.complete.js** — Includes dependencies and plugins
- **tom-select.base.js** — Does not include any plugins
- **CSS** — Compiled themes
- **SCSS** — Uncompiled theme sources

## Basic Usage

### Single Instance

```html
<script src="tom-select.complete.js"></script>
<link href="tom-select.bootstrap4.css" rel="stylesheet" />
<input id="select" />
<script>
var settings = {};
new TomSelect('#select',settings);
</script>
```

### Multiple Instances

```html
<script src="tom-select.complete.js"></script>
<link href="tom-select.bootstrap4.css" rel="stylesheet" />
<input class="select" /> ... <input class="select" />
<script>
document.querySelectorAll('.select').forEach((el)=>{
let settings = {};
new TomSelect(el,settings);
});
</script>
```

### Basic Example with HTML Select

```html
<input id="tom-select-it" />
<link rel="stylesheet" href="/css/tom-select.default.css">
<script src="/js/tom-select.complete.js"></script>
<script>
var settings = {};
new TomSelect('#tom-select-it',settings);
</script>
```

## Configuration Options

### General Configuration

| Setting | Description | Type | Default |
|---------|-------------|------|---------|
| options | By default this is populated from the original `<input>` or `<select>` element | array | [] |
| items | An array of the initial selected values. By default this is populated from the original input element | array | [] |
| create | Determines if the user is allowed to create new items that aren't in the initial list of options. This setting can be any of the following: true, false, or a function | boolean\|function | false |
| createOnBlur | If true, when user exits the field (clicks outside of input), a new option is created and selected (if create setting is enabled) | boolean | false |
| createFilter | Specifies a RegExp or a string containing a regular expression that the current search filter must match to be allowed to be created. May also be a predicate function that takes the filter text and returns whether it is allowed | RegExp\|string\|function | null |
| delimiter | The string to separate items by. When typing an item in a multi-selection control allowing creation, then the delimiter, the item is added | string | ',' |
| highlight | Toggles match highlighting within the dropdown menu | boolean | true |
| persist | If false, items created by the user will not show up as available options once they are unselected | boolean | true |
| openOnFocus | Show the dropdown immediately when the control receives focus | boolean | true |
| maxOptions | The max number of options to display in the dropdown. Set maxOptions to null for an unlimited number of options | int | 50 |
| maxItems | The max number of items the user can select. A value of 1 makes the control mono-selection, null allows an unlimited number of items | int | null |
| hideSelected | If true, the items that are currently selected will not be shown in the dropdown list of available options | boolean | null |
| closeAfterSelect | After a selection is made, the dropdown will remain open if in a multi-selection control or will close in a single-selection control | boolean | undefined |
| allowEmptyOption | If true, any options with a "" value will be treated like normal | boolean | false |
| loadThrottle | The number of milliseconds to wait before requesting options from the server or null | int | 300 |
| loadingClass | The class name added to the wrapper element while awaiting the fulfillment of load requests | string | 'loading' |
| placeholder | The placeholder of the control. Defaults to input element's placeholder, unless this one is specified | string | undefined |
| hidePlaceholder | If true, the placeholder will be hidden when the control has one or more items | boolean | null |
| preload | If true, the load function will be called upon control initialization (with an empty search) | boolean\|string | false |
| dropdownParent | The element the dropdown menu is appended to. If null, the dropdown will be appended as a child of the control | string | null |
| addPrecedence | If true, the "Add..." option is the default selection in the dropdown | boolean | false |
| selectOnTab | If true, the tab key will choose the currently selected item | boolean | false |
| diacritics | Enable or disable international character support | boolean | true |
| duplicates | Allow selecting the same option more than once. hideSelected should also be set to false | boolean | false |
| controlInput | Supply a custom `<input>` element. Supplying a null value will disable the default functionality | HTMLElement\|null | `<input...>` |
| inputClass | CSS class to add to the input | string | 'items' |
| itemClass | CSS class to add to selected items | string | 'item' |
| optionClass | CSS class to add to dropdown options | string | 'option' |
| dropdownClass | CSS class to add to the dropdown | string | 'dropdown-content' |
| wrapperClass | CSS class to add to the control wrapper | string | 'ts-wrapper' |

**Valid Values for Key Settings:**

- **create**: `false`, `true`, or `function(input) { return {value: input, text: input}; }`
- **preload**: `false`, `true`, or `'focus'`
- **searchConjunction**: `'and'` or `'or'`
- **dropdownParent**: CSS selector string, HTMLElement, or `null`

### Data / Searching Configuration

| Setting | Description | Type | Default |
|---------|-------------|------|---------|
| optgroups | Option groups that options will be bucketed into | array | [] |
| dataAttr | The `<option>` attribute from which to read JSON data about the option | string | null |
| valueField | The name of the property to use as the value when an item is selected | string | 'value' |
| optgroupValueField | The name of the option group property that serves as its unique identifier | string | 'value' |
| labelField | The name of the property to render as an option / item label | string | 'text' |
| optgroupLabelField | The name of the property to render as an option group label | string | 'label' |
| optgroupField | The name of the property to group items by | string | 'optgroup' |
| disabledField | The name of the property to disabled option and optgroup | string | 'disabled' |
| sortField | sortField maps directly to the sort setting in Sifter | string | [{field:'$score'}, {field:'$order'}] |
| searchField | An array of property names to analyze when filtering options | array | ['text'] |
| searchConjunction | When searching for multiple terms (separated by space), this is the operator used. Can be 'and' or 'or' | string | 'and' |
| lockOptgroupOrder | If truthy, all optgroups will be displayed in the same order as they were added | boolean | false |
| copyClassesToDropdown | Copy the original input classes to the dropdown element | boolean | true |

**Valid Values for Key Settings:**

- **valueField**: Any string representing a property name (default: `'value'`)
- **labelField**: Any string representing a property name (default: `'text'`)
- **searchField**: Array of strings `['field1', 'field2']` or single string `'field'`
- **sortField**: String, array, or object format: `[{field:'$score'}, {field:'$order'}]`
- **disabledField**: Any string representing a property name (default: `'disabled'`)
- **optgroupField**: Any string representing a property name (default: `'optgroup'`)

### Option Object Structure

Tom Select expects option objects to follow this structure:

```javascript
{
  value: 'unique_id',        // Used as the item value (valueField)
  text: 'Display Label',     // Used as the display text (labelField)
  disabled: false,           // Optional: disable this option
  optgroup: 'group_name',    // Optional: group this option
  // Any custom properties can be added and used in render templates
  customProperty: 'value'
}
```

## Callbacks

Available callback functions that can be used with Tom Select:

- `load(query, callback)` - Invoked when new options should be loaded from the server
- `shouldLoad(query)` - callback to implement minimum input length or other input validation
- `score(search)` - Custom scoring function for search results
- `onInitialize()` - Invoked once the control is completely initialized
- `onFocus()` - When the control gains focus
- `onBlur()` - When the control loses focus
- `onChange(value)` - When the value changes
- `onItemAdd(value, $item)` - When an item is added
- `onItemRemove(value, $item)` - When an item is removed
- `onClear()` - When the control is cleared
- `onDelete(values, event)` - When items are deleted
- `onOptionAdd(value, data)` - When an option is added
- `onOptionRemove(value)` - When an option is removed
- `onDropdownOpen(dropdown)` - When the dropdown opens
- `onDropdownClose(dropdown)` - When the dropdown closes
- `onType(str)` - When the user types
- `onLoad(options, optgroup)` - When options are loaded

### Example with Callback

```javascript
new TomSelect('#select',{
onInitialize:function(){
// the onInitialize callback is invoked once the control is completely initialized.
}
});
```

## Render Templates

Nearly every piece of HTML in Tom Select is customizable with a render template. Each template is defined by a function that is passed two arguments (data and escape) and returns NodeDefinition with a single root element. The escape argument is a function that takes a string and escapes all special HTML characters. This is very important to use to prevent XSS vulnerabilities.

### Available Render Templates

| Setting | Description | Type | Default |
|---------|-------------|------|---------|
| render.option | An option in the dropdown list of available options | function | null |
| render.item | An item the user has selected | function | null |
| render.option_create | The "create new" option at the bottom of the dropdown | function | null |
| render.optgroup_header | The header of an option group | function | null |
| render.optgroup | The wrapper for an optgroup | function | null |
| render.no_results | Displayed when no options are found matching a user's search | function | null |
| render.loading | Displayed when the load() method is called | function | null |
| render.dropdown | Where dropdown content will be displayed | function | null |

### Example with Custom Render Templates

```javascript
new TomSelect('#input',{
optionClass: 'option',
itemClass: 'item',
render:{
option: function(data, escape) {
return '<div>' + escape(data.text) + '</div>';
},
item: function(data, escape) {
return '<div>' + escape(data.text) + '</div>';
},
option_create: function(data, escape) {
return '<div class="create">Add <strong>' + escape(data.input) + '</strong>…</div>';
},
no_results:function(data,escape){
return '<div class="no-results">No results found for "'+escape(data.input)+'"</div>';
},
not_loading:function(data,escape){
// no default content
},
optgroup: function(data) {
let optgroup = document.createElement('div');
optgroup.className = 'optgroup';
optgroup.appendChild(data.options);
return optgroup;
},
optgroup_header: function(data, escape) {
return '<div class="optgroup-header">' + escape(data.label) + '</div>';
},
loading:function(data,escape){
return '<div class="spinner"></div>';
},
dropdown:function(){
return '<div></div>';
}
}
});
```

## Working with Options Array

You can create options from a JavaScript array:

```javascript
new TomSelect('#select-tools',{
maxItems: null,
valueField: 'id',
labelField: 'title',
searchField: 'title',
options: [
{id: 1, title: 'Spectrometer', url: 'http://en.wikipedia.org/wiki/Spectrometers'},
{id: 2, title: 'Star Chart', url: 'http://en.wikipedia.org/wiki/Star_chart'},
{id: 3, title: 'Electrical Tape', url: 'http://en.wikipedia.org/wiki/Electrical_tape'}
],
create: false
});
```

### Using Data Attributes

```javascript
new TomSelect('#data-attr',{
render: {
option: function (data, escape) {
return `<div><img class="me-2" src="${data.src}">${data.text}</div>`;
},
item: function (item, escape) {
return `<div><img class="me-2" src="${item.src}">${item.text}</div>`;
}
}
});
```

```html
<select id="data-attr">
<option value="chrome" data-src="https://cdn1.iconfinder.com/data/icons/logotypes/32/chrome-32.png">Google Chrome</option>
<option value="ffox" data-src="https://cdn0.iconfinder.com/data/icons/flat-round-system/512/firefox-32.png">Mozilla Firefox</option>
<option value="ie" data-src="https://cdn0.iconfinder.com/data/icons/flat-round-system/512/internet_explorer-32.png">Internet Explorer</option>
</select>
```

## Remote Data Loading

Tom Select works with a variety of data sources including data hosted on remote servers. You can use JavaScript's Fetch API, jQuery.ajax(), XMLHttpRequest, or any other method of retrieving data from a server.

### Basic Remote Data Example

```javascript
new TomSelect('#select-state',{
valueField: 'label',
labelField: 'label',
searchField: ['label','type'],
// fetch remote data
load: function(query, callback) {
var self = this;
if( self.loading > 1 ){
callback();
return;
}
var url = 'https://whatcms.org/API/List';
fetch(url)
.then(response => response.json())
.then(json => {
callback(json.result.list);
self.settings.load = null;
}).catch(()=>{
callback();
});
},
// custom rendering function for options
render: {
option: function(item, escape) {
return `<div class="py-2 d-flex">
<div class="mb-1">
<span class="h5">
${ escape(item.label) }
</span>
</div>
<div class="ms-auto">${ escape(item.type.join(', ')) }</div>
</div>`;
}
},
});
```

### Advanced Remote Data with Custom Scoring

```javascript
new TomSelect('#select-repo',{
valueField: 'url',
labelField: 'name',
searchField: ['name','description'],
options: [],
create: false,
maxOptions: 10,
// minimum query length
shouldLoad:function(query){
return query.length > 1;
},
// custom scoring
score: function(search) {
var score = this.getScoreFunction(search);
return function(item) {
return score(item) * (1 + Math.min(item.watchers / 100, 1));
};
},
// fetch remote data
load: function(query, callback) {
var url = 'https://api.github.com/search/repositories?q=' + encodeURIComponent(query);
fetch(url)
.then(response => response.json())
.then(json => {
callback(json.items);
}).catch(()=>{
callback();
});
},
// custom rendering functions for options and items
render: {
option: function(item, escape) {
return `<div class="row border-bottom py-2">
<div class="col">
<div class="mb-1">
<span class="h4">
${ escape(item.name) }
</span>
<span class="text-muted">${ escape(item.full_name) }</span>
</div>
<div class="description">${ escape(item.description) }</div>
</div>
<div class="col-auto text-muted">
★ ${ item.stargazers_count }
</div>
</div>`;
}
}
});
```

## API Methods

Tom Select provides a comprehensive API for programmatic control. To access an existing Tom Select instance:

```javascript
// Method 1: Get from element
let select = document.getElementById('select');
let control = select.tomselect;

// Method 2: Store reference during creation
let control = new TomSelect('#select');
```

### Selection Methods

| Method | Description | Example |
|--------|-------------|---------|
| `addItem(value)` | Add an item to the selection | `control.addItem('item_id')` |
| `removeItem(value)` | Remove an item from selection | `control.removeItem('item_id')` |
| `clear()` | Clear all selected items | `control.clear()` |
| `getValue()` | Get array of selected values | `let selected = control.getValue()` |
| `setValue(values)` | Set selected values | `control.setValue(['id1', 'id2'])` |

### Option Management Methods

| Method | Description | Example |
|--------|-------------|---------|
| `addOption(data)` | Add a new option | `control.addOption({value:'new', text:'New Item'})` |
| `updateOption(value, data)` | Update existing option | `control.updateOption('id', {text:'Updated'})` |
| `removeOption(value)` | Remove an option | `control.removeOption('item_id')` |
| `clearOptions()` | Remove all options | `control.clearOptions()` |
| `getOption(value)` | Get option data | `let option = control.getOption('id')` |

### Control Methods

| Method | Description | Example |
|--------|-------------|---------|
| `open()` | Open the dropdown | `control.open()` |
| `close()` | Close the dropdown | `control.close()` |
| `focus()` | Focus the control | `control.focus()` |
| `blur()` | Remove focus | `control.blur()` |
| `enable()` | Enable the control | `control.enable()` |
| `disable()` | Disable the control | `control.disable()` |
| `destroy()` | Destroy the control | `control.destroy()` |
| `refreshOptions()` | Refresh dropdown options | `control.refreshOptions()` |

### Utility Methods

| Method | Description | Example |
|--------|-------------|---------|
| `sync()` | Sync with original element | `control.sync()` |
| `updatePlaceholder()` | Update placeholder text | `control.updatePlaceholder()` |
| `getScoreFunction(search)` | Get scoring function for search | `let score = control.getScoreFunction('query')` |

### Property Access

| Property | Description | Example |
|----------|-------------|---------|
| `settings` | Configuration object | `control.settings.maxItems` |
| `items` | Array of selected item values | `control.items` |
| `options` | Object of available options | `control.options['item_id']` |
| `isOpen` | Whether dropdown is open | `if (control.isOpen) {...}` |
| `isDisabled` | Whether control is disabled | `if (control.isDisabled) {...}` |

### Complete API Example

```javascript
var control = new TomSelect('#select');

// Add new options
control.addOption({value:'new1', text:'New Option 1'});
control.addOption({value:'new2', text:'New Option 2'});

// Select items
control.addItem('new1');
control.addItem('new2');

// Get current selection
console.log(control.getValue()); // ['new1', 'new2']

// Update an option
control.updateOption('new1', {text: 'Updated Option 1'});

// Remove an item
control.removeItem('new2');

// Clear all selections
control.clear();
```

## Plugins

Tom Select supports an extensive plugin system. Plugins can be included in your projects in four different ways:

1. **tom-select.complete.js** - Includes all plugins
2. **tom-select.popular.js** - Includes dropdown_input, remove_button, no_backspace_delete, and restore_on_backspace plugins
3. **tom-select.base.js** - No plugins included, load individually
4. **Custom builds** - Build with specific plugins only

### Popular Plugins

- **Caret Position** - Use the ← and → arrow keys to move the caret between items
- **Remove Button** - Adds one-click removal of each item
- **No Backspace Delete** - Prevents deletion using backspace/delete keys unless items are active
- **Dropdown Input** - Positions the control input in the select dropdown
- **Input Autogrow** - Increase the width of the input as users type
- **Checkbox Options** - Add checkboxes to options
- **Clear Button** - Add a clear button to empty the control
- **Drag 'n Drop** - Allows users to sort items with drag-n-drop
- **Dropdown Header** - Adds a customizable header to the select dropdown
- **Virtual Scroll** - Loads remote data as users scroll through dropdown

### Plugin Usage Example

```javascript
// Load specific plugins
TomSelect.define('remove_button', function(options) {
// Plugin implementation
});

new TomSelect('#select', {
plugins: ['remove_button', 'clear_button']
});
```

## Common Examples

### Basic Single Select

```html
<select id="select-beast" placeholder="Select a person..." autocomplete="off">
<option value="">Select a person...</option>
<option value="4">Thomas Edison</option>
<option value="1">Nikola</option>
<option value="3">Nikola Tesla</option>
<option value="5">Arnold Schwarzenegger</option>
</select>

<script>
new TomSelect('#select-beast', {
// options here
});
</script>
```

### Multi-Select with Pre-selected Values

```html
<select id="select-state" name="state[]" multiple placeholder="Select a state..." autocomplete="off">
<option value="">Select a state...</option>
<option value="AL">Alabama</option>
<option value="AK">Alaska</option>
<option value="CA" selected>California</option>
<option value="CO">Colorado</option>
</select>

<script>
new TomSelect('#select-state', {
// options here
});
</script>
```

### Tags Input

```html
<input id="input-tags" value="awesome,neat" autocomplete="off" placeholder="How cool is this?">

<script>
new TomSelect('#input-tags', {
delimiter: ',',
persist: false,
create: function(input) {
return {
value: input,
text: input
}
}
});
</script>
```

### Custom Styling with Links

```javascript
new TomSelect('#select-links',{
valueField: 'id',
searchField: 'title',
options: [
{id: 1, title: 'DIY', url: 'https://diy.org'},
{id: 2, title: 'Google', url: 'http://google.com'},
{id: 3, title: 'Yahoo', url: 'http://yahoo.com'},
],
render: {
option: function(data, escape) {
return '<div>' +
'<span class="title">' + escape(data.title) + '</span>' +
'<span class="url">' + escape(data.url) + '</span>' +
'</div>';
},
item: function(data, escape) {
return '<div title="' + escape(data.url) + '">' + escape(data.title) + '</div>';
}
}
});
```

## CSS Styling

Tom Select provides several CSS themes and allows for extensive customization:

```css
.ts-wrapper .option .title {
display: block;
}

.ts-wrapper .option .url {
font-size: 12px;
display: block;
color: #a0a0a0;
}
```

### CSS Classes Reference

| Class | Element | Description |
|-------|---------|-------------|
| `.ts-wrapper` | Main container | The outermost wrapper element |
| `.ts-control` | Input area | Contains the input and selected items |
| `.ts-input` | Text input | The actual input element |
| `.item` | Selected item | Individual selected items |
| `.option` | Dropdown option | Individual options in dropdown |
| `.dropdown` | Dropdown container | The dropdown menu container |
| `.optgroup` | Option group | Container for grouped options |
| `.optgroup-header` | Group header | Header for option groups |
| `.loading` | Loading state | Applied during load operations |
| `.focus` | Focused state | Applied when control has focus |
| `.disabled` | Disabled state | Applied when control is disabled |
| `.invalid` | Invalid state | Applied for validation errors |

### Available Themes

Tom Select comes with several pre-built themes:

- `tom-select.css` - Default theme
- `tom-select.bootstrap4.css` - Bootstrap 4 theme  
- `tom-select.bootstrap5.css` - Bootstrap 5 theme

### Custom Styling Example

```css
/* Custom theme example */
.ts-wrapper.my-theme {
  border-radius: 8px;
  border: 2px solid #007bff;
}

.ts-wrapper.my-theme .ts-control {
  background: #f8f9fa;
  padding: 8px;
}

.ts-wrapper.my-theme .item {
  background: #007bff;
  color: white;
  border-radius: 4px;
  padding: 4px 8px;
  margin: 2px;
}

.ts-wrapper.my-theme .option:hover {
  background: #e7f3ff;
}
```

## Event Handling

Tom Select provides comprehensive event handling through callbacks and native events.

### Using Callbacks in Configuration

```javascript
new TomSelect('#select', {
  onChange: function(value) {
    console.log('Selection changed:', value);
  },
  onItemAdd: function(value, item) {
    console.log('Item added:', value);
  },
  onItemRemove: function(value, item) {
    console.log('Item removed:', value);
  },
  onFocus: function() {
    console.log('Control focused');
  },
  onBlur: function() {
    console.log('Control blurred');
  }
});
```

### Using addEventListener

```javascript
let control = new TomSelect('#select');

// Listen to change events
control.on('change', function(value) {
  console.log('Value changed to:', value);
});

// Listen to item_add events  
control.on('item_add', function(value, item) {
  console.log('Added item:', value);
});

// Listen to dropdown_open events
control.on('dropdown_open', function() {
  console.log('Dropdown opened');
});
```

### Available Events

| Event | Description | Parameters |
|-------|-------------|------------|
| `change` | When selection changes | `(value)` |
| `item_add` | When item is added | `(value, item)` |
| `item_remove` | When item is removed | `(value, item)` |
| `clear` | When control is cleared | `()` |
| `option_add` | When option is added | `(value, data)` |
| `option_remove` | When option is removed | `(value)` |
| `dropdown_open` | When dropdown opens | `()` |
| `dropdown_close` | When dropdown closes | `()` |
| `type` | When user types | `(str)` |
| `load` | When options are loaded | `(options)` |
| `focus` | When control gains focus | `()` |
| `blur` | When control loses focus | `()` |

## Form Integration

Tom Select integrates seamlessly with HTML forms and form validation.

### Basic Form Integration

```html
<form id="myForm">
  <label for="users">Select Users:</label>
  <select id="users" name="selectedUsers[]" multiple required>
    <option value="1">John Doe</option>
    <option value="2">Jane Smith</option>
    <option value="3">Bob Johnson</option>
  </select>
  <button type="submit">Submit</button>
</form>

<script>
new TomSelect('#users', {
  // Tom Select configuration
});

document.getElementById('myForm').addEventListener('submit', function(e) {
  e.preventDefault();
  let formData = new FormData(this);
  console.log('Selected users:', formData.getAll('selectedUsers[]'));
});
</script>
```

### Form Validation

```javascript
new TomSelect('#required-select', {
  onChange: function(value) {
    // Custom validation
    let isValid = value.length > 0;
    this.wrapper.classList.toggle('invalid', !isValid);
  },
  onBlur: function() {
    // Validate on blur
    let isValid = this.getValue().length > 0;
    this.wrapper.classList.toggle('invalid', !isValid);
  }
});
```

### Synchronization with Original Element

```javascript
let control = new TomSelect('#select');

// Values are automatically synced with the original element
// You can manually sync if needed:
control.sync();

// Access original element value
let originalValue = document.getElementById('select').value;
```

## Performance Optimization

### For Large Datasets

```javascript
new TomSelect('#large-dataset', {
  maxOptions: 100,        // Limit displayed options
  loadThrottle: 300,     // Throttle load requests
  preload: false,        // Don't preload data
  
  // Use virtual scrolling plugin for very large lists
  plugins: ['virtual_scroll'],
  
  // Optimize search fields
  searchField: ['name'],  // Limit search to specific fields
  
  // Custom scoring for better performance
  score: function(search) {
    let score = this.getScoreFunction(search);
    return function(item) {
      // Simple scoring for better performance
      return item.name.toLowerCase().indexOf(search.toLowerCase()) !== -1 ? 1 : 0;
    };
  }
});
```

### Memory Management

```javascript
// Properly destroy Tom Select instances to prevent memory leaks
let control = new TomSelect('#select');

// Later, when component is destroyed
control.destroy();
```

## Accessibility

Tom Select provides good accessibility support out of the box:

### ARIA Attributes

```javascript
new TomSelect('#accessible-select', {
  // These are set automatically, but can be customized
  ariaLabel: 'Select options',
  placeholder: 'Choose options...',
  
  // Custom render functions can include additional ARIA attributes
  render: {
    option: function(data, escape) {
      return `<div role="option" aria-selected="false">
                ${escape(data.text)}
              </div>`;
    }
  }
});
```

### Keyboard Navigation

Tom Select supports full keyboard navigation:

- `↓` / `↑` - Navigate options
- `Enter` - Select option
- `Escape` - Close dropdown
- `Backspace` - Remove last item
- `Tab` - Navigate to next form element
- `Ctrl/Cmd + A` - Select all (with appropriate plugin)

### Screen Reader Support

```javascript
new TomSelect('#screen-reader-friendly', {
  // Provide meaningful labels
  placeholder: 'Select one or more countries',
  
  // Use proper field names
  labelField: 'name',
  valueField: 'code',
  
  // Provide context in render functions
  render: {
    option: function(data, escape) {
      return `<div aria-label="${escape(data.name)} (${escape(data.code)})">
                ${escape(data.name)}
              </div>`;
    }
  }
});
```

## Troubleshooting

### Common Issues

1. **Control not initializing**: Make sure Tom Select script is loaded before initialization
2. **Styles not applied**: Ensure CSS file is included and loaded
3. **Remote data not loading**: Check network requests and callback function implementation
4. **Custom templates not working**: Verify escape() function usage for XSS prevention
5. **Options not updating**: Call `refreshOptions()` after adding/removing options
6. **Form submission issues**: Ensure original element is properly synced with `sync()`
7. **Memory leaks**: Always call `destroy()` when removing Tom Select instances
8. **Performance issues**: Use `maxOptions`, `loadThrottle`, and optimize search fields

### Debugging Tips

```javascript
// Enable debug mode to see internal state
let control = new TomSelect('#select', {
  // Your configuration
});

// Inspect control state
console.log('Current items:', control.items);
console.log('Available options:', control.options);
console.log('Settings:', control.settings);
console.log('Is open:', control.isOpen);
console.log('Is disabled:', control.isDisabled);

// Check if element exists and Tom Select is attached
let element = document.getElementById('select');
console.log('Element exists:', !!element);
console.log('Tom Select attached:', !!element.tomselect);
```

### Error Handling

```javascript
try {
  let control = new TomSelect('#select', {
    load: function(query, callback) {
      fetch('/api/search?q=' + query)
        .then(response => {
          if (!response.ok) throw new Error('Network error');
          return response.json();
        })
        .then(data => callback(data))
        .catch(error => {
          console.error('Load error:', error);
          callback(); // Always call callback, even on error
        });
    },
    
    onError: function(error) {
      console.error('Tom Select error:', error);
    }
  });
} catch (error) {
  console.error('Tom Select initialization error:', error);
}
```

### Best Practices

1. **Always use the `escape()` function in render templates** to prevent XSS
2. **Use appropriate `valueField` and `labelField`** for your data structure
3. **Implement proper error handling** in remote data loading
4. **Consider using `shouldLoad()` callback** for minimum query length validation
5. **Use plugins judiciously** to avoid bloating your bundle
6. **Call `destroy()`** when removing Tom Select instances
7. **Use `maxOptions`** for large datasets to improve performance
8. **Validate user input** when using `create: true`
9. **Test keyboard navigation** and screen reader compatibility
10. **Use semantic HTML** and proper ARIA attributes

### Performance Guidelines

| Scenario | Recommended Settings |
|----------|---------------------|
| < 100 options | Default settings work well |
| 100-1000 options | Set `maxOptions: 100`, use `loadThrottle: 300` |
| 1000+ options | Use remote loading, `virtual_scroll` plugin |
| Real-time search | Set `loadThrottle: 100-300`, implement debouncing |
| Mobile devices | Use larger touch targets, test touch interactions |

### Migration from Selectize.js

Tom Select is designed as a modern replacement for Selectize.js:

```javascript
// Selectize.js (old)
$('#select').selectize({
  valueField: 'id',
  labelField: 'title',
  searchField: 'title'
});

// Tom Select (new)
new TomSelect('#select', {
  valueField: 'id',
  labelField: 'title',
  searchField: 'title'
});
```

**Key differences:**
- No jQuery dependency required
- Modern ES6+ codebase
- Better performance
- Improved accessibility
- More plugin options
- TypeScript support

## Browser Support

Tom Select supports all modern browsers and provides graceful degradation for older browsers. It's framework agnostic and works with vanilla JavaScript, React, Vue, Angular, and other frameworks.

This documentation covers the core functionality of Tom Select. For the most up-to-date information and advanced examples, visit the official documentation at https://tom-select.js.org/