-- Users table
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100)        NOT NULL,
  email      VARCHAR(150) UNIQUE NOT NULL,
  password   VARCHAR(255)        NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
  company         VARCHAR(150)   NOT NULL,
  role            VARCHAR(150)   NOT NULL,
  status          VARCHAR(50)    NOT NULL DEFAULT 'applied'
                  CHECK (status IN ('applied','phone_screen','interview','offer','rejected','withdrawn')),
  applied_date    DATE           NOT NULL DEFAULT CURRENT_DATE,
  salary_min      NUMERIC(10,2),
  salary_max      NUMERIC(10,2),
  job_url         TEXT,
  location        VARCHAR(150),
  work_type       VARCHAR(20)    DEFAULT 'onsite'
                  CHECK (work_type IN ('onsite','remote','hybrid')),
  resume_version  VARCHAR(100),
  cover_letter    BOOLEAN        DEFAULT false,
  notes           TEXT,
  follow_up_date  DATE,
  follow_up_sent  BOOLEAN        DEFAULT false,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Contacts table (recruiter/hiring manager per application)
CREATE TABLE IF NOT EXISTS contacts (
  id             SERIAL PRIMARY KEY,
  application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
  name           VARCHAR(100) NOT NULL,
  role           VARCHAR(100),
  email          VARCHAR(150),
  linkedin_url   TEXT,
  notes          TEXT,
  created_at     TIMESTAMP DEFAULT NOW()
);

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id             SERIAL PRIMARY KEY,
  application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
  interview_date TIMESTAMP    NOT NULL,
  type           VARCHAR(50)  NOT NULL
                 CHECK (type IN ('phone','technical','behavioral','panel','final','other')),
  location       VARCHAR(200),
  notes          TEXT,
  outcome        VARCHAR(50)
                 CHECK (outcome IN ('passed','failed','pending','cancelled')),
  created_at     TIMESTAMP DEFAULT NOW()
);