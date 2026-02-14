-- possible db schema adapt to project requirements, rules, styles

CREATE TABLE classifyIt_plantilla (
    classifyIt_plantilla_id MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre                      VARCHAR(64)        NOT NULL,
    describe                    MEDIUMTEXT,
    que_clasifica               VARCHAR(64)        NOT NULL,
    clasifica_en                VARCHAR(64)        NOT NULL,
    UNIQUE KEY plantilla_unica (clasifica_en, que_clasifica, plantilla)
-- trae: clasifica_id:[ids de que clasifica: productos, usuarios:orden]
);

CREATE TABLE classifyIt_grupo (
    classifyIt_grupo_id MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre                  VARCHAR(64)        NOT NULL,
    describe                MEDIUMTEXT,
    que_clasifica           VARCHAR(64)        NOT NULL,
    UNIQUE KEY plantilla_unica (que_clasifica, plantilla)
);
CREATE TABLE classifyIt_grupo_items (
    classifyIt_grupo_items_id MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    classifyIt_grupo_id       MEDIUMINT UNSIGNED NOT NULL,
-- FK CONSTRAINT CASCADE
    item_id                       VARCHAR(191)       NOT NULL,
    UNIQUE KEY (classifyIt_grupo_id, item_id)
);
