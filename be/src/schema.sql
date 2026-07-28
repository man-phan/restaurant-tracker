-- Drop tables if they exist (in reverse FK order)
DROP TABLE IF EXISTS otps;
DROP TABLE IF EXISTS dishes;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS users;

-- Users
CREATE TABLE users (
  id           SERIAL PRIMARY KEY,
  username     VARCHAR(50)  NOT NULL UNIQUE,
  email        VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  google_id    VARCHAR(200),
  role         VARCHAR(20)  NOT NULL DEFAULT 'user',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- OTPs for password reset
CREATE TABLE otps (
  id         SERIAL PRIMARY KEY,
  email      VARCHAR(200) NOT NULL,
  otp_code   VARCHAR(6)   NOT NULL,
  expires_at TIMESTAMPTZ  NOT NULL,
  used       BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Locations
CREATE TABLE locations (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  created_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Restaurants
CREATE TABLE restaurants (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name         VARCHAR(200) NOT NULL,
  address      VARCHAR(300),
  full_address VARCHAR(500),
  location_id  INTEGER REFERENCES locations(id) ON DELETE CASCADE,
  created_at   DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Dishes
CREATE TABLE dishes (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          VARCHAR(200) NOT NULL,
  rating        SMALLINT CHECK (rating BETWEEN 1 AND 5),
  note          TEXT,
  created_at    DATE NOT NULL DEFAULT CURRENT_DATE
);
