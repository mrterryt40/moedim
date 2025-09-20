-- Mo'edim Database Initialization Script
-- This script runs when PostgreSQL container first starts

-- Create development database
CREATE DATABASE moedim_dev;
CREATE DATABASE moedim_test;

-- Create database user for the application
CREATE USER moedim_user WITH PASSWORD 'moedim_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE moedim_dev TO moedim_user;
GRANT ALL PRIVILEGES ON DATABASE moedim_test TO moedim_user;

-- Enable UUID extension (for primary keys)
\c moedim_dev;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c moedim_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Log successful initialization
\echo 'Mo''edim databases initialized successfully!';