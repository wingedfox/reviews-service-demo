--DROP SCHEMA IF EXISTS rest_api CASCADE;
ALTER TABLE production.productreview
DROP COLUMN status,
DROP COLUMN statusdate,
DROP COLUMN rowguid;
DROP TYPE production.review_status;
