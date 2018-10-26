SELECT setval(pg_get_serial_sequence('production.productreview', 'productreviewid'), coalesce(max(productreviewid),0) + 1, false) FROM production.productreview;
