

CREATE TABLE classifier_catalogs (
    classifier_catalog_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for the classification catalog',
    catalog_name VARCHAR(100) NOT NULL COMMENT 'Name of the classification scheme, e.g., Vehicle Categories',
    item_table VARCHAR(50) NOT NULL COMMENT 'The database table this catalog applies to, e.g., cars or boats',
    description TEXT COMMENT 'Detailed description of what this classification covers',
    UNIQUE KEY (catalog_name, item_table)
) COMMENT='Defines various classification systems and the tables they apply to';


CREATE TABLE classifier_tags (
    classifier_tag_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for a specific tag',
    classifier_catalog_id INT NOT NULL COMMENT 'Reference to the parent catalog',
    tag_label VARCHAR(100) NOT NULL COMMENT 'The display text for the tag, used by TagIt and ClassifyIt',
    UNIQUE KEY(classifier_catalog_id, tag_label),
    FOREIGN KEY (classifier_catalog_id) REFERENCES classifier_catalogs(classifier_catalog_id) ON DELETE CASCADE,
    UNIQUE KEY (classifier_catalog_id, tag_label)
) COMMENT='Individual tags or categories belonging to a specific classification catalog';


CREATE TABLE classifier_assignments (
    classifier_assignment_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for the assignment record',
    item_id INT NOT NULL COMMENT 'The primary key of the record being classified from the target item_table',
    classifier_tag_id INT NOT NULL COMMENT 'The tag being applied to the item',
    UNIQUE KEY(item_id, classifier_tag_id),
    FOREIGN KEY (classifier_tag_id) REFERENCES classifier_tags(classifier_tag_id) ON DELETE CASCADE,
    UNIQUE KEY (item_id, classifier_tag_id, classifier_tag_id)
) COMMENT='Links specific records from external tables to tags assigned via TagIt or ClassifyIt';


CREATE TABLE classifier_groups (
    classifier_group_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for the group',
    group_name VARCHAR(100) NOT NULL COMMENT 'User-defined name for the collection of items',
    item_table VARCHAR(50) NOT NULL COMMENT 'The table name representing the type of items in this group',
    description TEXT COMMENT 'Purpose or notes regarding this specific group of items',
    UNIQUE  KEY(item_table, group_name)
) COMMENT='Named collections of records used for bulk operations in ClassifyIt';


CREATE TABLE classifier_group_items (
    classifier_group_item_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for the group membership record',
    classifier_group_id INT NOT NULL COMMENT 'The group the item belongs to',
    item_id INT NOT NULL COMMENT 'The primary key of the record included in the group',
    UNIQUE  KEY(classifier_group_id, item_id),
    FOREIGN KEY (classifier_group_id) REFERENCES classifier_groups(classifier_group_id) ON DELETE CASCADE,
    UNIQUE KEY (classifier_group_id, item_id)
) COMMENT='Maps individual records to specific classifier groups';


