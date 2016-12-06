CREATE TABLE school (
  nces_id VARCHAR(20),
  site_code VARCHAR(10),
  name VARCHAR(80),
  locale VARCHAR(10),
  level VARCHAR(10),
  enrollment INT,
  white_students INT,
  fr_lunch INT,
  sps INT,
  charter VARCHAR(4),
  year VARCHAR(6),
  PRIMARY KEY (nces_id, year)
);

CREATE TABLE test (
  subject VARCHAR(20),
  nces_id VARCHAR(20),
  site_code VARCHAR(10),
  year VARCHAR(6),
  total INT,
  enrolled INT,
  excellent FLOAT,
  good FLOAT,
  fair FLOAT,
  needs_improvement FLOAT,
  PRIMARY KEY (subject, site_code, year)
);

CREATE TABLE ons (
  subject VARCHAR(20),
  site_code VARCHAR(10),
  year VARCHAR(6),
  mean_mle FLOAT,
  std_dev_mle FLOAT,
  PRIMARY KEY (subject, site_code, year)
);
