CREATE TYPE production.review_status AS ENUM ('created', 'moderated', 'published', 'archived');
ALTER TABLE production.productreview
 ADD COLUMN     status         production.review_status DEFAULT 'created'          NOT NULL,
 ADD COLUMN     statusdate     timestamp                DEFAULT now()              NOT NULL,
 ADD COLUMN     rowguid        uuid                     DEFAULT uuid_generate_v4() NOT NULL,
 ADD CONSTRAINT rowguid_unique                          UNIQUE  (rowguid);
UPDATE production.productreview
   SET status     = 'published',
       statusdate = modifieddate;

--CREATE SCHEMA IF NOT EXISTS rest_api;
--CREATE TYPE rest_api.request_status AS ENUM ('created', 'processed', 'completed');
--CREATE TABLE IF NOT EXISTS rest_api.requests (
--    id uuid,
--    payload jsonb,
--    created time DEFAULT now() NOT NULL,
--    processed time,
--    completed time,
--    retries int DEFAULT 0 NOT NULL,
--    status rest_api.request_status default 'created',
--    PRIMARY KEY( id )
--);
