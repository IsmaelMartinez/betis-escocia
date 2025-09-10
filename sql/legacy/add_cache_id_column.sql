ALTER TABLE classification_cache
ADD COLUMN id INTEGER DEFAULT 1;

ALTER TABLE classification_cache
ADD CONSTRAINT unique_id UNIQUE (id);
