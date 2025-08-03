--
-- PostgreSQL database cluster dump
--

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE anon;
ALTER ROLE anon WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB NOLOGIN NOREPLICATION NOBYPASSRLS;
CREATE ROLE authenticated;
ALTER ROLE authenticated WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB NOLOGIN NOREPLICATION NOBYPASSRLS;
CREATE ROLE authenticator;
ALTER ROLE authenticator WITH NOSUPERUSER NOINHERIT NOCREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS;
CREATE ROLE dashboard_user;
ALTER ROLE dashboard_user WITH NOSUPERUSER INHERIT CREATEROLE CREATEDB NOLOGIN REPLICATION NOBYPASSRLS;
CREATE ROLE pgbouncer;
ALTER ROLE pgbouncer WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS;
CREATE ROLE postgres;
ALTER ROLE postgres WITH NOSUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS;
CREATE ROLE service_role;
ALTER ROLE service_role WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB NOLOGIN NOREPLICATION BYPASSRLS;
CREATE ROLE supabase_admin;
ALTER ROLE supabase_admin WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS;
CREATE ROLE supabase_auth_admin;
ALTER ROLE supabase_auth_admin WITH NOSUPERUSER NOINHERIT CREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS;
CREATE ROLE supabase_read_only_user;
ALTER ROLE supabase_read_only_user WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB LOGIN NOREPLICATION BYPASSRLS;
CREATE ROLE supabase_realtime_admin;
ALTER ROLE supabase_realtime_admin WITH NOSUPERUSER NOINHERIT NOCREATEROLE NOCREATEDB NOLOGIN NOREPLICATION NOBYPASSRLS;
CREATE ROLE supabase_replication_admin;
ALTER ROLE supabase_replication_admin WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB LOGIN REPLICATION NOBYPASSRLS;
CREATE ROLE supabase_storage_admin;
ALTER ROLE supabase_storage_admin WITH NOSUPERUSER NOINHERIT CREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS;

--
-- User Configurations
--

--
-- User Config "anon"
--

ALTER ROLE anon SET statement_timeout TO '3s';

--
-- User Config "authenticated"
--

ALTER ROLE authenticated SET statement_timeout TO '8s';

--
-- User Config "authenticator"
--

ALTER ROLE authenticator SET session_preload_libraries TO 'safeupdate';
ALTER ROLE authenticator SET statement_timeout TO '8s';
ALTER ROLE authenticator SET lock_timeout TO '8s';

--
-- User Config "postgres"
--

ALTER ROLE postgres SET search_path TO E'\\$user', 'public', 'extensions';

--
-- User Config "supabase_admin"
--

ALTER ROLE supabase_admin SET search_path TO '$user', 'public', 'auth', 'extensions';
ALTER ROLE supabase_admin SET log_statement TO 'none';

--
-- User Config "supabase_auth_admin"
--

ALTER ROLE supabase_auth_admin SET search_path TO 'auth';
ALTER ROLE supabase_auth_admin SET idle_in_transaction_session_timeout TO '60000';
ALTER ROLE supabase_auth_admin SET log_statement TO 'none';

--
-- User Config "supabase_storage_admin"
--

ALTER ROLE supabase_storage_admin SET search_path TO 'storage';
ALTER ROLE supabase_storage_admin SET log_statement TO 'none';


--
-- Role memberships
--

GRANT anon TO authenticator WITH INHERIT FALSE GRANTED BY supabase_admin;
GRANT anon TO postgres WITH ADMIN OPTION, INHERIT TRUE GRANTED BY supabase_admin;
GRANT authenticated TO authenticator WITH INHERIT FALSE GRANTED BY supabase_admin;
GRANT authenticated TO postgres WITH ADMIN OPTION, INHERIT TRUE GRANTED BY supabase_admin;
GRANT authenticator TO postgres WITH ADMIN OPTION, INHERIT TRUE GRANTED BY supabase_admin;
GRANT authenticator TO supabase_storage_admin WITH INHERIT FALSE GRANTED BY supabase_admin;
GRANT pg_create_subscription TO postgres WITH INHERIT TRUE GRANTED BY supabase_admin;
GRANT pg_monitor TO postgres WITH ADMIN OPTION, INHERIT TRUE GRANTED BY supabase_admin;
GRANT pg_read_all_data TO postgres WITH ADMIN OPTION, INHERIT TRUE GRANTED BY supabase_admin;
GRANT pg_read_all_data TO supabase_read_only_user WITH INHERIT TRUE GRANTED BY supabase_admin;
GRANT pg_signal_backend TO postgres WITH ADMIN OPTION, INHERIT TRUE GRANTED BY supabase_admin;
GRANT service_role TO authenticator WITH INHERIT FALSE GRANTED BY supabase_admin;
GRANT service_role TO postgres WITH ADMIN OPTION, INHERIT TRUE GRANTED BY supabase_admin;
GRANT supabase_realtime_admin TO postgres WITH INHERIT TRUE GRANTED BY supabase_admin;






--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.5 (Debian 17.5-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.5 (Debian 17.5-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA supabase_migrations;


ALTER SCHEMA supabase_migrations OWNER TO postgres;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: btree_gin; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gin WITH SCHEMA public;


--
-- Name: EXTENSION btree_gin; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION btree_gin IS 'support for indexing common datatypes in GIN';


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: account_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.account_type AS ENUM (
    'personal',
    'business'
);


ALTER TYPE public.account_type OWNER TO postgres;

--
-- Name: ad_format; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.ad_format AS ENUM (
    'timeline',
    'sidebar',
    'story',
    'popup',
    'native'
);


ALTER TYPE public.ad_format OWNER TO postgres;

--
-- Name: ad_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.ad_status AS ENUM (
    'pending',
    'active',
    'paused',
    'completed',
    'rejected',
    'draft'
);


ALTER TYPE public.ad_status OWNER TO postgres;

--
-- Name: admin_action_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.admin_action_type AS ENUM (
    'view',
    'create',
    'update',
    'delete',
    'ban',
    'unban',
    'verify',
    'reject',
    'refund'
);


ALTER TYPE public.admin_action_type OWNER TO postgres;

--
-- Name: admin_department; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.admin_department AS ENUM (
    'financial',
    'moderation',
    'support',
    'marketing',
    'technical',
    'management'
);


ALTER TYPE public.admin_department OWNER TO postgres;

--
-- Name: billing_period; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.billing_period AS ENUM (
    'monthly',
    'quarterly',
    'semiannual',
    'annual',
    'trial'
);


ALTER TYPE public.billing_period OWNER TO postgres;

--
-- Name: business_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.business_type AS ENUM (
    'venue',
    'content_creator',
    'service_provider',
    'event_organizer',
    'brand',
    'influencer'
);


ALTER TYPE public.business_type OWNER TO postgres;

--
-- Name: call_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.call_status AS ENUM (
    'ringing',
    'connected',
    'ended',
    'missed',
    'declined'
);


ALTER TYPE public.call_status OWNER TO postgres;

--
-- Name: call_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.call_type AS ENUM (
    'voice',
    'video'
);


ALTER TYPE public.call_type OWNER TO postgres;

--
-- Name: campaign_objective; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.campaign_objective AS ENUM (
    'awareness',
    'traffic',
    'conversion',
    'engagement',
    'app_installs'
);


ALTER TYPE public.campaign_objective OWNER TO postgres;

--
-- Name: content_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.content_category AS ENUM (
    'artistic',
    'sensual',
    'fitness',
    'lifestyle',
    'educational',
    'entertainment'
);


ALTER TYPE public.content_category OWNER TO postgres;

--
-- Name: content_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.content_status AS ENUM (
    'draft',
    'active',
    'paused',
    'archived',
    'removed'
);


ALTER TYPE public.content_status OWNER TO postgres;

--
-- Name: credit_transaction_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.credit_transaction_type AS ENUM (
    'purchase',
    'spend',
    'refund',
    'bonus'
);


ALTER TYPE public.credit_transaction_type OWNER TO postgres;

--
-- Name: event_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.event_type AS ENUM (
    'social',
    'cultural',
    'sports',
    'educational',
    'online'
);


ALTER TYPE public.event_type OWNER TO postgres;

--
-- Name: friend_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.friend_status AS ENUM (
    'pending',
    'accepted',
    'blocked',
    'declined'
);


ALTER TYPE public.friend_status OWNER TO postgres;

--
-- Name: gender_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.gender_type AS ENUM (
    'male',
    'female',
    'non_binary',
    'other',
    'prefer_not_say'
);


ALTER TYPE public.gender_type OWNER TO postgres;

--
-- Name: match_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.match_status AS ENUM (
    'active',
    'expired',
    'unmatched'
);


ALTER TYPE public.match_status OWNER TO postgres;

--
-- Name: media_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.media_type AS ENUM (
    'image',
    'video',
    'audio'
);


ALTER TYPE public.media_type OWNER TO postgres;

--
-- Name: message_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.message_type AS ENUM (
    'text',
    'image',
    'video',
    'audio',
    'file',
    'location',
    'contact',
    'system'
);


ALTER TYPE public.message_type OWNER TO postgres;

--
-- Name: paid_content_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.paid_content_type AS ENUM (
    'photo',
    'video',
    'album',
    'live'
);


ALTER TYPE public.paid_content_type OWNER TO postgres;

--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_method AS ENUM (
    'credit_card',
    'pix'
);


ALTER TYPE public.payment_method OWNER TO postgres;

--
-- Name: payment_provider; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_provider AS ENUM (
    'stripe',
    'abacatepay'
);


ALTER TYPE public.payment_provider OWNER TO postgres;

--
-- Name: post_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.post_type AS ENUM (
    'regular',
    'story',
    'event'
);


ALTER TYPE public.post_type OWNER TO postgres;

--
-- Name: premium_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.premium_status AS ENUM (
    'active',
    'inactive',
    'cancelled',
    'pending',
    'trial'
);


ALTER TYPE public.premium_status OWNER TO postgres;

--
-- Name: premium_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.premium_type AS ENUM (
    'free',
    'gold',
    'diamond',
    'couple'
);


ALTER TYPE public.premium_type OWNER TO postgres;

--
-- Name: profile_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.profile_type AS ENUM (
    'single',
    'couple',
    'trans',
    'other'
);


ALTER TYPE public.profile_type OWNER TO postgres;

--
-- Name: story_reaction; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.story_reaction AS ENUM (
    'like',
    'love',
    'fire',
    'wow',
    'sad',
    'angry'
);


ALTER TYPE public.story_reaction OWNER TO postgres;

--
-- Name: story_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.story_status AS ENUM (
    'active',
    'expired',
    'deleted'
);


ALTER TYPE public.story_status OWNER TO postgres;

--
-- Name: story_viewer_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.story_viewer_type AS ENUM (
    'regular',
    'anonymous'
);


ALTER TYPE public.story_viewer_type OWNER TO postgres;

--
-- Name: subscription_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.subscription_status AS ENUM (
    'active',
    'cancelled',
    'expired',
    'trial',
    'pending'
);


ALTER TYPE public.subscription_status OWNER TO postgres;

--
-- Name: swipe_action; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.swipe_action AS ENUM (
    'like',
    'super_like',
    'pass'
);


ALTER TYPE public.swipe_action OWNER TO postgres;

--
-- Name: transaction_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.transaction_type AS ENUM (
    'purchase',
    'spend',
    'refund',
    'bonus',
    'commission'
);


ALTER TYPE public.transaction_type OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'user',
    'moderator',
    'admin'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- Name: user_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_status AS ENUM (
    'active',
    'suspended',
    'banned',
    'deactivated',
    'pending_verification'
);


ALTER TYPE public.user_status OWNER TO postgres;

--
-- Name: verification_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.verification_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'expired'
);


ALTER TYPE public.verification_status OWNER TO postgres;

--
-- Name: visibility_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.visibility_type AS ENUM (
    'public',
    'friends',
    'private'
);


ALTER TYPE public.visibility_type OWNER TO postgres;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: calculate_content_commission(uuid, numeric, public.paid_content_type); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_content_commission(p_creator_id uuid, p_amount numeric, p_content_type public.paid_content_type) RETURNS TABLE(platform_fee numeric, creator_revenue numeric)
    LANGUAGE plpgsql
    AS $$
DECLARE
    commission_rate DECIMAL;
    is_verified BOOLEAN;
    is_business_verified BOOLEAN;
    total_sales INTEGER;
BEGIN
    -- Buscar informações do criador
    SELECT 
        u.is_verified,
        COALESCE(b.is_verified, false),
        COALESCE(pc.total_sales, 0)
    INTO 
        is_verified,
        is_business_verified,
        total_sales
    FROM users u
    LEFT JOIN businesses b ON u.business_id = b.id
    LEFT JOIN (
        SELECT creator_id, COUNT(*) as total_sales
        FROM content_purchases
        WHERE status = 'completed'
        GROUP BY creator_id
    ) pc ON pc.creator_id = p_creator_id
    WHERE u.id = p_creator_id;
    
    -- Calcular taxa de comissão baseada em vários fatores
    commission_rate := 0.20; -- 20% padrão
    
    -- Desconto por verificação
    IF is_verified AND is_business_verified THEN
        commission_rate := commission_rate - 0.05; -- 15%
    ELSIF is_verified OR is_business_verified THEN
        commission_rate := commission_rate - 0.025; -- 17.5%
    END IF;
    
    -- Desconto por volume de vendas
    IF total_sales >= 1000 THEN
        commission_rate := commission_rate - 0.05; -- Adicional 5% off
    ELSIF total_sales >= 500 THEN
        commission_rate := commission_rate - 0.03; -- Adicional 3% off
    ELSIF total_sales >= 100 THEN
        commission_rate := commission_rate - 0.01; -- Adicional 1% off
    END IF;
    
    -- Mínimo de 10% de comissão
    commission_rate := GREATEST(commission_rate, 0.10);
    
    -- Calcular valores
    platform_fee := ROUND(p_amount * commission_rate, 2);
    creator_revenue := p_amount - platform_fee;
    
    RETURN QUERY SELECT platform_fee, creator_revenue;
END;
$$;


ALTER FUNCTION public.calculate_content_commission(p_creator_id uuid, p_amount numeric, p_content_type public.paid_content_type) OWNER TO postgres;

--
-- Name: can_upload_media(uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.can_upload_media(user_id uuid, media_type text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    user_plan TEXT;
    user_verified BOOLEAN;
BEGIN
    -- Get user plan and verification status
    SELECT premium_type, is_verified 
    INTO user_plan, user_verified
    FROM users 
    WHERE id = user_id;
    
    -- Avatar and cover: everyone can upload
    IF media_type IN ('avatar', 'cover') THEN
        RETURN TRUE;
    END IF;
    
    -- Post media: only Gold+
    IF media_type = 'post' THEN
        RETURN user_plan IN ('gold', 'diamond', 'couple');
    END IF;
    
    -- Story media: Free verified or Gold+
    IF media_type = 'story' THEN
        RETURN (user_plan = 'free' AND user_verified = TRUE) 
            OR user_plan IN ('gold', 'diamond', 'couple');
    END IF;
    
    -- Audio/Video: only Diamond+
    IF media_type IN ('audio', 'video') THEN
        RETURN user_plan IN ('diamond', 'couple');
    END IF;
    
    RETURN FALSE;
END;
$$;


ALTER FUNCTION public.can_upload_media(user_id uuid, media_type text) OWNER TO postgres;

--
-- Name: check_dating_limits(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_dating_limits() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    profile RECORD;
    user_premium RECORD;
BEGIN
    -- Buscar perfil e plano do usuário
    SELECT dp.*, u.premium_type, u.is_verified
    INTO profile
    FROM dating_profiles dp
    JOIN users u ON dp.user_id = u.id
    WHERE dp.user_id = NEW.swiper_id;
    
    -- Resetar limites se necessário
    IF profile.last_limit_reset < CURRENT_DATE THEN
        UPDATE dating_profiles
        SET 
            daily_likes_used = 0,
            daily_super_likes_used = 0,
            daily_rewinds_used = 0,
            last_limit_reset = CURRENT_DATE
        WHERE user_id = NEW.swiper_id;
        
        -- Recarregar profile
        SELECT * INTO profile
        FROM dating_profiles
        WHERE user_id = NEW.swiper_id;
    END IF;
    
    -- Verificar limites baseado no plano
    IF NEW.action = 'like' THEN
        IF profile.daily_likes_used >= profile.daily_likes_limit THEN
            RAISE EXCEPTION 'Daily like limit exceeded';
        END IF;
        
        UPDATE dating_profiles
        SET daily_likes_used = daily_likes_used + 1
        WHERE user_id = NEW.swiper_id;
        
    ELSIF NEW.action = 'super_like' THEN
        IF profile.daily_super_likes_used >= profile.daily_super_likes_limit THEN
            RAISE EXCEPTION 'Daily super like limit exceeded';
        END IF;
        
        UPDATE dating_profiles
        SET daily_super_likes_used = daily_super_likes_used + 1
        WHERE user_id = NEW.swiper_id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.check_dating_limits() OWNER TO postgres;

--
-- Name: check_message_limits(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_message_limits() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_record RECORD;
BEGIN
    SELECT * INTO user_record FROM users WHERE id = NEW.sender_id;
    
    -- Check limits for non-verified Gold users
    IF user_record.premium_type = 'gold' AND NOT user_record.is_verified THEN
        IF user_record.daily_messages_sent >= user_record.daily_message_limit THEN
            RAISE EXCEPTION 'Daily message limit exceeded';
        END IF;
        
        -- Increment counter
        UPDATE users 
        SET daily_messages_sent = daily_messages_sent + 1
        WHERE id = NEW.sender_id;
    ELSIF user_record.premium_type = 'free' THEN
        RAISE EXCEPTION 'Messages not available for free plan';
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.check_message_limits() OWNER TO postgres;

--
-- Name: check_mutual_follow(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_mutual_follow() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN    -- Check if the other user already follows back
    IF EXISTS (
        SELECT 1 FROM follows 
        WHERE follower_id = NEW.following_id 
        AND following_id = NEW.follower_id
    ) THEN
        -- Create friendship if not exists
        INSERT INTO friends (user_id, friend_id, status, accepted_at)
        VALUES (NEW.follower_id, NEW.following_id, 'accepted', NOW())
        ON CONFLICT (user_id, friend_id) DO NOTHING;
        
        INSERT INTO friends (user_id, friend_id, status, accepted_at)
        VALUES (NEW.following_id, NEW.follower_id, 'accepted', NOW())
        ON CONFLICT (user_id, friend_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.check_mutual_follow() OWNER TO postgres;

--
-- Name: check_story_limit(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_story_limit() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_plan RECORD;
    daily_limit INTEGER;
    current_count INTEGER;
BEGIN
    -- Get user plan and verification status
    SELECT premium_type, is_verified 
    INTO user_plan
    FROM users 
    WHERE id = NEW.user_id;
    
    -- Determine daily limit based on plan
    CASE user_plan.premium_type
        WHEN 'free' THEN
            daily_limit := CASE WHEN user_plan.is_verified THEN 3 ELSE 0 END;
        WHEN 'gold' THEN
            daily_limit := CASE WHEN user_plan.is_verified THEN 10 ELSE 5 END;
        WHEN 'diamond' THEN
            daily_limit := CASE WHEN user_plan.is_verified THEN 999 ELSE 10 END; -- 999 = unlimited
        WHEN 'couple' THEN
            daily_limit := CASE WHEN user_plan.is_verified THEN 999 ELSE 10 END;
        ELSE
            daily_limit := 0;
    END CASE;
    
    -- Check if limit record exists and reset if needed
    INSERT INTO story_daily_limits (user_id, daily_limit, stories_posted_today)
    VALUES (NEW.user_id, daily_limit, 0)
    ON CONFLICT (user_id) DO UPDATE
    SET 
        daily_limit = daily_limit,
        stories_posted_today = CASE 
            WHEN story_daily_limits.last_reset_date < CURRENT_DATE THEN 0
            ELSE story_daily_limits.stories_posted_today
        END,
        last_reset_date = CASE 
            WHEN story_daily_limits.last_reset_date < CURRENT_DATE THEN CURRENT_DATE
            ELSE story_daily_limits.last_reset_date
        END;
    
    -- Get current count
    SELECT stories_posted_today INTO current_count
    FROM story_daily_limits
    WHERE user_id = NEW.user_id;
    
    -- Check limit
    IF current_count >= daily_limit THEN
        RAISE EXCEPTION 'Daily story limit reached';
    END IF;
    
    -- Increment counter
    UPDATE story_daily_limits
    SET stories_posted_today = stories_posted_today + 1
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.check_story_limit() OWNER TO postgres;

--
-- Name: check_upload_limits(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_upload_limits() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_record RECORD;
    photo_count INTEGER;
    video_count INTEGER;
    array_size INTEGER;
BEGIN
    SELECT * INTO user_record FROM users WHERE id = NEW.user_id;
    
    -- Count media types
    photo_count := 0;
    video_count := 0;
    
    -- Verificar se media_types não é NULL antes do loop
    IF NEW.media_types IS NOT NULL THEN
        array_size := array_length(NEW.media_types, 1);
        
        IF array_size IS NOT NULL AND array_size > 0 THEN
            FOR i IN 1..array_size LOOP
                IF NEW.media_types[i] = 'image' THEN
                    photo_count := photo_count + 1;
                ELSIF NEW.media_types[i] = 'video' THEN
                    video_count := video_count + 1;
                END IF;
            END LOOP;
        END IF;
    END IF;
    
    -- Por enquanto, apenas retornar NEW sem fazer validações
    -- As validações de limite são feitas na aplicação
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.check_upload_limits() OWNER TO postgres;

--
-- Name: check_user_can_upload(uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_user_can_upload(p_user_id uuid, p_media_type text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_user RECORD;
BEGIN
    SELECT premium_type, is_verified 
    INTO v_user
    FROM users 
    WHERE id = p_user_id;
    
    CASE p_media_type
        WHEN 'avatar', 'cover' THEN
            RETURN TRUE;
        WHEN 'post' THEN
            RETURN v_user.premium_type IN ('gold', 'diamond', 'couple');
        WHEN 'story' THEN
            RETURN (v_user.premium_type = 'free' AND v_user.is_verified) 
                OR v_user.premium_type IN ('gold', 'diamond', 'couple');
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$;


ALTER FUNCTION public.check_user_can_upload(p_user_id uuid, p_media_type text) OWNER TO postgres;

--
-- Name: cleanup_expired_invitations(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cleanup_expired_invitations() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE couple_invitations
    SET status = 'expired'
    WHERE status = 'pending' 
    AND expires_at < NOW();
END;
$$;


ALTER FUNCTION public.cleanup_expired_invitations() OWNER TO postgres;

--
-- Name: cleanup_expired_stories(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cleanup_expired_stories() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE stories
    SET status = 'expired'
    WHERE status = 'active'
    AND expires_at < NOW();
    
    -- Also expire boosts
    UPDATE story_boosts
    SET is_active = false
    WHERE is_active = true
    AND expires_at < NOW();
    
    UPDATE trending_boosts
    SET is_active = false
    WHERE is_active = true
    AND expires_at < NOW();
END;
$$;


ALTER FUNCTION public.cleanup_expired_stories() OWNER TO postgres;

--
-- Name: create_conversation_for_match(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_conversation_for_match(match_id uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    new_conversation_id UUID;
BEGIN
    -- Create a new conversation
    INSERT INTO conversations DEFAULT VALUES
    RETURNING id INTO new_conversation_id;
    
    -- Update the match with the conversation ID
    UPDATE dating_matches
    SET conversation_id = new_conversation_id
    WHERE id = match_id;
    
    RETURN new_conversation_id;
END;
$$;


ALTER FUNCTION public.create_conversation_for_match(match_id uuid) OWNER TO postgres;

--
-- Name: create_couple_settings(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_couple_settings() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO couple_settings (couple_id)
    VALUES (NEW.id);
    
    -- Also create default shared album
    INSERT INTO couple_shared_albums (couple_id, created_by)
    SELECT NEW.id, cu.user_id
    FROM couple_users cu
    WHERE cu.couple_id = NEW.id AND cu.role = 'primary'
    LIMIT 1;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.create_couple_settings() OWNER TO postgres;

--
-- Name: create_dating_match(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_dating_match() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    other_swipe RECORD;
    match_id UUID;
BEGIN
    -- Só processa likes (não passes)
    IF NEW.action IN ('like', 'super_like') THEN
        -- Verificar se há like mútuo
        SELECT * INTO other_swipe
        FROM dating_swipes
        WHERE swiper_id = NEW.swiped_id
        AND swiped_id = NEW.swiper_id
        AND action IN ('like', 'super_like');
        
        IF FOUND THEN
            -- Criar match
            INSERT INTO dating_matches (
                user1_id,
                user2_id,
                match_type
            ) VALUES (
                LEAST(NEW.swiper_id, NEW.swiped_id),
                GREATEST(NEW.swiper_id, NEW.swiped_id),
                CASE 
                    WHEN NEW.action = 'super_like' OR other_swipe.action = 'super_like' 
                    THEN 'super_like' 
                    ELSE 'regular' 
                END
            ) RETURNING id INTO match_id;
            
            -- Atualizar ambos os swipes
            UPDATE dating_swipes
            SET 
                is_match = true,
                matched_at = NOW(),
                match_id = match_id
            WHERE (swiper_id = NEW.swiper_id AND swiped_id = NEW.swiped_id)
               OR (swiper_id = NEW.swiped_id AND swiped_id = NEW.swiper_id);
            
            -- Criar conversa automaticamente
            PERFORM create_conversation_for_match(match_id);
            
            -- Atualizar estatísticas
            UPDATE dating_profiles
            SET stats = jsonb_set(
                stats,
                '{total_matches}',
                (COALESCE((stats->>'total_matches')::int, 0) + 1)::text::jsonb
            )
            WHERE user_id IN (NEW.swiper_id, NEW.swiped_id);
        END IF;
    END IF;
    
    -- Atualizar estatísticas de likes dados
    UPDATE dating_profiles
    SET stats = jsonb_set(
        stats,
        CASE NEW.action 
            WHEN 'super_like' THEN '{total_super_likes_given}'
            ELSE '{total_likes_given}'
        END,
        (COALESCE((stats->>(
            CASE NEW.action 
                WHEN 'super_like' THEN 'total_super_likes_given'
                ELSE 'total_likes_given'
            END
        ))::int, 0) + 1)::text::jsonb
    )
    WHERE user_id = NEW.swiper_id;
    
    -- Atualizar estatísticas de likes recebidos
    IF NEW.action != 'pass' THEN
        UPDATE dating_profiles
        SET stats = jsonb_set(
            stats,
            CASE NEW.action 
                WHEN 'super_like' THEN '{total_super_likes_received}'
                ELSE '{total_likes_received}'
            END,
            (COALESCE((stats->>(
                CASE NEW.action 
                    WHEN 'super_like' THEN 'total_super_likes_received'
                    ELSE 'total_likes_received'
                END
            ))::int, 0) + 1)::text::jsonb
        )
        WHERE user_id = NEW.swiped_id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.create_dating_match() OWNER TO postgres;

--
-- Name: decrement_collection_posts(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.decrement_collection_posts(collection_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.saved_collections 
  SET posts_count = GREATEST(0, posts_count - 1) 
  WHERE id = collection_id;
END;
$$;


ALTER FUNCTION public.decrement_collection_posts(collection_id uuid) OWNER TO postgres;

--
-- Name: decrement_post_comments(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.decrement_post_comments(post_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.posts 
  SET comments_count = GREATEST(0, comments_count - 1) 
  WHERE id = post_id;
END;
$$;


ALTER FUNCTION public.decrement_post_comments(post_id uuid) OWNER TO postgres;

--
-- Name: decrement_post_likes(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.decrement_post_likes(post_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.posts
  SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
  WHERE id = post_id;
END;
$$;


ALTER FUNCTION public.decrement_post_likes(post_id uuid) OWNER TO postgres;

--
-- Name: decrement_post_saves(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.decrement_post_saves(post_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.posts 
  SET saves_count = GREATEST(0, saves_count - 1) 
  WHERE id = post_id;
END;
$$;


ALTER FUNCTION public.decrement_post_saves(post_id uuid) OWNER TO postgres;

--
-- Name: decrement_post_shares(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.decrement_post_shares(post_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.posts 
  SET shares_count = GREATEST(0, shares_count - 1) 
  WHERE id = post_id;
END;
$$;


ALTER FUNCTION public.decrement_post_shares(post_id uuid) OWNER TO postgres;

--
-- Name: get_poll_with_stats(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_poll_with_stats(poll_id_param uuid) RETURNS TABLE(id uuid, question text, options jsonb, total_votes bigint, expires_at timestamp with time zone, multiple_choice boolean, user_has_voted boolean, user_votes integer[])
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.question,
        p.options,
        COALESCE(COUNT(DISTINCT pv.user_id), 0) AS total_votes,
        p.expires_at,
        p.allows_multiple AS multiple_choice,
        EXISTS(
            SELECT 1 FROM poll_votes 
            WHERE poll_id = p.id AND user_id = auth.uid()
        ) AS user_has_voted,
        (
            SELECT option_ids 
            FROM poll_votes 
            WHERE poll_id = p.id AND user_id = auth.uid()
            LIMIT 1
        ) AS user_votes
    FROM polls p
    LEFT JOIN poll_votes pv ON p.id = pv.poll_id
    WHERE p.id = poll_id_param
    GROUP BY p.id;
END;
$$;


ALTER FUNCTION public.get_poll_with_stats(poll_id_param uuid) OWNER TO postgres;

--
-- Name: handle_couple_dissolution(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_couple_dissolution() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Update all users who were in this couple
    UPDATE users
    SET 
        couple_id = NULL,
        is_in_couple = false,
        premium_type = CASE 
            WHEN premium_type = 'couple' THEN 'free'
            ELSE premium_type
        END,
        premium_status = CASE 
            WHEN premium_type = 'couple' THEN 'inactive'  
            ELSE premium_status
        END,
        premium_expires_at = CASE 
            WHEN premium_type = 'couple' THEN NULL
            ELSE premium_expires_at
        END,
        is_premium = CASE 
            WHEN premium_type = 'couple' THEN false
            ELSE is_premium
        END
    WHERE couple_id = OLD.id;
    
    RETURN OLD;
END;
$$;


ALTER FUNCTION public.handle_couple_dissolution() OWNER TO postgres;

--
-- Name: handle_post_reaction_change(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_post_reaction_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_post_reaction_counts(NEW.post_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_post_reaction_counts(OLD.post_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.handle_post_reaction_change() OWNER TO postgres;

--
-- Name: handle_post_saves_collection_count(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_post_saves_collection_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Se é INSERT e tem collection_id
  IF TG_OP = 'INSERT' AND NEW.collection_id IS NOT NULL THEN
    PERFORM increment_collection_posts(NEW.collection_id);
  END IF;
  
  -- Se é DELETE e tinha collection_id
  IF TG_OP = 'DELETE' AND OLD.collection_id IS NOT NULL THEN
    PERFORM decrement_collection_posts(OLD.collection_id);
  END IF;
  
  -- Se é UPDATE e a collection mudou
  IF TG_OP = 'UPDATE' THEN
    -- Se saiu de uma collection
    IF OLD.collection_id IS NOT NULL AND NEW.collection_id IS NULL THEN
      PERFORM decrement_collection_posts(OLD.collection_id);
    END IF;
    
    -- Se entrou em uma collection
    IF OLD.collection_id IS NULL AND NEW.collection_id IS NOT NULL THEN
      PERFORM increment_collection_posts(NEW.collection_id);
    END IF;
    
    -- Se mudou de collection
    IF OLD.collection_id IS NOT NULL AND NEW.collection_id IS NOT NULL AND OLD.collection_id != NEW.collection_id THEN
      PERFORM decrement_collection_posts(OLD.collection_id);
      PERFORM increment_collection_posts(NEW.collection_id);
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION public.handle_post_saves_collection_count() OWNER TO postgres;

--
-- Name: immutable_date_extract(timestamp with time zone); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.immutable_date_extract(timestamp with time zone) RETURNS date
    LANGUAGE sql IMMUTABLE
    AS $_$
  SELECT ($1)::date;
$_$;


ALTER FUNCTION public.immutable_date_extract(timestamp with time zone) OWNER TO postgres;

--
-- Name: increment_collection_posts(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.increment_collection_posts(collection_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.saved_collections 
  SET posts_count = posts_count + 1 
  WHERE id = collection_id;
END;
$$;


ALTER FUNCTION public.increment_collection_posts(collection_id uuid) OWNER TO postgres;

--
-- Name: increment_post_comments(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.increment_post_comments(post_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.posts 
  SET comments_count = comments_count + 1 
  WHERE id = post_id;
END;
$$;


ALTER FUNCTION public.increment_post_comments(post_id uuid) OWNER TO postgres;

--
-- Name: increment_post_likes(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.increment_post_likes(post_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.posts
  SET likes_count = COALESCE(likes_count, 0) + 1
  WHERE id = post_id;
END;
$$;


ALTER FUNCTION public.increment_post_likes(post_id uuid) OWNER TO postgres;

--
-- Name: increment_post_saves(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.increment_post_saves(post_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.posts 
  SET saves_count = saves_count + 1 
  WHERE id = post_id;
END;
$$;


ALTER FUNCTION public.increment_post_saves(post_id uuid) OWNER TO postgres;

--
-- Name: increment_post_shares(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.increment_post_shares(post_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.posts 
  SET shares_count = shares_count + 1 
  WHERE id = post_id;
END;
$$;


ALTER FUNCTION public.increment_post_shares(post_id uuid) OWNER TO postgres;

--
-- Name: process_content_purchase(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.process_content_purchase() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    commission RECORD;
BEGIN
    -- Calcular comissão
    SELECT * INTO commission
    FROM calculate_content_commission(
        (SELECT creator_id FROM paid_content WHERE id = NEW.content_id),
        NEW.amount_paid,
        (SELECT content_type FROM paid_content WHERE id = NEW.content_id)
    );
    
    -- Atualizar valores de comissão
    NEW.platform_fee := commission.platform_fee;
    NEW.creator_revenue := commission.creator_revenue;
    NEW.platform_fee_percentage := ROUND((commission.platform_fee / NEW.amount_paid * 100), 2);
    
    -- Atualizar estatísticas do conteúdo
    UPDATE paid_content
    SET 
        sales_count = sales_count + 1,
        total_revenue = total_revenue + NEW.creator_revenue
    WHERE id = NEW.content_id;
    
    -- Atualizar receita do criador/business
    UPDATE users
    SET stats = jsonb_set(
        stats,
        '{total_earnings}',
        (COALESCE((stats->>'total_earnings')::decimal, 0) + NEW.creator_revenue)::text::jsonb
    )
    WHERE id = (SELECT creator_id FROM paid_content WHERE id = NEW.content_id);
    
    -- Se tem business associado, atualizar também
    UPDATE businesses
    SET total_revenue = total_revenue + NEW.creator_revenue
    WHERE id = (
        SELECT business_id 
        FROM paid_content 
        WHERE id = NEW.content_id 
        AND business_id IS NOT NULL
    );
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.process_content_purchase() OWNER TO postgres;

--
-- Name: process_credit_transaction(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.process_credit_transaction() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    current_balance INTEGER;
BEGIN
    -- Get current balance
    SELECT credit_balance INTO current_balance
    FROM user_credits
    WHERE user_id = NEW.user_id
    FOR UPDATE;
    
    -- Verify balance for spending
    IF NEW.amount < 0 AND current_balance + NEW.amount < 0 THEN
        RAISE EXCEPTION 'Insufficient credits';
    END IF;
    
    -- Set balance before/after
    NEW.balance_before := current_balance;
    NEW.balance_after := current_balance + NEW.amount;
    
    -- Update user credits
    UPDATE user_credits
    SET 
        credit_balance = credit_balance + NEW.amount,
        total_purchased = CASE 
            WHEN NEW.type = 'purchase' THEN total_purchased + NEW.amount 
            ELSE total_purchased 
        END,
        total_spent = CASE 
            WHEN NEW.type = 'spend' THEN total_spent + ABS(NEW.amount)
            ELSE total_spent 
        END,
        total_gifted = CASE 
            WHEN NEW.type = 'gift_sent' THEN total_gifted + ABS(NEW.amount)
            ELSE total_gifted 
        END,
        total_received = CASE 
            WHEN NEW.type = 'gift_received' THEN total_received + NEW.amount
            ELSE total_received 
        END,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Handle gift received
    IF NEW.type = 'gift_received' AND NEW.other_user_id IS NOT NULL THEN
        UPDATE user_credits
        SET 
            credit_balance = credit_balance + NEW.amount,
            total_received = total_received + NEW.amount,
            updated_at = NOW()
        WHERE user_id = NEW.other_user_id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.process_credit_transaction() OWNER TO postgres;

--
-- Name: reset_daily_limits(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reset_daily_limits() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE users 
    SET daily_messages_sent = 0
    WHERE premium_type = 'gold' AND is_verified = false;
END;
$$;


ALTER FUNCTION public.reset_daily_limits() OWNER TO postgres;

--
-- Name: reset_monthly_limits(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reset_monthly_limits() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE users 
    SET 
        monthly_photos_uploaded = 0,
        monthly_videos_uploaded = 0,
        monthly_events_created = 0;
END;
$$;


ALTER FUNCTION public.reset_monthly_limits() OWNER TO postgres;

--
-- Name: safe_array_length(anyarray); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.safe_array_length(arr anyarray) RETURNS integer
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
    IF arr IS NULL THEN
        RETURN 0;
    ELSE
        RETURN array_length(arr, 1);
    END IF;
END;
$$;


ALTER FUNCTION public.safe_array_length(arr anyarray) OWNER TO postgres;

--
-- Name: set_user_limits(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_user_limits() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN    CASE NEW.premium_type
        WHEN 'free' THEN
            NEW.daily_message_limit := 0;
            NEW.monthly_photo_limit := 3;
            NEW.monthly_video_limit := 0;
        WHEN 'gold' THEN
            IF NEW.is_verified THEN
                NEW.daily_message_limit := -1; -- unlimited
                NEW.monthly_photo_limit := 50;
                NEW.monthly_video_limit := 10;
            ELSE
                NEW.daily_message_limit := 10;
                NEW.monthly_photo_limit := 20;
                NEW.monthly_video_limit := 5;
            END IF;
        WHEN 'diamond', 'couple' THEN
            NEW.daily_message_limit := -1;
            NEW.monthly_photo_limit := -1;
            NEW.monthly_video_limit := -1;
    END CASE;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_user_limits() OWNER TO postgres;

--
-- Name: sync_couple_premium(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sync_couple_premium() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN    IF NEW.premium_type = 'couple' THEN
        -- Ensure both users in a couple have the same premium status
        UPDATE users 
        SET 
            premium_type = 'couple',
            premium_status = NEW.premium_status,
            premium_expires_at = NEW.premium_expires_at
        WHERE couple_id = NEW.couple_id 
        AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.sync_couple_premium() OWNER TO postgres;

--
-- Name: sync_couple_premium_status(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sync_couple_premium_status() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    couple_users_record RECORD;
BEGIN
    -- If user's premium_type changed to 'couple', sync with partner
    IF NEW.premium_type = 'couple' AND NEW.couple_id IS NOT NULL THEN
        -- Update all other users in the same couple
        UPDATE users 
        SET 
            premium_type = 'couple',
            premium_status = NEW.premium_status,
            premium_expires_at = NEW.premium_expires_at,
            is_premium = true
        WHERE couple_id = NEW.couple_id 
        AND id != NEW.id;
        
    -- If user's premium expired or downgraded, check if they were the payer
    ELSIF OLD.premium_type = 'couple' AND NEW.premium_type != 'couple' AND NEW.couple_id IS NOT NULL THEN
        -- Check if this user was the primary payer
        SELECT * INTO couple_users_record
        FROM couple_users
        WHERE couple_id = NEW.couple_id AND user_id = NEW.id AND role = 'primary';
        
        -- If primary user downgraded, downgrade partner too
        IF couple_users_record IS NOT NULL THEN
            UPDATE users
            SET 
                premium_type = 'free',
                premium_status = 'inactive',
                premium_expires_at = NULL,
                is_premium = false
            WHERE couple_id = NEW.couple_id 
            AND id != NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.sync_couple_premium_status() OWNER TO postgres;

--
-- Name: update_collection_posts_count(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_collection_posts_count() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.collection_id IS NOT NULL THEN
      UPDATE public.saved_collections
      SET posts_count = COALESCE(posts_count, 0) + 1
      WHERE id = NEW.collection_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.collection_id IS NOT NULL THEN
      UPDATE public.saved_collections
      SET posts_count = GREATEST(COALESCE(posts_count, 0) - 1, 0)
      WHERE id = OLD.collection_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle collection change
    IF OLD.collection_id IS DISTINCT FROM NEW.collection_id THEN
      IF OLD.collection_id IS NOT NULL THEN
        UPDATE public.saved_collections
        SET posts_count = GREATEST(COALESCE(posts_count, 0) - 1, 0)
        WHERE id = OLD.collection_id;
      END IF;
      IF NEW.collection_id IS NOT NULL THEN
        UPDATE public.saved_collections
        SET posts_count = COALESCE(posts_count, 0) + 1
        WHERE id = NEW.collection_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;
END;
$$;


ALTER FUNCTION public.update_collection_posts_count() OWNER TO postgres;

--
-- Name: update_conversation_last_message(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_conversation_last_message() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN    UPDATE conversations
    SET 
        last_message_id = NEW.id,
        last_message_at = NEW.created_at,
        last_message_preview = CASE 
            WHEN NEW.type = 'text' THEN LEFT(NEW.content, 100)
            ELSE NEW.type::text
        END
    WHERE id = NEW.conversation_id;
    
    -- Update unread count for all participants except sender
    UPDATE conversation_participants
    SET unread_count = unread_count + 1
    WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_conversation_last_message() OWNER TO postgres;

--
-- Name: update_post_comments_count(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_post_comments_count() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET comments_count = COALESCE(comments_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$;


ALTER FUNCTION public.update_post_comments_count() OWNER TO postgres;

--
-- Name: update_post_likes_count(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_post_likes_count() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET likes_count = COALESCE(likes_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$;


ALTER FUNCTION public.update_post_likes_count() OWNER TO postgres;

--
-- Name: update_post_reaction_counts(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_post_reaction_counts(p_post_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    UPDATE public.posts SET
        like_count = (SELECT COUNT(*) FROM public.post_reactions WHERE post_id = p_post_id AND reaction_type = 'like'),
        love_count = (SELECT COUNT(*) FROM public.post_reactions WHERE post_id = p_post_id AND reaction_type = 'love'),
        laugh_count = (SELECT COUNT(*) FROM public.post_reactions WHERE post_id = p_post_id AND reaction_type = 'laugh'),
        wow_count = (SELECT COUNT(*) FROM public.post_reactions WHERE post_id = p_post_id AND reaction_type = 'wow'),
        sad_count = (SELECT COUNT(*) FROM public.post_reactions WHERE post_id = p_post_id AND reaction_type = 'sad'),
        angry_count = (SELECT COUNT(*) FROM public.post_reactions WHERE post_id = p_post_id AND reaction_type = 'angry'),
        updated_at = NOW()
    WHERE id = p_post_id;
END;
$$;


ALTER FUNCTION public.update_post_reaction_counts(p_post_id uuid) OWNER TO postgres;

--
-- Name: update_post_saves_count(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_post_saves_count() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET saves_count = COALESCE(saves_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET saves_count = GREATEST(COALESCE(saves_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$;


ALTER FUNCTION public.update_post_saves_count() OWNER TO postgres;

--
-- Name: update_post_shares_count(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_post_shares_count() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET shares_count = COALESCE(shares_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET shares_count = GREATEST(COALESCE(shares_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$;


ALTER FUNCTION public.update_post_shares_count() OWNER TO postgres;

--
-- Name: update_post_shares_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_post_shares_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_post_shares_updated_at() OWNER TO postgres;

--
-- Name: update_post_stats(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_post_stats() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN    IF TG_TABLE_NAME = 'likes' THEN
        IF TG_OP = 'INSERT' AND NEW.target_type = 'post' THEN
            UPDATE posts 
            SET stats = jsonb_set(stats, '{likes_count}', 
                (COALESCE((stats->>'likes_count')::int, 0) + 1)::text::jsonb)
            WHERE id = NEW.target_id;
        ELSIF TG_OP = 'DELETE' AND OLD.target_type = 'post' THEN
            UPDATE posts 
            SET stats = jsonb_set(stats, '{likes_count}', 
                GREATEST(0, COALESCE((stats->>'likes_count')::int, 0) - 1)::text::jsonb)
            WHERE id = OLD.target_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'comments' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE posts 
            SET stats = jsonb_set(stats, '{comments_count}', 
                (COALESCE((stats->>'comments_count')::int, 0) + 1)::text::jsonb)
            WHERE id = NEW.post_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE posts 
            SET stats = jsonb_set(stats, '{comments_count}', 
                GREATEST(0, COALESCE((stats->>'comments_count')::int, 0) - 1)::text::jsonb)
            WHERE id = OLD.post_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION public.update_post_stats() OWNER TO postgres;

--
-- Name: update_saved_collections_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_saved_collections_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_saved_collections_updated_at() OWNER TO postgres;

--
-- Name: update_story_view_stats(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_story_view_stats() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Update view count
    UPDATE stories
    SET 
        view_count = view_count + 1,
        unique_view_count = (
            SELECT COUNT(DISTINCT viewer_id) 
            FROM story_views 
            WHERE story_id = NEW.story_id
        )
    WHERE id = NEW.story_id;
    
    -- Update reaction count if applicable
    IF NEW.reaction IS NOT NULL THEN
        UPDATE stories
        SET reaction_count = (
            SELECT COUNT(*) 
            FROM story_views 
            WHERE story_id = NEW.story_id 
            AND reaction IS NOT NULL
        )
        WHERE id = NEW.story_id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_story_view_stats() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- Name: update_user_stats(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_user_stats() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN    IF TG_TABLE_NAME = 'follows' THEN
        IF TG_OP = 'INSERT' THEN
            -- Update follower's following count
            UPDATE users 
            SET stats = jsonb_set(stats, '{following}', 
                (COALESCE((stats->>'following')::int, 0) + 1)::text::jsonb)
            WHERE id = NEW.follower_id;
            
            -- Update following's follower count
            UPDATE users 
            SET stats = jsonb_set(stats, '{followers}', 
                (COALESCE((stats->>'followers')::int, 0) + 1)::text::jsonb)
            WHERE id = NEW.following_id;
        ELSIF TG_OP = 'DELETE' THEN
            -- Update follower's following count
            UPDATE users 
            SET stats = jsonb_set(stats, '{following}', 
                GREATEST(0, COALESCE((stats->>'following')::int, 0) - 1)::text::jsonb)
            WHERE id = OLD.follower_id;
            
            -- Update following's follower count
            UPDATE users 
            SET stats = jsonb_set(stats, '{followers}', 
                GREATEST(0, COALESCE((stats->>'followers')::int, 0) - 1)::text::jsonb)
            WHERE id = OLD.following_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION public.update_user_stats() OWNER TO postgres;

--
-- Name: update_user_verifications_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_user_verifications_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_user_verifications_updated_at() OWNER TO postgres;

--
-- Name: validate_message_permissions(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validate_message_permissions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    sender_premium_type premium_type;
    conversation_initiator UUID;
    can_send BOOLEAN := false;
BEGIN
    -- Buscar tipo de plano do remetente
    SELECT premium_type INTO sender_premium_type
    FROM users WHERE id = NEW.sender_id;
    
    -- Diamond e Couple sempre podem enviar
    IF sender_premium_type IN ('diamond', 'couple') THEN
        can_send := true;
    
    -- Gold verifica limites
    ELSIF sender_premium_type = 'gold' THEN
        can_send := true; -- Verificação de limite diário em outro trigger
    
    -- Free só pode responder
    ELSIF sender_premium_type = 'free' THEN
        -- Buscar quem iniciou a conversa
        SELECT initiated_by INTO conversation_initiator
        FROM conversations WHERE id = NEW.conversation_id;
        
        -- Free pode enviar se não foi ele que iniciou E foi iniciada por premium
        IF conversation_initiator != NEW.sender_id THEN
            SELECT EXISTS (
                SELECT 1 FROM users 
                WHERE id = conversation_initiator 
                AND premium_type != 'free'
            ) INTO can_send;
        END IF;
    END IF;
    
    IF NOT can_send THEN
        RAISE EXCEPTION 'Usuário não tem permissão para enviar mensagem';
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.validate_message_permissions() OWNER TO postgres;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(objects.path_tokens, 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: ad_campaigns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ad_campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid,
    name character varying(200) NOT NULL,
    description text,
    objective public.campaign_objective NOT NULL,
    total_budget integer NOT NULL,
    daily_budget integer,
    spent_credits integer DEFAULT 0,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    schedule_hours integer[],
    schedule_days integer[],
    targeting jsonb DEFAULT '{"location": {"cities": [], "states": [], "radius_km": null, "exclude_locations": []}, "behaviors": {"verified_only": false, "active_last_days": 30, "premium_users_only": false}, "interests": [], "demographics": {"age_max": 65, "age_min": 18, "genders": [], "relationship_status": []}}'::jsonb NOT NULL,
    metrics jsonb DEFAULT '{"cpc": 0, "ctr": 0, "roi": 0, "spent": 0, "clicks": 0, "conversions": 0, "impressions": 0}'::jsonb,
    optimization_goal character varying(50),
    bid_strategy character varying(50) DEFAULT 'automatic'::character varying,
    max_bid_amount integer,
    status public.ad_status DEFAULT 'draft'::public.ad_status,
    approval_status character varying(20) DEFAULT 'pending'::character varying,
    rejection_reasons text[],
    approved_at timestamp with time zone,
    paused_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.ad_campaigns OWNER TO postgres;

--
-- Name: ad_impressions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ad_impressions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ad_id uuid,
    user_id uuid,
    was_clicked boolean DEFAULT false,
    click_timestamp timestamp with time zone,
    placement character varying(50),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.ad_impressions OWNER TO postgres;

--
-- Name: ad_interactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ad_interactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ad_id uuid,
    campaign_id uuid,
    user_id uuid,
    interaction_type character varying(20) NOT NULL,
    placement character varying(50) NOT NULL,
    device_type character varying(20),
    click_position jsonb,
    time_to_click integer,
    conversion_type character varying(50),
    conversion_value numeric(10,2),
    user_location point,
    distance_from_business double precision,
    user_agent text,
    ip_address inet,
    referrer text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT ad_interactions_interaction_type_check CHECK (((interaction_type)::text = ANY ((ARRAY['impression'::character varying, 'click'::character varying, 'conversion'::character varying, 'dismiss'::character varying, 'report'::character varying])::text[])))
);


ALTER TABLE public.ad_interactions OWNER TO postgres;

--
-- Name: admin_action_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_action_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    admin_id uuid,
    action public.admin_action_type NOT NULL,
    action_description text NOT NULL,
    target_type character varying(50) NOT NULL,
    target_id uuid,
    target_data jsonb,
    changes jsonb,
    reason text,
    notes text,
    ip_address inet NOT NULL,
    user_agent text,
    request_id uuid,
    was_successful boolean DEFAULT true,
    error_message text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.admin_action_logs OWNER TO postgres;

--
-- Name: admin_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    metric_date date NOT NULL,
    metric_hour integer,
    total_users integer DEFAULT 0,
    new_users integer DEFAULT 0,
    active_users integer DEFAULT 0,
    premium_users integer DEFAULT 0,
    verified_users integer DEFAULT 0,
    revenue_total numeric(12,2) DEFAULT 0,
    revenue_subscriptions numeric(12,2) DEFAULT 0,
    revenue_credits numeric(12,2) DEFAULT 0,
    revenue_content numeric(12,2) DEFAULT 0,
    refunds_total numeric(12,2) DEFAULT 0,
    posts_created integer DEFAULT 0,
    posts_removed integer DEFAULT 0,
    messages_sent integer DEFAULT 0,
    reports_created integer DEFAULT 0,
    reports_resolved integer DEFAULT 0,
    users_banned integer DEFAULT 0,
    content_removed integer DEFAULT 0,
    businesses_total integer DEFAULT 0,
    businesses_new integer DEFAULT 0,
    businesses_verified integer DEFAULT 0,
    ads_served integer DEFAULT 0,
    dating_profiles_active integer DEFAULT 0,
    swipes_total integer DEFAULT 0,
    matches_created integer DEFAULT 0,
    api_requests integer DEFAULT 0,
    api_errors integer DEFAULT 0,
    average_response_time double precision,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.admin_metrics OWNER TO postgres;

--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    employee_id character varying(50),
    full_name character varying(200) NOT NULL,
    access_level integer NOT NULL,
    departments public.admin_department[] NOT NULL,
    is_department_head boolean DEFAULT false,
    permissions jsonb DEFAULT '{"users": {"ban": false, "edit": false, "view": false, "delete": false, "impersonate": false}, "system": {"logs": false, "backups": false, "settings": false}, "content": {"view": false, "delete": false, "moderate": false}, "business": {"view": false, "verify": false, "suspend": false}, "financial": {"view": false, "refund": false, "reports": false}}'::jsonb NOT NULL,
    last_login timestamp with time zone,
    last_ip inet,
    login_count integer DEFAULT 0,
    actions_count integer DEFAULT 0,
    two_factor_enabled boolean DEFAULT false,
    two_factor_secret character varying(255),
    password_changed_at timestamp with time zone DEFAULT now(),
    must_change_password boolean DEFAULT false,
    is_active boolean DEFAULT true,
    deactivated_at timestamp with time zone,
    deactivation_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT admin_users_access_level_check CHECK (((access_level >= 1) AND (access_level <= 5)))
);


ALTER TABLE public.admin_users OWNER TO postgres;

--
-- Name: advertisements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.advertisements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    advertiser_id uuid,
    title character varying(200) NOT NULL,
    content text,
    media_url text,
    cta_text character varying(50),
    cta_url text,
    target_age_min integer,
    target_age_max integer,
    target_genders public.gender_type[],
    target_locations text[] DEFAULT '{}'::text[],
    target_interests text[] DEFAULT '{}'::text[],
    budget numeric(10,2),
    cost_per_impression numeric(10,4),
    cost_per_click numeric(10,2),
    impressions integer DEFAULT 0,
    clicks integer DEFAULT 0,
    status public.ad_status DEFAULT 'pending'::public.ad_status,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.advertisements OWNER TO postgres;

--
-- Name: blocked_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blocked_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    blocker_id uuid,
    blocked_id uuid,
    reason text,
    created_at timestamp with time zone DEFAULT now(),
    blocked_at timestamp with time zone DEFAULT now(),
    CONSTRAINT no_self_block CHECK ((blocker_id <> blocked_id))
);


ALTER TABLE public.blocked_users OWNER TO postgres;

--
-- Name: business_ads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_ads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    campaign_id uuid,
    business_id uuid,
    format public.ad_format NOT NULL,
    placement_priority integer DEFAULT 5,
    content jsonb NOT NULL,
    variations jsonb DEFAULT '[]'::jsonb,
    winning_variation integer,
    impressions integer DEFAULT 0,
    unique_impressions integer DEFAULT 0,
    clicks integer DEFAULT 0,
    unique_clicks integer DEFAULT 0,
    conversions integer DEFAULT 0,
    credits_spent integer DEFAULT 0,
    metrics_by_day jsonb DEFAULT '{}'::jsonb,
    metrics_by_hour jsonb DEFAULT '{}'::jsonb,
    metrics_by_placement jsonb DEFAULT '{}'::jsonb,
    status public.ad_status DEFAULT 'draft'::public.ad_status,
    quality_score integer,
    first_served_at timestamp with time zone,
    last_served_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.business_ads OWNER TO postgres;

--
-- Name: business_team; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_team (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid,
    user_id uuid,
    role character varying(50) NOT NULL,
    permissions jsonb DEFAULT '{}'::jsonb,
    department character varying(100),
    title character varying(100),
    is_active boolean DEFAULT true,
    joined_at timestamp with time zone DEFAULT now(),
    removed_at timestamp with time zone
);


ALTER TABLE public.business_team OWNER TO postgres;

--
-- Name: businesses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.businesses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid,
    business_type public.business_type NOT NULL,
    business_name character varying(200) NOT NULL,
    legal_name character varying(200),
    cnpj character varying(18),
    description text,
    short_description character varying(500),
    category character varying(100),
    subcategories text[] DEFAULT '{}'::text[],
    tags text[] DEFAULT '{}'::text[],
    address jsonb,
    coordinates point,
    business_hours jsonb,
    service_area_radius integer,
    contact jsonb NOT NULL,
    social_links jsonb DEFAULT '{}'::jsonb,
    is_verified boolean DEFAULT false,
    verified_at timestamp with time zone,
    verification_level integer DEFAULT 0,
    verification_documents text[] DEFAULT '{}'::text[],
    logo_url text,
    cover_image_url text,
    gallery_urls text[] DEFAULT '{}'::text[],
    credit_balance integer DEFAULT 0,
    total_credits_purchased integer DEFAULT 0,
    total_credits_spent integer DEFAULT 0,
    total_revenue numeric(12,2) DEFAULT 0,
    settings jsonb DEFAULT '{"auto_reply": false, "allow_reviews": true, "notifications": true, "show_in_search": true}'::jsonb,
    features jsonb DEFAULT '{"max_products": 0, "can_advertise": true, "can_have_store": false, "commission_rate": 0.20, "can_sell_content": false, "can_create_events": true, "max_events_per_month": 10}'::jsonb,
    stats jsonb DEFAULT '{"total_sales": 0, "total_views": 0, "total_reviews": 0, "average_rating": 0, "total_followers": 0}'::jsonb,
    status character varying(20) DEFAULT 'active'::character varying,
    suspension_reason text,
    slug character varying(100),
    meta_description text,
    meta_keywords text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_active_at timestamp with time zone DEFAULT now(),
    CONSTRAINT businesses_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'active'::character varying, 'suspended'::character varying, 'banned'::character varying])::text[])))
);


ALTER TABLE public.businesses OWNER TO postgres;

--
-- Name: calls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calls (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid,
    caller_id uuid,
    call_type public.call_type NOT NULL,
    status public.call_status DEFAULT 'ringing'::public.call_status,
    participants uuid[] DEFAULT '{}'::uuid[],
    started_at timestamp with time zone,
    ended_at timestamp with time zone,
    duration_seconds integer,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.calls OWNER TO postgres;

--
-- Name: comment_likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comment_likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    comment_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.comment_likes OWNER TO postgres;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid,
    user_id uuid,
    parent_id uuid,
    content text NOT NULL,
    media_urls text[] DEFAULT '{}'::text[],
    stats jsonb DEFAULT '{"likes": 0, "replies": 0}'::jsonb,
    is_reported boolean DEFAULT false,
    is_hidden boolean DEFAULT false,
    is_edited boolean DEFAULT false,
    edited_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: communities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.communities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    creator_id uuid,
    name character varying(100) NOT NULL,
    description text,
    avatar_url text,
    cover_url text,
    is_private boolean DEFAULT false,
    requires_approval boolean DEFAULT false,
    is_verified boolean DEFAULT false,
    category character varying(50),
    tags text[] DEFAULT '{}'::text[],
    location character varying(255),
    city character varying(100),
    uf character varying(2),
    member_count integer DEFAULT 0,
    post_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.communities OWNER TO postgres;

--
-- Name: community_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.community_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    community_id uuid,
    user_id uuid,
    role character varying(20) DEFAULT 'member'::character varying,
    can_post boolean DEFAULT true,
    can_comment boolean DEFAULT true,
    can_invite boolean DEFAULT false,
    status character varying(20) DEFAULT 'active'::character varying,
    joined_at timestamp with time zone DEFAULT now(),
    left_at timestamp with time zone,
    CONSTRAINT community_members_role_check CHECK (((role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'moderator'::character varying, 'member'::character varying])::text[]))),
    CONSTRAINT community_members_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'banned'::character varying, 'left'::character varying])::text[])))
);


ALTER TABLE public.community_members OWNER TO postgres;

--
-- Name: content_purchases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_purchases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    buyer_id uuid,
    content_id uuid,
    amount_paid numeric(10,2) NOT NULL,
    original_price numeric(10,2) NOT NULL,
    discount_applied numeric(10,2) DEFAULT 0,
    currency character varying(3) DEFAULT 'BRL'::character varying,
    payment_method public.payment_method NOT NULL,
    payment_reference character varying(255),
    platform_fee numeric(10,2) NOT NULL,
    platform_fee_percentage numeric(5,2) NOT NULL,
    creator_revenue numeric(10,2) NOT NULL,
    access_expires_at timestamp with time zone,
    download_count integer DEFAULT 0,
    max_downloads integer DEFAULT 3,
    last_accessed timestamp with time zone,
    status character varying(20) DEFAULT 'completed'::character varying,
    refund_reason text,
    refunded_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT content_purchases_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'refunded'::character varying, 'disputed'::character varying])::text[])))
);


ALTER TABLE public.content_purchases OWNER TO postgres;

--
-- Name: content_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_id uuid,
    buyer_id uuid,
    purchase_id uuid,
    rating integer NOT NULL,
    comment text,
    helpful_count integer DEFAULT 0,
    unhelpful_count integer DEFAULT 0,
    is_verified_purchase boolean DEFAULT true,
    is_hidden boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT content_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.content_reviews OWNER TO postgres;

--
-- Name: conversation_participants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversation_participants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid,
    user_id uuid,
    role character varying(20) DEFAULT 'member'::character varying,
    status character varying(20) DEFAULT 'active'::character varying,
    notifications_enabled boolean DEFAULT true,
    is_pinned boolean DEFAULT false,
    last_read_at timestamp with time zone DEFAULT now(),
    unread_count integer DEFAULT 0,
    joined_at timestamp with time zone DEFAULT now(),
    left_at timestamp with time zone,
    CONSTRAINT conversation_participants_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'member'::character varying])::text[]))),
    CONSTRAINT conversation_participants_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'left'::character varying, 'removed'::character varying])::text[])))
);


ALTER TABLE public.conversation_participants OWNER TO postgres;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type character varying(20) NOT NULL,
    name character varying(100),
    description text,
    avatar_url text,
    created_by uuid,
    max_participants integer DEFAULT 50,
    is_archived boolean DEFAULT false,
    last_message_id uuid,
    last_message_at timestamp with time zone,
    last_message_preview text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    initiated_by uuid,
    initiated_by_premium boolean DEFAULT false,
    group_type character varying(50),
    CONSTRAINT conversations_group_type_check CHECK (((group_type)::text = ANY ((ARRAY['user_created'::character varying, 'event'::character varying, 'community'::character varying])::text[]))),
    CONSTRAINT conversations_type_check CHECK (((type)::text = ANY ((ARRAY['direct'::character varying, 'group'::character varying])::text[])))
);


ALTER TABLE public.conversations OWNER TO postgres;

--
-- Name: couple_album_photos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.couple_album_photos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    album_id uuid NOT NULL,
    couple_id uuid NOT NULL,
    uploaded_by uuid NOT NULL,
    photo_url text NOT NULL,
    thumbnail_url text,
    caption text,
    location character varying(255),
    latitude numeric(10,8),
    longitude numeric(11,8),
    file_size integer,
    file_type character varying(20),
    width integer,
    height integer,
    taken_at timestamp with time zone,
    uploaded_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.couple_album_photos OWNER TO postgres;

--
-- Name: couple_diary_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.couple_diary_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    couple_id uuid NOT NULL,
    author_id uuid NOT NULL,
    title character varying(200) NOT NULL,
    content text NOT NULL,
    mood character varying(50),
    date date NOT NULL,
    is_private boolean DEFAULT false,
    visible_to character varying(20) DEFAULT 'both'::character varying,
    photos text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT couple_diary_entries_visible_to_check CHECK (((visible_to)::text = ANY ((ARRAY['both'::character varying, 'author_only'::character varying, 'partner_only'::character varying])::text[])))
);


ALTER TABLE public.couple_diary_entries OWNER TO postgres;

--
-- Name: couple_game_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.couple_game_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    couple_id uuid NOT NULL,
    game_id uuid NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying,
    score_user1 integer DEFAULT 0,
    score_user2 integer DEFAULT 0,
    current_round integer DEFAULT 1,
    total_rounds integer DEFAULT 1,
    game_data jsonb DEFAULT '{}'::jsonb,
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    last_activity_at timestamp with time zone DEFAULT now(),
    CONSTRAINT couple_game_sessions_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'abandoned'::character varying])::text[])))
);


ALTER TABLE public.couple_game_sessions OWNER TO postgres;

--
-- Name: couple_games; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.couple_games (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    category character varying(50),
    min_duration_minutes integer,
    max_duration_minutes integer,
    difficulty_level integer,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT couple_games_difficulty_level_check CHECK (((difficulty_level >= 1) AND (difficulty_level <= 5)))
);


ALTER TABLE public.couple_games OWNER TO postgres;

--
-- Name: couple_invitations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.couple_invitations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    from_user_id uuid NOT NULL,
    to_user_id uuid,
    to_email character varying(255),
    to_phone character varying(20),
    message text NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT check_invitation_target CHECK (((to_user_id IS NOT NULL) OR (to_email IS NOT NULL) OR (to_phone IS NOT NULL))),
    CONSTRAINT couple_invitations_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'declined'::character varying, 'expired'::character varying])::text[])))
);


ALTER TABLE public.couple_invitations OWNER TO postgres;

--
-- Name: couple_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.couple_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    couple_id uuid NOT NULL,
    payer_user_id uuid NOT NULL,
    subscription_id uuid,
    amount numeric(10,2) DEFAULT 69.90 NOT NULL,
    currency character varying(3) DEFAULT 'BRL'::character varying,
    payment_method public.payment_method NOT NULL,
    provider public.payment_provider NOT NULL,
    provider_subscription_id character varying(255),
    status character varying(20) DEFAULT 'active'::character varying,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    trial_ends_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT couple_payments_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'cancelled'::character varying, 'expired'::character varying, 'trial'::character varying])::text[])))
);


ALTER TABLE public.couple_payments OWNER TO postgres;

--
-- Name: couple_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.couple_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    couple_id uuid NOT NULL,
    shared_profile boolean DEFAULT true,
    shared_stats boolean DEFAULT true,
    allow_partner_posting boolean DEFAULT false,
    auto_tag_partner boolean DEFAULT false,
    shared_calendar boolean DEFAULT true,
    notifications jsonb DEFAULT '{"couple_games": true, "partner_posts": true, "shared_memories": true, "anniversary_reminders": true}'::jsonb,
    privacy jsonb DEFAULT '{"diary_access": "both", "stats_sharing": true, "album_visibility": "couple_only"}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.couple_settings OWNER TO postgres;

--
-- Name: couple_shared_albums; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.couple_shared_albums (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    couple_id uuid NOT NULL,
    name character varying(100) DEFAULT 'Nosso Álbum'::character varying,
    description text,
    cover_image_url text,
    is_private boolean DEFAULT true,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.couple_shared_albums OWNER TO postgres;

--
-- Name: couple_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.couple_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    couple_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role character varying(20) DEFAULT 'secondary'::character varying,
    joined_at timestamp with time zone DEFAULT now(),
    CONSTRAINT couple_users_role_check CHECK (((role)::text = ANY ((ARRAY['primary'::character varying, 'secondary'::character varying])::text[])))
);


ALTER TABLE public.couple_users OWNER TO postgres;

--
-- Name: couples; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.couples (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    couple_name character varying(100),
    couple_avatar_url text,
    couple_cover_url text,
    anniversary_date date,
    bio text,
    shared_album_id uuid,
    shared_diary_id uuid,
    shared_playlist_url text,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.couples OWNER TO postgres;

--
-- Name: creator_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.creator_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    subscriber_id uuid,
    creator_id uuid,
    business_id uuid,
    tier character varying(50) NOT NULL,
    price numeric(10,2) NOT NULL,
    billing_period public.billing_period NOT NULL,
    status public.subscription_status DEFAULT 'active'::public.subscription_status,
    benefits jsonb DEFAULT '{}'::jsonb,
    payment_method public.payment_method,
    last_payment_date timestamp with time zone,
    next_payment_date timestamp with time zone,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    cancelled_at timestamp with time zone,
    cancellation_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.creator_subscriptions OWNER TO postgres;

--
-- Name: credit_costs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credit_costs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    action_type character varying(50) NOT NULL,
    category character varying(50) NOT NULL,
    credit_cost integer NOT NULL,
    unit character varying(20) DEFAULT 'unit'::character varying,
    is_active boolean DEFAULT true,
    min_purchase integer DEFAULT 1,
    max_purchase integer,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.credit_costs OWNER TO postgres;

--
-- Name: credit_packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credit_packages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    credits integer NOT NULL,
    bonus_credits integer DEFAULT 0,
    price numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true,
    is_promotional boolean DEFAULT false,
    valid_until timestamp with time zone,
    description text,
    features text[] DEFAULT '{}'::text[],
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.credit_packages OWNER TO postgres;

--
-- Name: credit_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credit_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid,
    type public.credit_transaction_type NOT NULL,
    amount integer NOT NULL,
    balance_before integer NOT NULL,
    balance_after integer NOT NULL,
    description text NOT NULL,
    reference_id uuid,
    reference_type character varying(50),
    package_id uuid,
    payment_method public.payment_method,
    payment_amount numeric(10,2),
    payment_status character varying(20),
    payment_reference character varying(255),
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.credit_transactions OWNER TO postgres;

--
-- Name: dating_matches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dating_matches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user1_id uuid,
    user2_id uuid,
    status public.match_status DEFAULT 'active'::public.match_status,
    match_type character varying(20) DEFAULT 'regular'::character varying,
    last_interaction timestamp with time zone,
    total_messages integer DEFAULT 0,
    conversation_id uuid,
    unmatched_by uuid,
    unmatched_at timestamp with time zone,
    unmatch_reason character varying(100),
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone DEFAULT (now() + '30 days'::interval),
    CONSTRAINT dating_matches_match_type_check CHECK (((match_type)::text = ANY ((ARRAY['regular'::character varying, 'super_like'::character varying, 'top_pick'::character varying])::text[]))),
    CONSTRAINT no_self_match CHECK ((user1_id <> user2_id)),
    CONSTRAINT ordered_users CHECK ((user1_id < user2_id))
);


ALTER TABLE public.dating_matches OWNER TO postgres;

--
-- Name: dating_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dating_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    is_active boolean DEFAULT true,
    visibility character varying(20) DEFAULT 'visible'::character varying,
    last_active timestamp with time zone DEFAULT now(),
    preferences jsonb DEFAULT '{"genders": [], "distance": 50, "age_range": {"max": 99, "min": 18}, "interests": [], "languages": ["pt"], "distance_unit": "km", "relationship_goals": [], "show_me_in_searches": true}'::jsonb NOT NULL,
    bio text,
    prompts jsonb DEFAULT '[]'::jsonb,
    photos jsonb DEFAULT '[]'::jsonb,
    photo_verified boolean DEFAULT false,
    photo_verified_at timestamp with time zone,
    current_location point,
    current_location_name character varying(255),
    passport_location point,
    passport_location_name character varying(255),
    daily_likes_limit integer DEFAULT 50,
    daily_likes_used integer DEFAULT 0,
    daily_super_likes_limit integer DEFAULT 5,
    daily_super_likes_used integer DEFAULT 0,
    daily_rewinds_limit integer DEFAULT 3,
    daily_rewinds_used integer DEFAULT 0,
    last_limit_reset date DEFAULT CURRENT_DATE,
    boost_active boolean DEFAULT false,
    boost_expires_at timestamp with time zone,
    stats jsonb DEFAULT '{"profile_views": 0, "total_matches": 0, "conversion_rate": 0, "total_likes_given": 0, "total_messages_sent": 0, "total_likes_received": 0, "total_messages_received": 0, "total_super_likes_given": 0, "total_super_likes_received": 0}'::jsonb,
    settings jsonb DEFAULT '{"show_age": true, "smart_photos": false, "show_distance": true, "auto_play_videos": true, "show_recently_active": true, "top_picks_notifications": true}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT dating_profiles_visibility_check CHECK (((visibility)::text = ANY ((ARRAY['visible'::character varying, 'hidden'::character varying, 'paused'::character varying])::text[])))
);


ALTER TABLE public.dating_profiles OWNER TO postgres;

--
-- Name: dating_swipes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dating_swipes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    swiper_id uuid,
    swiped_id uuid,
    action public.swipe_action NOT NULL,
    shown_at timestamp with time zone DEFAULT now(),
    swiped_at timestamp with time zone DEFAULT now(),
    time_to_swipe integer,
    is_match boolean DEFAULT false,
    matched_at timestamp with time zone,
    match_id uuid,
    swiper_location point,
    distance_km double precision,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT no_self_swipe CHECK ((swiper_id <> swiped_id))
);


ALTER TABLE public.dating_swipes OWNER TO postgres;

--
-- Name: dating_top_picks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dating_top_picks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    pick_user_id uuid,
    score double precision NOT NULL,
    reasons text[] DEFAULT '{}'::text[],
    is_viewed boolean DEFAULT false,
    is_swiped boolean DEFAULT false,
    swipe_action public.swipe_action,
    valid_until timestamp with time zone DEFAULT (now() + '24:00:00'::interval),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.dating_top_picks OWNER TO postgres;

--
-- Name: event_participants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_participants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid,
    user_id uuid,
    status character varying(20) DEFAULT 'interested'::character varying,
    guest_count integer DEFAULT 0,
    guest_names text[] DEFAULT '{}'::text[],
    joined_at timestamp with time zone DEFAULT now(),
    CONSTRAINT event_participants_status_check CHECK (((status)::text = ANY ((ARRAY['interested'::character varying, 'going'::character varying, 'maybe'::character varying])::text[])))
);


ALTER TABLE public.event_participants OWNER TO postgres;

--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    creator_id uuid,
    title character varying(200) NOT NULL,
    description text,
    cover_image_url text,
    event_type public.event_type NOT NULL,
    category character varying(50),
    tags text[] DEFAULT '{}'::text[],
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    timezone character varying(50) DEFAULT 'America/Sao_Paulo'::character varying,
    is_online boolean DEFAULT false,
    location_name character varying(200),
    location_address text,
    latitude numeric(10,8),
    longitude numeric(11,8),
    online_link text,
    max_participants integer,
    current_participants integer DEFAULT 0,
    requires_approval boolean DEFAULT false,
    allows_guests boolean DEFAULT true,
    is_paid boolean DEFAULT false,
    price numeric(10,2),
    currency character varying(3) DEFAULT 'BRL'::character varying,
    visibility public.visibility_type DEFAULT 'public'::public.visibility_type,
    min_age integer,
    max_age integer,
    gender_restriction public.gender_type,
    stats jsonb DEFAULT '{"going": 0, "maybe": 0, "interested": 0}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: financial_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.financial_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    report_type character varying(20) NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    revenue jsonb DEFAULT '{"total": 0, "content": {"commission": 0, "sales_count": 0, "gross_amount": 0}, "credits": {"amount": 0, "packages_sold": 0}, "subscriptions": {"gold": {"count": 0, "amount": 0}, "couple": {"count": 0, "amount": 0}, "diamond": {"count": 0, "amount": 0}}}'::jsonb NOT NULL,
    expenses jsonb DEFAULT '{"refunds": 0, "chargebacks": 0, "operational": 0, "payment_processing": 0}'::jsonb,
    metrics jsonb DEFAULT '{"cac": 0, "ltv": 0, "mrr": 0, "arpu": 0, "churn_rate": 0, "growth_rate": 0}'::jsonb,
    is_final boolean DEFAULT false,
    generated_by uuid,
    generated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT financial_reports_report_type_check CHECK (((report_type)::text = ANY ((ARRAY['daily'::character varying, 'weekly'::character varying, 'monthly'::character varying, 'quarterly'::character varying, 'yearly'::character varying])::text[])))
);


ALTER TABLE public.financial_reports OWNER TO postgres;

--
-- Name: follows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.follows (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    follower_id uuid,
    following_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT no_self_follow CHECK ((follower_id <> following_id))
);


ALTER TABLE public.follows OWNER TO postgres;

--
-- Name: friends; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.friends (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    friend_id uuid,
    status public.friend_status DEFAULT 'pending'::public.friend_status,
    created_at timestamp with time zone DEFAULT now(),
    accepted_at timestamp with time zone,
    CONSTRAINT no_self_friend CHECK ((user_id <> friend_id))
);


ALTER TABLE public.friends OWNER TO postgres;

--
-- Name: likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    target_id uuid NOT NULL,
    target_type character varying(20) NOT NULL,
    reaction_type character varying(20) DEFAULT 'like'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT likes_target_type_check CHECK (((target_type)::text = ANY ((ARRAY['post'::character varying, 'comment'::character varying])::text[])))
);


ALTER TABLE public.likes OWNER TO postgres;

--
-- Name: message_reactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.message_reactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id uuid,
    user_id uuid,
    reaction character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.message_reactions OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid,
    sender_id uuid,
    content text,
    type public.message_type DEFAULT 'text'::public.message_type,
    media_urls text[] DEFAULT '{}'::text[],
    reply_to_id uuid,
    is_edited boolean DEFAULT false,
    edited_at timestamp with time zone,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp with time zone,
    delivered_at timestamp with time zone,
    is_read boolean DEFAULT false,
    read_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipient_id uuid,
    sender_id uuid,
    type character varying(50) NOT NULL,
    title text NOT NULL,
    content text,
    icon character varying(50),
    related_data jsonb DEFAULT '{}'::jsonb,
    action_url text,
    is_read boolean DEFAULT false,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: paid_content; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.paid_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    creator_id uuid,
    business_id uuid,
    title character varying(200) NOT NULL,
    slug character varying(200),
    description text,
    category public.content_category NOT NULL,
    subcategory character varying(50),
    tags text[] DEFAULT '{}'::text[],
    is_adult boolean DEFAULT false,
    preview_urls text[] NOT NULL,
    preview_type character varying(20),
    content_urls text[] NOT NULL,
    content_type public.paid_content_type NOT NULL,
    duration integer,
    file_sizes integer[],
    dimensions jsonb,
    item_count integer DEFAULT 1,
    price numeric(10,2) NOT NULL,
    original_price numeric(10,2),
    currency character varying(3) DEFAULT 'BRL'::character varying,
    discount_percentage integer,
    discount_valid_until timestamp with time zone,
    promo_code character varying(50),
    sales_count integer DEFAULT 0,
    total_revenue numeric(12,2) DEFAULT 0,
    views_count integer DEFAULT 0,
    likes_count integer DEFAULT 0,
    rating_average numeric(3,2) DEFAULT 0,
    rating_count integer DEFAULT 0,
    settings jsonb DEFAULT '{"watermark": true, "allow_ratings": true, "drm_protected": false, "allow_comments": true, "allow_downloads": false}'::jsonb,
    is_exclusive boolean DEFAULT false,
    available_until timestamp with time zone,
    stock_limit integer,
    stock_sold integer DEFAULT 0,
    status public.content_status DEFAULT 'draft'::public.content_status,
    rejection_reason text,
    meta_description text,
    meta_keywords text[],
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT paid_content_discount_percentage_check CHECK (((discount_percentage >= 0) AND (discount_percentage <= 90)))
);


ALTER TABLE public.paid_content OWNER TO postgres;

--
-- Name: payment_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    subscription_id uuid,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'BRL'::character varying,
    payment_method public.payment_method NOT NULL,
    provider public.payment_provider NOT NULL,
    provider_payment_id character varying(255),
    status character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT payment_history_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[])))
);


ALTER TABLE public.payment_history OWNER TO postgres;

--
-- Name: polls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.polls (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    creator_id uuid,
    question text NOT NULL,
    options jsonb NOT NULL,
    max_options integer DEFAULT 2,
    allows_multiple boolean DEFAULT false,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT polls_max_options_check CHECK (((max_options >= 2) AND (max_options <= 4)))
);


ALTER TABLE public.polls OWNER TO postgres;

--
-- Name: poll_options; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.poll_options AS
 SELECT polls.id AS poll_id,
    (option.value ->> 'id'::text) AS id,
    (option.value ->> 'text'::text) AS text,
    ((option.value ->> 'votes'::text))::integer AS votes_count
   FROM public.polls,
    LATERAL jsonb_array_elements(polls.options) option(value);


ALTER VIEW public.poll_options OWNER TO postgres;

--
-- Name: poll_votes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.poll_votes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    poll_id uuid,
    user_id uuid,
    option_ids integer[] NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.poll_votes OWNER TO postgres;

--
-- Name: post_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.post_comments OWNER TO postgres;

--
-- Name: post_likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.post_likes OWNER TO postgres;

--
-- Name: posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    couple_id uuid,
    content text,
    media_urls text[] DEFAULT '{}'::text[],
    media_types text[] DEFAULT '{}'::text[],
    media_thumbnails text[] DEFAULT '{}'::text[],
    visibility public.visibility_type DEFAULT 'public'::public.visibility_type,
    is_premium_content boolean DEFAULT false,
    price numeric(10,2),
    poll_id uuid,
    location character varying(255),
    latitude numeric(10,8),
    longitude numeric(11,8),
    hashtags text[] DEFAULT '{}'::text[],
    mentions text[] DEFAULT '{}'::text[],
    post_type public.post_type DEFAULT 'regular'::public.post_type,
    story_expires_at timestamp with time zone,
    is_event boolean DEFAULT false,
    event_id uuid,
    stats jsonb DEFAULT '{"likes_count": 0, "views_count": 0, "shares_count": 0, "comments_count": 0}'::jsonb,
    is_reported boolean DEFAULT false,
    is_hidden boolean DEFAULT false,
    report_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    saves_count integer DEFAULT 0,
    shares_count integer DEFAULT 0,
    likes_count integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    like_count integer DEFAULT 0,
    love_count integer DEFAULT 0,
    laugh_count integer DEFAULT 0,
    wow_count integer DEFAULT 0,
    sad_count integer DEFAULT 0,
    angry_count integer DEFAULT 0
);


ALTER TABLE public.posts OWNER TO postgres;

--
-- Name: post_polls; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.post_polls AS
 SELECT p.id AS post_id,
    poll.id,
    poll.question,
    poll.expires_at,
    poll.options,
    poll.max_options,
    poll.allows_multiple,
    poll.created_at,
    ( SELECT count(DISTINCT poll_votes.user_id) AS count
           FROM public.poll_votes
          WHERE (poll_votes.poll_id = poll.id)) AS total_votes,
    ( SELECT array_agg(poll_votes.option_ids) AS array_agg
           FROM public.poll_votes
          WHERE ((poll_votes.poll_id = poll.id) AND (poll_votes.user_id = auth.uid()))) AS user_votes
   FROM (public.posts p
     JOIN public.polls poll ON ((p.poll_id = poll.id)))
  WHERE (poll.id IS NOT NULL);


ALTER VIEW public.post_polls OWNER TO postgres;

--
-- Name: post_reactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_reactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    reaction_type character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT post_reactions_reaction_type_check CHECK (((reaction_type)::text = ANY ((ARRAY['like'::character varying, 'love'::character varying, 'laugh'::character varying, 'wow'::character varying, 'sad'::character varying, 'angry'::character varying])::text[])))
);


ALTER TABLE public.post_reactions OWNER TO postgres;

--
-- Name: post_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reporter_id uuid,
    post_id uuid,
    reason character varying(100) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'pending'::character varying,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT post_reports_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'reviewed'::character varying, 'resolved'::character varying, 'dismissed'::character varying])::text[])))
);


ALTER TABLE public.post_reports OWNER TO postgres;

--
-- Name: post_saves; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_saves (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    collection_id uuid,
    saved_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.post_saves OWNER TO postgres;

--
-- Name: post_shares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_shares (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    share_type character varying(20) DEFAULT 'public'::character varying NOT NULL,
    message text,
    shared_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT post_shares_share_type_check CHECK (((share_type)::text = ANY ((ARRAY['public'::character varying, 'private'::character varying, 'story'::character varying])::text[])))
);


ALTER TABLE public.post_shares OWNER TO postgres;

--
-- Name: profile_seals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profile_seals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    icon_url text NOT NULL,
    description text,
    credit_cost integer NOT NULL,
    is_available boolean DEFAULT true,
    available_until timestamp with time zone,
    display_order integer DEFAULT 0,
    category character varying(50),
    times_gifted integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.profile_seals OWNER TO postgres;

--
-- Name: profile_views; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profile_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    viewer_id uuid,
    viewed_id uuid,
    view_source character varying(50),
    anonymous boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.profile_views OWNER TO postgres;

--
-- Name: saved_collections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.saved_collections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_private boolean DEFAULT true,
    posts_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.saved_collections OWNER TO postgres;

--
-- Name: saved_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.saved_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    post_id uuid,
    folder_name character varying(50) DEFAULT 'default'::character varying,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.saved_posts OWNER TO postgres;

--
-- Name: stories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    media_url text NOT NULL,
    media_type character varying(20) NOT NULL,
    thumbnail_url text,
    caption text,
    duration integer DEFAULT 5,
    width integer,
    height integer,
    file_size integer,
    is_public boolean DEFAULT true,
    is_highlighted boolean DEFAULT false,
    highlight_color character varying(7),
    is_boosted boolean DEFAULT false,
    boost_expires_at timestamp with time zone,
    boost_credits_spent integer DEFAULT 0,
    boost_impressions integer DEFAULT 0,
    view_count integer DEFAULT 0,
    unique_view_count integer DEFAULT 0,
    reaction_count integer DEFAULT 0,
    reply_count integer DEFAULT 0,
    status public.story_status DEFAULT 'active'::public.story_status,
    expires_at timestamp with time zone DEFAULT (now() + '24:00:00'::interval),
    created_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT stories_media_type_check CHECK (((media_type)::text = ANY ((ARRAY['image'::character varying, 'video'::character varying])::text[])))
);

ALTER TABLE ONLY public.stories FORCE ROW LEVEL SECURITY;


ALTER TABLE public.stories OWNER TO postgres;

--
-- Name: story_boosts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.story_boosts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    story_id uuid,
    user_id uuid,
    credits_spent integer NOT NULL,
    boost_duration_hours integer DEFAULT 24 NOT NULL,
    impressions_gained integer DEFAULT 0,
    clicks_gained integer DEFAULT 0,
    profile_visits_gained integer DEFAULT 0,
    priority_score integer DEFAULT 100,
    is_active boolean DEFAULT true,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.story_boosts OWNER TO postgres;

--
-- Name: story_daily_limits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.story_daily_limits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    daily_limit integer NOT NULL,
    stories_posted_today integer DEFAULT 0,
    last_reset_date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.story_daily_limits FORCE ROW LEVEL SECURITY;


ALTER TABLE public.story_daily_limits OWNER TO postgres;

--
-- Name: story_replies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.story_replies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    story_id uuid,
    sender_id uuid,
    message text NOT NULL,
    media_url text,
    media_type character varying(20),
    is_read boolean DEFAULT false,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT story_replies_media_type_check CHECK (((media_type)::text = ANY ((ARRAY['image'::character varying, 'video'::character varying, 'gif'::character varying])::text[])))
);


ALTER TABLE public.story_replies OWNER TO postgres;

--
-- Name: story_views; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.story_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    story_id uuid,
    viewer_id uuid,
    viewer_type public.story_viewer_type DEFAULT 'regular'::public.story_viewer_type,
    viewed_at timestamp with time zone DEFAULT now(),
    view_duration integer,
    completion_rate numeric(5,2),
    reaction public.story_reaction,
    reacted_at timestamp with time zone,
    device_type character varying(20),
    ip_address inet
);


ALTER TABLE public.story_views OWNER TO postgres;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    plan_type public.premium_type NOT NULL,
    billing_period public.billing_period NOT NULL,
    payment_method public.payment_method NOT NULL,
    provider public.payment_provider NOT NULL,
    provider_subscription_id character varying(255),
    amount numeric(10,2) NOT NULL,
    discount_percentage integer DEFAULT 0,
    final_amount numeric(10,2) NOT NULL,
    status public.subscription_status DEFAULT 'active'::public.subscription_status,
    trial_ends_at timestamp with time zone,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    cancelled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: trending_boosts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trending_boosts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    boost_type character varying(50) NOT NULL,
    credits_spent integer NOT NULL,
    duration_hours integer NOT NULL,
    impressions_gained integer DEFAULT 0,
    interactions_gained integer DEFAULT 0,
    is_active boolean DEFAULT true,
    expires_at timestamp with time zone NOT NULL,
    priority_score integer DEFAULT 100,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT trending_boosts_boost_type_check CHECK (((boost_type)::text = ANY ((ARRAY['trending_feed'::character varying, 'explore_page'::character varying, 'open_date'::character varying])::text[])))
);


ALTER TABLE public.trending_boosts OWNER TO postgres;

--
-- Name: user_blocks; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.user_blocks AS
 SELECT id,
    blocker_id,
    blocked_id,
    reason,
    created_at AS blocked_at,
    created_at
   FROM public.blocked_users;


ALTER VIEW public.user_blocks OWNER TO postgres;

--
-- Name: user_credit_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_credit_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    type character varying(20) NOT NULL,
    amount integer NOT NULL,
    balance_before integer NOT NULL,
    balance_after integer NOT NULL,
    reference_type character varying(50),
    reference_id uuid,
    other_user_id uuid,
    payment_method public.payment_method,
    payment_amount numeric(10,2),
    payment_reference character varying(255),
    description text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_credit_transactions_type_check CHECK (((type)::text = ANY ((ARRAY['purchase'::character varying, 'spend'::character varying, 'gift_sent'::character varying, 'gift_received'::character varying, 'refund'::character varying, 'bonus'::character varying])::text[])))
);


ALTER TABLE public.user_credit_transactions OWNER TO postgres;

--
-- Name: user_credits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_credits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    credit_balance integer DEFAULT 0,
    total_purchased integer DEFAULT 0,
    total_spent integer DEFAULT 0,
    total_gifted integer DEFAULT 0,
    total_received integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_credits_credit_balance_check CHECK ((credit_balance >= 0))
);


ALTER TABLE public.user_credits OWNER TO postgres;

--
-- Name: user_profile_seals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profile_seals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipient_id uuid,
    sender_id uuid,
    seal_id uuid,
    message text,
    is_displayed boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone
);


ALTER TABLE public.user_profile_seals OWNER TO postgres;

--
-- Name: user_verifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name text NOT NULL,
    cpf text NOT NULL,
    birth_date date NOT NULL,
    document_type text NOT NULL,
    document_number text NOT NULL,
    document_front_url text NOT NULL,
    document_back_url text,
    selfie_url text NOT NULL,
    face_scan_data jsonb,
    status text DEFAULT 'pending'::text NOT NULL,
    verification_score numeric(5,2) DEFAULT 0.00,
    reviewed_by uuid,
    reviewer_notes text,
    submitted_at timestamp with time zone DEFAULT now(),
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_verifications_document_type_check CHECK ((document_type = ANY (ARRAY['rg'::text, 'cnh'::text, 'passport'::text]))),
    CONSTRAINT user_verifications_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'manual_review'::text])))
);


ALTER TABLE public.user_verifications OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    auth_id uuid,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(100),
    first_name character varying(50),
    last_name character varying(50),
    bio text,
    birth_date date,
    gender public.gender_type,
    profile_type public.profile_type DEFAULT 'single'::public.profile_type,
    location character varying(255),
    city character varying(100),
    uf character varying(2),
    state character varying(100),
    country character varying(100) DEFAULT 'Brazil'::character varying,
    latitude numeric(10,8),
    longitude numeric(11,8),
    avatar_url text,
    cover_url text,
    interests text[] DEFAULT '{}'::text[],
    seeking text[] DEFAULT '{}'::text[],
    looking_for text[] DEFAULT '{}'::text[],
    relationship_goals text[] DEFAULT '{}'::text[],
    is_premium boolean DEFAULT false,
    premium_type public.premium_type DEFAULT 'free'::public.premium_type,
    premium_status public.premium_status DEFAULT 'inactive'::public.premium_status,
    premium_expires_at timestamp with time zone,
    stripe_customer_id character varying(255),
    abacatepay_customer_id character varying(255),
    is_verified boolean DEFAULT false,
    verified_at timestamp with time zone,
    is_active boolean DEFAULT true,
    status public.user_status DEFAULT 'active'::public.user_status,
    role public.user_role DEFAULT 'user'::public.user_role,
    couple_id uuid,
    is_in_couple boolean DEFAULT false,
    daily_message_limit integer DEFAULT 0,
    daily_messages_sent integer DEFAULT 0,
    monthly_photo_limit integer DEFAULT 3,
    monthly_photos_uploaded integer DEFAULT 0,
    monthly_video_limit integer DEFAULT 0,
    monthly_videos_uploaded integer DEFAULT 0,
    monthly_events_created integer DEFAULT 0,
    privacy_settings jsonb DEFAULT '{"show_ads": true, "show_age": true, "show_location": true, "allow_messages": "everyone", "show_last_active": true, "profile_visibility": "public", "show_online_status": true}'::jsonb,
    notification_settings jsonb DEFAULT '{"like_notifications": true, "push_notifications": true, "email_notifications": true, "event_notifications": true, "follow_notifications": true, "comment_notifications": true, "message_notifications": true}'::jsonb,
    stats jsonb DEFAULT '{"posts": 0, "friends": 0, "followers": 0, "following": 0, "profile_views": 0, "likes_received": 0}'::jsonb,
    website character varying(255),
    social_links jsonb DEFAULT '{}'::jsonb,
    last_active_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    account_type public.account_type DEFAULT 'personal'::public.account_type,
    business_id uuid,
    admin_id uuid
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: verification_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.verification_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    document_type character varying(50),
    document_front_url text,
    document_back_url text,
    selfie_url text,
    verification_code character varying(20),
    status public.verification_status DEFAULT 'pending'::public.verification_status,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    rejection_reason text,
    notes text,
    attempt_number integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.verification_requests OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: messages_2025_07_30; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_07_30 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_07_30 OWNER TO supabase_admin;

--
-- Name: messages_2025_07_31; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_07_31 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_07_31 OWNER TO supabase_admin;

--
-- Name: messages_2025_08_01; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_08_01 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_08_01 OWNER TO supabase_admin;

--
-- Name: messages_2025_08_02; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_08_02 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_08_02 OWNER TO supabase_admin;

--
-- Name: messages_2025_08_03; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_08_03 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_08_03 OWNER TO supabase_admin;

--
-- Name: messages_2025_08_04; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_08_04 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_08_04 OWNER TO supabase_admin;

--
-- Name: messages_2025_08_05; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_08_05 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_08_05 OWNER TO supabase_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: postgres
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


ALTER TABLE supabase_migrations.schema_migrations OWNER TO postgres;

--
-- Name: seed_files; Type: TABLE; Schema: supabase_migrations; Owner: postgres
--

CREATE TABLE supabase_migrations.seed_files (
    path text NOT NULL,
    hash text NOT NULL
);


ALTER TABLE supabase_migrations.seed_files OWNER TO postgres;

--
-- Name: messages_2025_07_30; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_07_30 FOR VALUES FROM ('2025-07-30 00:00:00') TO ('2025-07-31 00:00:00');


--
-- Name: messages_2025_07_31; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_07_31 FOR VALUES FROM ('2025-07-31 00:00:00') TO ('2025-08-01 00:00:00');


--
-- Name: messages_2025_08_01; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_01 FOR VALUES FROM ('2025-08-01 00:00:00') TO ('2025-08-02 00:00:00');


--
-- Name: messages_2025_08_02; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_02 FOR VALUES FROM ('2025-08-02 00:00:00') TO ('2025-08-03 00:00:00');


--
-- Name: messages_2025_08_03; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_03 FOR VALUES FROM ('2025-08-03 00:00:00') TO ('2025-08-04 00:00:00');


--
-- Name: messages_2025_08_04; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_04 FOR VALUES FROM ('2025-08-04 00:00:00') TO ('2025-08-05 00:00:00');


--
-- Name: messages_2025_08_05; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_05 FOR VALUES FROM ('2025-08-05 00:00:00') TO ('2025-08-06 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	19cb49a7-5cb3-4baf-9253-eedf64857040	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"joao.moitinho@m2z.com.br","user_id":"1bbb304e-895e-4a4f-b5d0-598f6a5f73a9","user_phone":""}}	2025-07-11 04:00:00.752398+00	
00000000-0000-0000-0000-000000000000	265a054f-207b-49ce-9e1f-2a81847987cf	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"joao.moitinho@m2z.com.br","user_id":"1bbb304e-895e-4a4f-b5d0-598f6a5f73a9","user_phone":""}}	2025-07-11 04:00:01.678045+00	
00000000-0000-0000-0000-000000000000	4c11294f-6011-49f9-a996-d808e554b9ed	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"joao.moitinho@m2z.com.br","user_id":"c5ce9f34-a734-4440-87dc-7e80a3beeb6d","user_phone":""}}	2025-07-11 04:03:59.394411+00	
00000000-0000-0000-0000-000000000000	c89c7462-a677-412d-a5cb-4594218de48d	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"joao.moitinho@m2z.com.br","user_id":"c5ce9f34-a734-4440-87dc-7e80a3beeb6d","user_phone":""}}	2025-07-11 04:04:00.272021+00	
00000000-0000-0000-0000-000000000000	d4115d6e-ac72-42e3-ab16-93537e9a4eb7	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"joao.moitinho@m2z.com.br","user_id":"b1ed212a-8a15-4093-b4bb-74cc9f470e5e","user_phone":""}}	2025-07-11 04:05:22.734348+00	
00000000-0000-0000-0000-000000000000	115606b4-e692-4bf2-aa27-abd004842d05	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"joao.moitinho@m2z.com.br","user_id":"b1ed212a-8a15-4093-b4bb-74cc9f470e5e","user_phone":""}}	2025-07-11 04:05:23.530587+00	
00000000-0000-0000-0000-000000000000	308947ca-863a-42b8-82b6-1cc0fa0a1ba5	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"joao.moitinho@m2z.com.br","user_id":"c0f2054b-4417-4a2c-985e-ca8c809b6aff","user_phone":""}}	2025-07-11 04:07:55.629309+00	
00000000-0000-0000-0000-000000000000	ff5e8540-b297-4193-9247-8c25d2806ba6	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"joao.moitinho@m2z.com.br","user_id":"c0f2054b-4417-4a2c-985e-ca8c809b6aff","user_phone":""}}	2025-07-11 04:07:56.464858+00	
00000000-0000-0000-0000-000000000000	29de84b5-eb13-488e-bca5-6c842feff1b0	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"joao.moitinho@m2z.com.br","user_id":"720fa8e3-f37f-4439-a5a7-1ade72c6eccc","user_phone":""}}	2025-07-11 04:10:18.504978+00	
00000000-0000-0000-0000-000000000000	6bc24fda-a6d0-442f-8da4-31b3af09cc14	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"joao.moitinho@m2z.com.br","user_id":"720fa8e3-f37f-4439-a5a7-1ade72c6eccc","user_phone":""}}	2025-07-11 04:10:19.081579+00	
00000000-0000-0000-0000-000000000000	355e00e6-a1f9-401a-83bf-8fa9e2e25877	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"joao.moitinho@m2z.com.br","user_id":"0f4134cb-d567-46f3-979a-a7b67a57f261","user_phone":""}}	2025-07-11 04:12:09.833578+00	
00000000-0000-0000-0000-000000000000	888c8b50-2aaf-4de7-bb38-43ce2c75a4ad	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"joao.moitinho@m2z.com.br","user_id":"0f4134cb-d567-46f3-979a-a7b67a57f261","user_phone":""}}	2025-07-11 04:12:10.754928+00	
00000000-0000-0000-0000-000000000000	58628c95-c5f6-46a8-ba4c-35121f88a97a	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"joao.moitinho@m2z.com.br","user_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","user_phone":""}}	2025-07-11 04:13:15.14883+00	
00000000-0000-0000-0000-000000000000	55268b05-7357-421d-824d-2c3dad20f64a	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-11 04:13:44.714374+00	
00000000-0000-0000-0000-000000000000	146100b8-030f-4ea5-a654-b0e1c762bbb1	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-11 04:26:55.34602+00	
00000000-0000-0000-0000-000000000000	fb89e4df-80b0-44ce-9686-ca609e2276ff	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-11 04:59:14.281927+00	
00000000-0000-0000-0000-000000000000	76bd6503-d25b-42f8-b167-d6435d77efe6	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-11 05:10:22.536206+00	
00000000-0000-0000-0000-000000000000	fca8d556-5bdd-4afd-a698-fb60f4ebd7c0	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-11 05:11:41.135967+00	
00000000-0000-0000-0000-000000000000	5fa51924-99e3-4213-967d-f878c4185f84	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-11 05:25:50.854554+00	
00000000-0000-0000-0000-000000000000	e38fd3bb-602d-4e93-8598-bbc30aa21cf3	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-11 05:49:36.427922+00	
00000000-0000-0000-0000-000000000000	b935345e-7a88-4b53-9b02-f91d432f851a	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-11 06:14:03.553382+00	
00000000-0000-0000-0000-000000000000	092fe409-bf19-42cb-b6fd-64985bfb96b8	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-11 06:28:25.30898+00	
00000000-0000-0000-0000-000000000000	b7abbb97-427e-4637-a4ce-38421bc7412f	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-11 06:32:41.61009+00	
00000000-0000-0000-0000-000000000000	e182f90f-29f7-45dd-b8fe-4e66fb877d26	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-11 06:37:19.932318+00	
00000000-0000-0000-0000-000000000000	ddc9165b-efbf-4cea-8c0d-eae802ef90fd	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-11 06:55:25.983537+00	
00000000-0000-0000-0000-000000000000	4b03067e-e182-4624-b19d-c695f43c3c6c	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-11 18:25:31.290102+00	
00000000-0000-0000-0000-000000000000	ae200949-a011-4be3-abf6-49ce93612d72	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-11 18:25:31.3064+00	
00000000-0000-0000-0000-000000000000	cdc6ade1-2b7f-4ade-99d3-781123064f71	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-11 18:25:37.168491+00	
00000000-0000-0000-0000-000000000000	802b0b4b-a644-4642-a718-2c58eaac5cfc	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-11 19:06:44.182748+00	
00000000-0000-0000-0000-000000000000	bf8bfb1b-1bd3-4509-8483-75c239efb81a	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-11 19:24:52.447369+00	
00000000-0000-0000-0000-000000000000	94bb83e7-d18e-47b6-86c4-804de2631a34	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-11 19:24:52.448196+00	
00000000-0000-0000-0000-000000000000	353e9012-560c-4130-a66b-afae311bf384	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-11 19:36:10.227752+00	
00000000-0000-0000-0000-000000000000	4df7e22e-6074-4527-ba1b-79c014dbfebf	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-11 19:49:37.73099+00	
00000000-0000-0000-0000-000000000000	0d366224-e32e-48a3-abe8-1179c4b85c6c	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-11 20:09:17.693647+00	
00000000-0000-0000-0000-000000000000	1d86eca9-300c-4539-8388-6c1b8efec2f6	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-11 20:09:17.694509+00	
00000000-0000-0000-0000-000000000000	df507062-e4fb-4639-b9ff-7c01045bb076	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 01:43:48.126395+00	
00000000-0000-0000-0000-000000000000	e2d1a3bf-df80-4630-b09d-021a06daf7b5	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 01:43:48.127246+00	
00000000-0000-0000-0000-000000000000	38d61236-70d4-415a-8642-fb0235789016	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 02:07:46.09626+00	
00000000-0000-0000-0000-000000000000	ead70ce1-9864-482a-87f9-9cf81c9d2373	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 02:07:46.100002+00	
00000000-0000-0000-0000-000000000000	279ae1d3-812a-4217-ad41-9109ae576c27	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 02:52:24.2442+00	
00000000-0000-0000-0000-000000000000	5e060f51-4c8e-4bbc-8fa1-18cd72cdfa54	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 02:52:24.24505+00	
00000000-0000-0000-0000-000000000000	76f871aa-91e5-4f3a-8f87-598fcf2b3397	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 03:55:50.985295+00	
00000000-0000-0000-0000-000000000000	57ec7f28-9cde-4ed4-b4b3-4c77dc49165e	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 03:55:50.986153+00	
00000000-0000-0000-0000-000000000000	9a1facd7-f4dd-4791-a1c0-94ad7800967c	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 03:55:52.262605+00	
00000000-0000-0000-0000-000000000000	0c3ba731-1796-4ffe-87d9-a8f9bcdee5ba	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 04:56:41.564229+00	
00000000-0000-0000-0000-000000000000	aa78cd59-c50d-48e9-b2d3-6003cc57e326	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 04:56:41.565718+00	
00000000-0000-0000-0000-000000000000	e684e63c-c5a1-4ce8-8dfc-baa019f9ee85	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 04:57:30.869712+00	
00000000-0000-0000-0000-000000000000	cb989027-ef74-41f0-96ac-d05388bce7f5	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 06:33:43.782746+00	
00000000-0000-0000-0000-000000000000	70b08191-9760-41d8-b77b-8efe6d82079d	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 06:33:43.785208+00	
00000000-0000-0000-0000-000000000000	db7dcdaf-be23-45a5-88f7-515dbee5c538	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 07:12:46.206246+00	
00000000-0000-0000-0000-000000000000	de6ac82a-932f-4009-877d-c4f71afc8235	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 07:12:46.207193+00	
00000000-0000-0000-0000-000000000000	ccbb0fca-b7fc-4f7b-b092-0eca746c4ec6	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 07:34:42.218349+00	
00000000-0000-0000-0000-000000000000	258d5724-348b-4deb-acd7-2f2e2679d5d2	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 07:34:42.219365+00	
00000000-0000-0000-0000-000000000000	f30283e9-a976-48f0-bbbe-fb483b7db0ee	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 07:35:34.476207+00	
00000000-0000-0000-0000-000000000000	551c1d21-894c-4be7-9fc6-12a4893dfbc1	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 20:31:20.844842+00	
00000000-0000-0000-0000-000000000000	9a103426-0287-4bbc-b8cc-66a6fa2f145c	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 20:31:20.847775+00	
00000000-0000-0000-0000-000000000000	b02c5046-9d7e-4932-9666-d64633dc405c	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 20:43:00.366465+00	
00000000-0000-0000-0000-000000000000	52257924-ca8d-4486-857a-5b60c5f89463	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 20:50:12.368872+00	
00000000-0000-0000-0000-000000000000	ec486d81-93b6-486a-bcb3-0f8b8e322755	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 20:50:12.369769+00	
00000000-0000-0000-0000-000000000000	1da48746-79f5-4f8b-968f-862c5c05605a	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 20:51:46.553413+00	
00000000-0000-0000-0000-000000000000	b706f1e0-a2a2-43d7-adeb-01f6372afb5d	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 22:44:49.010116+00	
00000000-0000-0000-0000-000000000000	b98d9cca-ff79-4f9e-97b4-d785670f3dbf	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 22:44:49.011023+00	
00000000-0000-0000-0000-000000000000	e9e531a4-6c91-4f51-8879-d882ec3ce881	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 22:44:50.504237+00	
00000000-0000-0000-0000-000000000000	cb3cd017-9164-44a4-9e62-13b152e9af40	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 22:45:25.662134+00	
00000000-0000-0000-0000-000000000000	80ea598e-267f-4330-94ae-abc579401351	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 22:47:38.478042+00	
00000000-0000-0000-0000-000000000000	b1284a6d-c50b-4210-974f-837b6b314502	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 22:55:59.759682+00	
00000000-0000-0000-0000-000000000000	0bdafbf6-111b-432f-b7a6-d9f86984be4e	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:04:45.255923+00	
00000000-0000-0000-0000-000000000000	43be63b3-1ef4-47ac-a90b-19c2f4b9a62f	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:05:26.828186+00	
00000000-0000-0000-0000-000000000000	04d4917d-8ed4-4c35-8335-7db3d1c77e9e	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:16:57.63211+00	
00000000-0000-0000-0000-000000000000	3f4391ba-68cb-4fb7-ba4b-f88182ed3394	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 23:17:34.5254+00	
00000000-0000-0000-0000-000000000000	28e7dceb-39ee-4580-8dc6-1dead428957d	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-12 23:17:34.526058+00	
00000000-0000-0000-0000-000000000000	f72b5592-6d13-4a0f-91c6-e82327ff7eb5	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:17:38.678592+00	
00000000-0000-0000-0000-000000000000	1b859800-82b0-4fcc-9e21-def958b8d898	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:24:41.669635+00	
00000000-0000-0000-0000-000000000000	fe8bf837-453b-4c7f-9e39-3ec91319a6b8	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:29:55.783829+00	
00000000-0000-0000-0000-000000000000	3d8796aa-6874-403c-b670-dcbfad0e6f29	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:33:19.770605+00	
00000000-0000-0000-0000-000000000000	2978b07a-96f9-4b74-981c-9b7f69fc0c55	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:36:33.73143+00	
00000000-0000-0000-0000-000000000000	916e2df9-290d-42db-87db-1e87ec5c19d8	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:37:04.385744+00	
00000000-0000-0000-0000-000000000000	071d140a-b59c-4afb-a41b-40e78a4091a7	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:38:10.52044+00	
00000000-0000-0000-0000-000000000000	1d429ed8-2553-447b-859a-8c574f07d598	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:41:16.329351+00	
00000000-0000-0000-0000-000000000000	970feabd-8f22-4ffa-a561-6c7fae125372	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:41:57.033784+00	
00000000-0000-0000-0000-000000000000	eb1c9fa7-f847-494c-931e-553af4fd1463	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:47:39.705904+00	
00000000-0000-0000-0000-000000000000	7c536b45-f6a8-45e9-968a-56aaeab87891	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:49:53.334324+00	
00000000-0000-0000-0000-000000000000	dbe26c0b-c899-4ba3-894f-13c6a7ff45f7	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:50:35.223946+00	
00000000-0000-0000-0000-000000000000	d0f9dc90-703c-4c57-83be-9e0ac7be835c	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:51:25.48893+00	
00000000-0000-0000-0000-000000000000	72a286cc-52e5-4a19-bdfd-156887ffdede	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:51:38.419961+00	
00000000-0000-0000-0000-000000000000	e022bd6c-c2b2-4327-b68e-090c48b45b66	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:51:53.073524+00	
00000000-0000-0000-0000-000000000000	38aeac24-2fa7-4448-888d-31ae16453139	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:57:39.936447+00	
00000000-0000-0000-0000-000000000000	bc7368d2-8732-4284-a5c1-a3c9f1594ab9	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 00:00:28.840942+00	
00000000-0000-0000-0000-000000000000	ccfd13d8-e1e6-4850-90e6-69d2225ec5e6	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 00:04:08.077804+00	
00000000-0000-0000-0000-000000000000	eac6d1b6-7365-44e6-aa6b-439ded0a2f4e	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 00:04:21.226451+00	
00000000-0000-0000-0000-000000000000	544b7526-b13d-4f91-8213-13fb3eb1fe18	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 00:05:23.210929+00	
00000000-0000-0000-0000-000000000000	4458aa00-3fb7-4298-a86c-e709135c3f7f	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 00:11:34.300251+00	
00000000-0000-0000-0000-000000000000	245f83f6-cc04-4b5a-9d16-9d915b3878d8	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 00:12:10.845085+00	
00000000-0000-0000-0000-000000000000	39f8d1b3-cd35-4c5a-a481-9cef82c15c24	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 00:14:48.649479+00	
00000000-0000-0000-0000-000000000000	5b5c33d0-5f34-4252-b05b-9dc4e48f451f	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 00:15:34.657984+00	
00000000-0000-0000-0000-000000000000	ecc71fab-c855-4d32-86f6-3e48a85375e8	{"action":"logout","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account"}	2025-07-13 00:29:51.028875+00	
00000000-0000-0000-0000-000000000000	53860039-c9d7-4472-a82d-e0ca8495ecb9	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 00:30:08.143175+00	
00000000-0000-0000-0000-000000000000	623ae5e5-950e-4aee-a225-ea604d2d74f7	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 00:33:37.395722+00	
00000000-0000-0000-0000-000000000000	2314f9d3-7836-408d-b09e-43cecc22e737	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 00:34:21.572068+00	
00000000-0000-0000-0000-000000000000	6fa8b013-e31a-4095-a48d-574feb0b446b	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 00:45:23.277093+00	
00000000-0000-0000-0000-000000000000	e74d56b6-1dff-4858-8679-78d4487381a6	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 00:45:37.824739+00	
00000000-0000-0000-0000-000000000000	f81906af-be8b-4afa-9041-f946d8e3af80	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 01:00:59.71656+00	
00000000-0000-0000-0000-000000000000	7aa73aab-f2fe-4f5e-a7b3-44b09f4e9c4f	{"action":"logout","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account"}	2025-07-13 01:16:16.496727+00	
00000000-0000-0000-0000-000000000000	4e4e19be-3779-4388-839b-bab16c4adbd0	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 02:14:37.494398+00	
00000000-0000-0000-0000-000000000000	18fb9cba-daa9-4575-b086-08dfdf689b4b	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 02:19:18.495545+00	
00000000-0000-0000-0000-000000000000	cf089107-a326-4890-998e-219bfa73c3e1	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 02:20:26.222669+00	
00000000-0000-0000-0000-000000000000	6468b318-2d4c-40b2-95f8-b971f155b81f	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 02:20:35.429562+00	
00000000-0000-0000-0000-000000000000	06ea42c7-5e91-4381-94aa-670fe3ceb2e5	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 02:33:02.115053+00	
00000000-0000-0000-0000-000000000000	8f83f852-9e1e-405f-832c-a5567e4c215c	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 02:46:43.014644+00	
00000000-0000-0000-0000-000000000000	108701b4-55c9-4fde-9c4c-d90a56960c92	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 02:46:49.673906+00	
00000000-0000-0000-0000-000000000000	463f19ba-a08f-4c94-8ff3-98971ce77c42	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 02:47:10.344624+00	
00000000-0000-0000-0000-000000000000	5995fe85-f932-421f-b6bb-87b6408a45bc	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 02:48:27.118965+00	
00000000-0000-0000-0000-000000000000	0e345b00-2c44-4809-8f83-dd1f81fc91f3	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 03:02:38.879179+00	
00000000-0000-0000-0000-000000000000	025f7b3f-443b-42ee-9001-55bce7bc97d4	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 03:02:57.061973+00	
00000000-0000-0000-0000-000000000000	aa5a9e58-d135-495e-b321-7fd694cf65a8	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 03:06:01.287008+00	
00000000-0000-0000-0000-000000000000	adcb0e15-4b8a-4f57-81e1-4319d0e778d6	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 03:10:36.286227+00	
00000000-0000-0000-0000-000000000000	1e100658-eef0-4607-8174-c7663d132943	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 03:13:08.98831+00	
00000000-0000-0000-0000-000000000000	02baa24c-a113-4fef-b500-b7460ed01e0e	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 03:14:29.387966+00	
00000000-0000-0000-0000-000000000000	29907965-6b37-4c68-93b0-0c4c678ad8e6	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 03:14:41.530476+00	
00000000-0000-0000-0000-000000000000	1a797150-edd7-478f-8909-14bb279dd3fc	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 03:15:13.425983+00	
00000000-0000-0000-0000-000000000000	20d38ebf-e7f4-4281-bd59-44aab2e56d47	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 03:16:12.359238+00	
00000000-0000-0000-0000-000000000000	21612adb-6b26-49a9-822c-d46207d6aa3c	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 03:17:24.004366+00	
00000000-0000-0000-0000-000000000000	91abddf6-afb1-4739-a09b-bba3e3054756	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 03:23:01.499335+00	
00000000-0000-0000-0000-000000000000	477328f7-c5de-4c01-85c1-959b50a4e1bb	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 03:24:28.309864+00	
00000000-0000-0000-0000-000000000000	ed55cf9a-06b8-4005-b62c-9d4d2998a237	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 03:24:32.865405+00	
00000000-0000-0000-0000-000000000000	2c70c216-8a84-4872-bbdc-f083d2a769b7	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 03:26:02.180704+00	
00000000-0000-0000-0000-000000000000	d7f251ff-d2e7-4d67-a28e-481b97e7e135	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 03:28:56.720732+00	
00000000-0000-0000-0000-000000000000	4dc4433d-7f3e-4e90-b312-c3c89afa3235	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 03:30:07.519112+00	
00000000-0000-0000-0000-000000000000	83a010e6-7efb-4a7e-9715-67ad40c3755b	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 03:33:30.721826+00	
00000000-0000-0000-0000-000000000000	e49e624d-30aa-4717-8be0-aa2b64a3dcc0	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 03:38:22.646806+00	
00000000-0000-0000-0000-000000000000	24bf2af7-9b0f-4338-a255-b4972fc593b4	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 03:43:18.005934+00	
00000000-0000-0000-0000-000000000000	a0a86d94-d9d5-456d-aa4e-f87ddbb91cb6	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 04:03:20.899384+00	
00000000-0000-0000-0000-000000000000	4ddfc65b-16e2-4033-80c1-110918636a0d	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 04:03:27.360841+00	
00000000-0000-0000-0000-000000000000	e99e2d0a-6d85-4295-820f-bd8c1704a398	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 04:03:33.860637+00	
00000000-0000-0000-0000-000000000000	aea00a83-48c6-4eb3-8181-b16124cad05a	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 04:03:46.772659+00	
00000000-0000-0000-0000-000000000000	e53b9deb-59b5-4cb7-bcee-bc563d42bbf4	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 04:06:04.074473+00	
00000000-0000-0000-0000-000000000000	713a0dc3-156a-485e-ac70-584ff60a829e	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 04:06:50.780226+00	
00000000-0000-0000-0000-000000000000	51a79821-2cfb-4990-8a68-81f55511d13f	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 04:06:58.700744+00	
00000000-0000-0000-0000-000000000000	9cbbb447-86f7-4547-889b-a35cc6efdb02	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 04:07:09.0973+00	
00000000-0000-0000-0000-000000000000	fa23f587-a908-40b0-b840-c7a404afe8c8	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 04:07:54.886846+00	
00000000-0000-0000-0000-000000000000	9be17789-6028-4139-ae6d-4bf215bfe933	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-13 04:08:16.760501+00	
00000000-0000-0000-0000-000000000000	65c1e149-cfb7-4d68-9e8f-0b9f98dd5e4b	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-13 04:08:16.761117+00	
00000000-0000-0000-0000-000000000000	52affd41-76c7-4230-84b2-9401b1972052	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 04:08:19.912357+00	
00000000-0000-0000-0000-000000000000	a87351a0-f948-424d-a609-fece68fff8ce	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 04:08:29.373238+00	
00000000-0000-0000-0000-000000000000	0d8d1abb-d8c7-496b-99ef-fdfc6fc8d55d	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 04:27:06.867455+00	
00000000-0000-0000-0000-000000000000	320587b0-5f91-4ecd-ad5b-3be057e2c2a0	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 04:27:54.343231+00	
00000000-0000-0000-0000-000000000000	4915e8ae-7934-4a7e-b27e-18b7b668c690	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 04:31:56.125384+00	
00000000-0000-0000-0000-000000000000	5e8d99db-980c-4140-a90f-82f28de5bff3	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 04:34:37.771609+00	
00000000-0000-0000-0000-000000000000	2804ce51-c717-4d02-9131-79243c06dfbb	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 04:34:50.080571+00	
00000000-0000-0000-0000-000000000000	40a85cb5-a020-456e-b85a-8bac8d1ec036	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 04:41:10.758465+00	
00000000-0000-0000-0000-000000000000	ce5c2340-0927-449e-bdc6-dbecbd04961f	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 04:41:26.168647+00	
00000000-0000-0000-0000-000000000000	c586c20d-1417-44a8-b006-9e4f969062a8	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 04:42:02.930755+00	
00000000-0000-0000-0000-000000000000	f2a7685f-e518-4f6c-a28d-fc3a3e2f76bc	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 04:49:31.575196+00	
00000000-0000-0000-0000-000000000000	cc0e04af-0b06-4ea3-adbe-db5b574bb055	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 04:54:03.189789+00	
00000000-0000-0000-0000-000000000000	d21863f9-2322-499f-9b98-26e38704b5b7	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 04:55:25.293469+00	
00000000-0000-0000-0000-000000000000	855f1ee8-eaaf-4b65-ace6-923c30e337dd	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 04:55:55.164879+00	
00000000-0000-0000-0000-000000000000	d991556d-e5a5-474b-a71b-5a767146ff7b	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 04:57:40.812671+00	
00000000-0000-0000-0000-000000000000	7cf81515-ade1-41af-bd0f-e17d8468dbd5	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 05:20:46.583637+00	
00000000-0000-0000-0000-000000000000	afb95db3-5579-459e-b2d8-3aff4588a59c	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 05:27:42.152962+00	
00000000-0000-0000-0000-000000000000	3a8bd721-2b35-4964-892e-047d6cbb11fe	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 05:34:51.159761+00	
00000000-0000-0000-0000-000000000000	5cf3db20-c173-4549-ac51-09263570d823	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 05:35:23.451596+00	
00000000-0000-0000-0000-000000000000	fbabe1d4-0d5f-4f9d-b9a5-3e5924d937d9	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 05:41:56.040241+00	
00000000-0000-0000-0000-000000000000	cad0c464-f0f1-487d-b32d-873604c1e01d	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 06:00:54.535468+00	
00000000-0000-0000-0000-000000000000	4f389fb8-1c0f-4632-acb8-512cf87a0400	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 06:01:52.92019+00	
00000000-0000-0000-0000-000000000000	06345009-936d-4662-a096-9c71bfb6709c	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 06:27:38.936699+00	
00000000-0000-0000-0000-000000000000	8c05f6d3-aff8-443f-ab1c-22dca318fb82	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 16:00:51.129014+00	
00000000-0000-0000-0000-000000000000	cb3323b4-5220-427a-ae85-3565a240241c	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 16:48:34.97435+00	
00000000-0000-0000-0000-000000000000	8eb67b1c-259e-4e01-8ed7-25ed658eb882	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 16:49:45.343886+00	
00000000-0000-0000-0000-000000000000	3066b6f1-a9f1-437b-9438-53ee5ab236fe	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 16:52:08.313296+00	
00000000-0000-0000-0000-000000000000	4209164e-4bc5-4849-afe4-0eab6ef5c862	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 16:52:16.680486+00	
00000000-0000-0000-0000-000000000000	ab3fc2f2-0754-44d3-9ace-d8bf0ce31bb5	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 17:03:49.056096+00	
00000000-0000-0000-0000-000000000000	5180bcfb-cca2-4a6c-b9a7-4b8da0e968d4	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 17:09:23.533758+00	
00000000-0000-0000-0000-000000000000	95746c3c-6216-480d-b4aa-7e7600742d56	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 17:10:51.160851+00	
00000000-0000-0000-0000-000000000000	6d488c97-275e-4010-aadd-0aecb0817b4f	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 17:47:29.939287+00	
00000000-0000-0000-0000-000000000000	562ab179-9095-4dd8-939b-a72f95272009	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 17:54:42.070171+00	
00000000-0000-0000-0000-000000000000	88893929-be14-4acb-a766-5fb0feaa9562	{"action":"logout","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account"}	2025-07-13 17:58:41.417223+00	
00000000-0000-0000-0000-000000000000	b55f1517-11bf-4685-818f-b565814df74e	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 17:58:47.151437+00	
00000000-0000-0000-0000-000000000000	7cf9fc01-9d6c-4f96-beef-5c5236376a0f	{"action":"logout","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account"}	2025-07-13 18:00:21.982843+00	
00000000-0000-0000-0000-000000000000	09c4e2ba-52bc-4c00-8f49-19d828fdb29b	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 18:00:36.182286+00	
00000000-0000-0000-0000-000000000000	78b5d30d-b115-40ee-8200-72c75cef4c96	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-13 19:00:20.015767+00	
00000000-0000-0000-0000-000000000000	d6e2fad9-93ee-42c3-9148-5fea343f4e25	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-13 19:00:20.018435+00	
00000000-0000-0000-0000-000000000000	6a8dd9f5-1afc-46fc-961a-ebd5ebc1587f	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-13 19:00:22.073919+00	
00000000-0000-0000-0000-000000000000	e216a5d4-f1f0-459b-9467-ab7d19dfe242	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-13 20:00:45.986704+00	
00000000-0000-0000-0000-000000000000	54146bdc-6c37-483b-8ac3-c6c185576cbd	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-13 20:00:45.990501+00	
00000000-0000-0000-0000-000000000000	8dd566d7-516f-4fe7-92bc-956ab38d8254	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 20:22:33.390236+00	
00000000-0000-0000-0000-000000000000	28bf92aa-b6cd-4f0f-bf3d-2092de13abd2	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 22:02:42.569445+00	
00000000-0000-0000-0000-000000000000	0088fb92-c26c-4e16-932f-bd8ba699ee32	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 23:00:48.454534+00	
00000000-0000-0000-0000-000000000000	038d16f6-028e-4c4f-b0a0-abbda9f714b6	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 23:28:07.330846+00	
00000000-0000-0000-0000-000000000000	d07e9983-e81e-4006-893f-c52e7a0200c8	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 23:59:19.423356+00	
00000000-0000-0000-0000-000000000000	20908cad-dad5-4ddc-8e95-913bf3deda53	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"moitinhoeu@icloud.com","user_id":"f4969526-0bae-44c7-9546-9783ca83925a","user_phone":""}}	2025-07-14 01:07:31.240791+00	
00000000-0000-0000-0000-000000000000	6e3d26c8-84d5-479b-a961-d3a6437e838b	{"action":"login","actor_id":"f4969526-0bae-44c7-9546-9783ca83925a","actor_name":"João Silva","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-14 01:07:50.19022+00	
00000000-0000-0000-0000-000000000000	cccdd9de-fc8e-4fa3-b992-20d5dcf36d38	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-14 02:36:09.336009+00	
00000000-0000-0000-0000-000000000000	bca00441-c333-4014-af0a-35cc911aaf7d	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-14 02:36:45.010859+00	
00000000-0000-0000-0000-000000000000	a57ccf36-d482-428e-a2c6-187ddc8e4bc0	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-14 04:39:52.387388+00	
00000000-0000-0000-0000-000000000000	3281cb6e-bcc1-44e0-b06a-8662c5cc284f	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 04:41:40.682007+00	
00000000-0000-0000-0000-000000000000	a92e2a4d-c460-4cab-98f5-eb06eb3011e9	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 04:41:40.682893+00	
00000000-0000-0000-0000-000000000000	488b19f3-9d01-462c-8907-7f35cd6c4cf6	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 13:16:44.640672+00	
00000000-0000-0000-0000-000000000000	f61f3173-b155-4538-88ab-ba1b5a3e43a5	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 13:16:44.649549+00	
00000000-0000-0000-0000-000000000000	bd57e619-f7d1-4fb2-a681-b2003149547a	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-14 13:18:00.165039+00	
00000000-0000-0000-0000-000000000000	ffb84a4f-5ae1-4599-810f-c447c5e3fb6a	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 15:31:38.686267+00	
00000000-0000-0000-0000-000000000000	fd2150b0-613a-4574-afe7-6c755d11d5db	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 15:31:38.690225+00	
00000000-0000-0000-0000-000000000000	33feade2-6b61-40dd-b028-9e78a1484aab	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 15:31:38.941044+00	
00000000-0000-0000-0000-000000000000	ff0e61e1-e8bd-4a50-9dfc-8e4db21067f0	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 15:31:39.561651+00	
00000000-0000-0000-0000-000000000000	5cd3f6e6-d370-4a48-8ad4-b68118c9c3e0	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-14 15:32:30.822504+00	
00000000-0000-0000-0000-000000000000	9306fdbf-9057-4883-ae52-6ece8706054c	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-14 16:26:25.567599+00	
00000000-0000-0000-0000-000000000000	3e24df98-0d72-4517-a8ce-5b6e94ba36e1	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 16:31:18.723369+00	
00000000-0000-0000-0000-000000000000	b38c0f9a-c6fc-47dc-9dd1-7e1379b33221	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 16:31:18.726659+00	
00000000-0000-0000-0000-000000000000	45003355-8c9c-4ed7-ba20-5f69e6da1b21	{"action":"login","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-14 17:03:48.367964+00	
00000000-0000-0000-0000-000000000000	7b01fcad-765f-4295-98c5-6ad625a683cc	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 17:24:59.958038+00	
00000000-0000-0000-0000-000000000000	9ffe2689-7af6-4f56-bc27-ee457570b757	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 17:24:59.958926+00	
00000000-0000-0000-0000-000000000000	aed7fae8-fcb8-4af3-a05d-1eaa182861aa	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 18:25:31.264516+00	
00000000-0000-0000-0000-000000000000	93fef3d5-4827-49e9-817e-7512684762bf	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 18:25:31.267537+00	
00000000-0000-0000-0000-000000000000	51fae162-7d95-45c5-8140-109c8915b81c	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 18:25:32.108817+00	
00000000-0000-0000-0000-000000000000	a0e0eee9-42a5-4c07-914d-ef778fb2f78b	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 19:09:17.443605+00	
00000000-0000-0000-0000-000000000000	75480a6f-a8b3-4333-a670-e6acf5c1e73c	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 19:09:17.445863+00	
00000000-0000-0000-0000-000000000000	d47d640d-155f-45ae-9463-fdefb766b6f8	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 20:09:58.721937+00	
00000000-0000-0000-0000-000000000000	25e30378-8d35-4be5-92b9-805db8841d79	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 20:09:58.724307+00	
00000000-0000-0000-0000-000000000000	2bbf8faa-fb4b-4bb7-a06c-123f6a069296	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 21:08:05.258402+00	
00000000-0000-0000-0000-000000000000	b6fa8732-ea06-4b23-86cb-76510c8085f0	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 21:08:05.261338+00	
00000000-0000-0000-0000-000000000000	588aaccf-96b2-4a10-b41d-0b9770e5f949	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 21:09:54.198238+00	
00000000-0000-0000-0000-000000000000	cd4fbf87-a512-46a8-95c9-262cf598195f	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 21:09:54.199003+00	
00000000-0000-0000-0000-000000000000	43285a59-6a71-452f-b3b3-40d58ad4a789	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 21:18:53.872313+00	
00000000-0000-0000-0000-000000000000	44cbcd26-9734-466c-8dfb-446eeda387b2	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 21:18:53.87467+00	
00000000-0000-0000-0000-000000000000	a5584859-08f6-4e61-a72a-aa7dd08ccc6c	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 21:18:54.209747+00	
00000000-0000-0000-0000-000000000000	3cb5d379-450e-40cc-94e1-6787da2f3dcf	{"action":"token_refreshed","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 22:42:17.024464+00	
00000000-0000-0000-0000-000000000000	eb88e0b2-d3d8-4354-8207-20ddbdc213de	{"action":"token_revoked","actor_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-14 22:42:17.027253+00	
00000000-0000-0000-0000-000000000000	b67562cd-e31a-4848-b514-706542de6e23	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"joao.moitinho@m2z.com.br","user_id":"cb53712a-6cac-4bb3-9cd6-74576159f190","user_phone":""}}	2025-07-14 23:33:42.976239+00	
00000000-0000-0000-0000-000000000000	5f0b17e1-a443-459d-92ca-aab9559b22de	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"moitinhoeu@icloud.com","user_id":"f4969526-0bae-44c7-9546-9783ca83925a","user_phone":""}}	2025-07-14 23:33:42.992804+00	
00000000-0000-0000-0000-000000000000	1337254f-9ee7-4e74-b2e5-32f9d1a9ea3e	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"moitinho@openlove.com.br","user_id":"6b5ad9f6-a9d2-4b82-a75d-e5f7064ae204","user_phone":""}}	2025-07-15 01:15:16.952982+00	
00000000-0000-0000-0000-000000000000	bfa438c4-2477-468b-b2c5-4b51b9c1caa2	{"action":"login","actor_id":"6b5ad9f6-a9d2-4b82-a75d-e5f7064ae204","actor_name":"João Vitor Moitinho","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 01:15:34.026932+00	
00000000-0000-0000-0000-000000000000	1874386c-c277-48da-86d5-71097cc4a18f	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"moitinho@openlove.com.br","user_id":"6b5ad9f6-a9d2-4b82-a75d-e5f7064ae204","user_phone":""}}	2025-07-15 01:42:09.174318+00	
00000000-0000-0000-0000-000000000000	f4b16ff1-fb61-4eb3-a086-aa091bc0e2f7	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"moitinho@openlove.com.br","user_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","user_phone":""}}	2025-07-15 02:40:07.068118+00	
00000000-0000-0000-0000-000000000000	68322bf0-d2fb-481d-943f-7086e000e478	{"action":"login","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 02:40:25.372338+00	
00000000-0000-0000-0000-000000000000	e7a6b0aa-6768-4a1a-88a6-735967fc4c41	{"action":"login","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 02:42:31.067318+00	
00000000-0000-0000-0000-000000000000	f17d32d0-7ab4-45c1-ac09-7af0a024b1d7	{"action":"login","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 02:43:53.492158+00	
00000000-0000-0000-0000-000000000000	4c1ae0f9-d7c5-4f9b-bf72-1bfe3e76f01e	{"action":"login","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 02:55:46.247376+00	
00000000-0000-0000-0000-000000000000	2acb403b-97cf-42ed-8672-f5c60009bfbc	{"action":"token_refreshed","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-15 06:06:50.992564+00	
00000000-0000-0000-0000-000000000000	3939d5c2-0f6c-4cb9-9ef6-a7f8d4a38344	{"action":"token_revoked","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-15 06:06:50.998287+00	
00000000-0000-0000-0000-000000000000	9c4bee23-5470-4102-87ca-83bcbf9f11a9	{"action":"token_refreshed","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-15 06:06:51.667243+00	
00000000-0000-0000-0000-000000000000	d7837d6d-7c1c-4ca0-8f72-d5fbca0f6372	{"action":"token_refreshed","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-15 06:06:56.224397+00	
00000000-0000-0000-0000-000000000000	03aca014-05ca-48b1-aa40-fc220cb58eca	{"action":"token_revoked","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-15 06:06:56.225008+00	
00000000-0000-0000-0000-000000000000	520c370b-b781-4e8a-b938-d0f37968e381	{"action":"token_refreshed","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-15 06:06:57.177218+00	
00000000-0000-0000-0000-000000000000	79fde0e4-0584-419e-9c26-883a391f1240	{"action":"login","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 21:58:48.295228+00	
00000000-0000-0000-0000-000000000000	a85b1146-d99d-4eb5-9b98-ffcb7d3547c9	{"action":"token_refreshed","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-15 23:43:07.485998+00	
00000000-0000-0000-0000-000000000000	82ef91e9-3592-4ada-9fc0-ef4b7690f628	{"action":"token_revoked","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-15 23:43:07.489785+00	
00000000-0000-0000-0000-000000000000	9bc1c12a-a58a-4ed8-be7a-061def390756	{"action":"token_refreshed","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-15 23:43:08.496457+00	
00000000-0000-0000-0000-000000000000	75f40fc9-49ed-408d-8a35-c1d60411b304	{"action":"login","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-16 13:32:17.499387+00	
00000000-0000-0000-0000-000000000000	e78f043b-727f-4db0-b7f4-75c2cf8219d2	{"action":"token_refreshed","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-17 02:42:10.983383+00	
00000000-0000-0000-0000-000000000000	81858ac2-a0ab-430c-91b1-47849d9852db	{"action":"token_revoked","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-17 02:42:10.993108+00	
00000000-0000-0000-0000-000000000000	c628d91c-d82c-4281-b367-21dbe0fc115b	{"action":"token_refreshed","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-17 02:42:11.997081+00	
00000000-0000-0000-0000-000000000000	8ebcfd2a-591c-4e8c-b139-d2771ea8a668	{"action":"login","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-17 03:39:35.121603+00	
00000000-0000-0000-0000-000000000000	2e375587-a484-4906-8865-5366df44e8ab	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"joao.moitinho@m2z.com.br","user_id":"4c82e9da-8592-4069-a2ca-f4814093911e","user_phone":""}}	2025-07-17 04:32:38.043497+00	
00000000-0000-0000-0000-000000000000	25f42a99-b07d-43fe-a86d-f9f8920dbc33	{"action":"token_refreshed","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-17 07:29:37.89785+00	
00000000-0000-0000-0000-000000000000	447965f9-011c-4110-a9b9-eca0d3b997d8	{"action":"token_revoked","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-17 07:29:37.906023+00	
00000000-0000-0000-0000-000000000000	4af28392-007e-494c-b4b7-4cc4ef5ee1cb	{"action":"token_refreshed","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-17 07:29:40.138528+00	
00000000-0000-0000-0000-000000000000	a4cc696d-cde0-4362-86a3-b45dcc42470f	{"action":"token_refreshed","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-17 15:46:38.302244+00	
00000000-0000-0000-0000-000000000000	9e06d4de-f84a-4056-98d0-876db439a2bb	{"action":"token_revoked","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-17 15:46:38.308391+00	
00000000-0000-0000-0000-000000000000	32a77bee-20e5-42ac-8326-39e7425a410d	{"action":"token_refreshed","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-17 15:46:39.02348+00	
00000000-0000-0000-0000-000000000000	cf0a2257-316b-4d76-a8c8-7558b6b894d2	{"action":"token_refreshed","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-17 16:14:41.019017+00	
00000000-0000-0000-0000-000000000000	d7cee342-c81f-44c6-9b25-bbd0f1657518	{"action":"token_revoked","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-17 16:14:41.026568+00	
00000000-0000-0000-0000-000000000000	a251520d-044f-49a0-974f-69e444a9140f	{"action":"token_refreshed","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-17 16:14:41.656806+00	
00000000-0000-0000-0000-000000000000	95e7b7bf-bc75-4b94-b3a4-66f8473a9a18	{"action":"logout","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"account"}	2025-07-17 16:28:26.524226+00	
00000000-0000-0000-0000-000000000000	f4caf192-8e1b-4410-9f5e-fc3d691fe237	{"action":"login","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-17 16:29:24.069357+00	
00000000-0000-0000-0000-000000000000	c86a1b7c-3079-4c7f-9834-cfac522a2e20	{"action":"token_refreshed","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-17 17:38:43.161846+00	
00000000-0000-0000-0000-000000000000	d595717d-9640-4872-8a5c-837ff469e964	{"action":"token_revoked","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-17 17:38:43.165665+00	
00000000-0000-0000-0000-000000000000	f24986ec-6f56-4b45-a6f9-f5a00769b810	{"action":"token_refreshed","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-17 17:38:43.597336+00	
00000000-0000-0000-0000-000000000000	e8462bc9-5d76-43c2-831e-b417d90fb683	{"action":"token_refreshed","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-17 17:39:04.282946+00	
00000000-0000-0000-0000-000000000000	6ead3eca-3964-465b-bd8f-063d840dd223	{"action":"token_refreshed","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-17 17:39:05.20994+00	
00000000-0000-0000-0000-000000000000	fab2420b-606d-4eb6-b572-c5ee1e4d6255	{"action":"logout","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"account"}	2025-07-17 17:43:10.039592+00	
00000000-0000-0000-0000-000000000000	b5683ae8-0478-46af-abff-911e066cd8d5	{"action":"login","actor_id":"4c82e9da-8592-4069-a2ca-f4814093911e","actor_name":"Mateus Amaral","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-17 17:43:17.05666+00	
00000000-0000-0000-0000-000000000000	8d3801d6-3a34-48f8-8e98-f83f8c8e7b0f	{"action":"login","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-17 17:48:26.393915+00	
00000000-0000-0000-0000-000000000000	56bf80d5-65fa-4abe-8d1a-083af94d94f3	{"action":"token_refreshed","actor_id":"4c82e9da-8592-4069-a2ca-f4814093911e","actor_name":"Mateus Amaral","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-17 18:42:49.576298+00	
00000000-0000-0000-0000-000000000000	91af4148-f31a-483e-9666-a35079d0673a	{"action":"token_revoked","actor_id":"4c82e9da-8592-4069-a2ca-f4814093911e","actor_name":"Mateus Amaral","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-17 18:42:49.579489+00	
00000000-0000-0000-0000-000000000000	4f7ac023-7a0a-4ed9-87f6-f858d577333f	{"action":"token_refreshed","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-17 18:47:23.989487+00	
00000000-0000-0000-0000-000000000000	7d7e9a97-7931-4dc9-8862-9998d07541b7	{"action":"token_revoked","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-17 18:47:23.992091+00	
00000000-0000-0000-0000-000000000000	a5bb9d31-26f2-4ae0-bdb9-c8e8fa51f588	{"action":"logout","actor_id":"4c82e9da-8592-4069-a2ca-f4814093911e","actor_name":"Mateus Amaral","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account"}	2025-07-17 19:08:33.579365+00	
00000000-0000-0000-0000-000000000000	2e4dd762-e178-4d54-8e95-6c7a43282c3f	{"action":"login","actor_id":"4c82e9da-8592-4069-a2ca-f4814093911e","actor_name":"Mateus Amaral","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-17 19:10:55.214632+00	
00000000-0000-0000-0000-000000000000	719098d8-db8e-4fe5-b239-8ebb379de101	{"action":"login","actor_id":"4c82e9da-8592-4069-a2ca-f4814093911e","actor_name":"Mateus Amaral","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-18 14:46:05.483454+00	
00000000-0000-0000-0000-000000000000	ebdcaedc-2802-4924-9a89-01a24d433d2e	{"action":"login","actor_id":"4c82e9da-8592-4069-a2ca-f4814093911e","actor_name":"Mateus Amaral","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-18 14:46:13.980123+00	
00000000-0000-0000-0000-000000000000	fcffb979-7624-4391-bb40-873803d13142	{"action":"token_refreshed","actor_id":"4c82e9da-8592-4069-a2ca-f4814093911e","actor_name":"Mateus Amaral","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-18 15:56:51.100078+00	
00000000-0000-0000-0000-000000000000	d8480db6-cd4c-4be2-9c07-c93b1e44c9ef	{"action":"token_revoked","actor_id":"4c82e9da-8592-4069-a2ca-f4814093911e","actor_name":"Mateus Amaral","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-18 15:56:51.110181+00	
00000000-0000-0000-0000-000000000000	814984b0-65d7-4820-96c2-e39a87447d64	{"action":"logout","actor_id":"4c82e9da-8592-4069-a2ca-f4814093911e","actor_name":"Mateus Amaral","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account"}	2025-07-18 16:07:46.136664+00	
00000000-0000-0000-0000-000000000000	6944d326-8c7f-4e64-9ed9-107eef3175ed	{"action":"login","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-18 16:08:00.626269+00	
00000000-0000-0000-0000-000000000000	7bfa70bf-bc3f-4cdb-be89-ed996c2e7d19	{"action":"logout","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"account"}	2025-07-18 16:17:39.251758+00	
00000000-0000-0000-0000-000000000000	8f8632a9-2f24-4703-a178-aef7bde1ae16	{"action":"login","actor_id":"4c82e9da-8592-4069-a2ca-f4814093911e","actor_name":"Mateus Amaral","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-18 16:17:46.278933+00	
00000000-0000-0000-0000-000000000000	65bb624a-d696-4b2e-9a17-1b65573c061f	{"action":"token_refreshed","actor_id":"4c82e9da-8592-4069-a2ca-f4814093911e","actor_name":"Mateus Amaral","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-18 18:55:11.184969+00	
00000000-0000-0000-0000-000000000000	ecbbd403-838e-442a-9f16-d8fcbb60e7c8	{"action":"token_revoked","actor_id":"4c82e9da-8592-4069-a2ca-f4814093911e","actor_name":"Mateus Amaral","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-18 18:55:11.189872+00	
00000000-0000-0000-0000-000000000000	9738d2cc-719f-402b-9996-fc3c99c58d9a	{"action":"token_refreshed","actor_id":"4c82e9da-8592-4069-a2ca-f4814093911e","actor_name":"Mateus Amaral","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-18 20:19:58.868211+00	
00000000-0000-0000-0000-000000000000	257826ae-1e06-4250-989b-359ab6b534c4	{"action":"token_revoked","actor_id":"4c82e9da-8592-4069-a2ca-f4814093911e","actor_name":"Mateus Amaral","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-18 20:19:58.872939+00	
00000000-0000-0000-0000-000000000000	02f5f1ff-5f15-498f-82bd-d3b4cb3b6bdd	{"action":"token_refreshed","actor_id":"4c82e9da-8592-4069-a2ca-f4814093911e","actor_name":"Mateus Amaral","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-18 21:18:39.579882+00	
00000000-0000-0000-0000-000000000000	ef0a66ce-8b60-4624-bd9d-e76f031fd50e	{"action":"token_revoked","actor_id":"4c82e9da-8592-4069-a2ca-f4814093911e","actor_name":"Mateus Amaral","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-18 21:18:39.586898+00	
00000000-0000-0000-0000-000000000000	dcf6a4ab-fedb-4e02-9d5b-dc3a28d2d6d4	{"action":"login","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-19 16:25:57.382164+00	
00000000-0000-0000-0000-000000000000	40292ed5-e484-4c3e-823b-e803316d60e9	{"action":"login","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-19 16:25:57.825014+00	
00000000-0000-0000-0000-000000000000	61aa3c83-f779-420d-9ac9-5c0b07c66d94	{"action":"token_refreshed","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-19 19:59:03.163051+00	
00000000-0000-0000-0000-000000000000	644b1994-7798-459d-add0-65a14f6b8ce6	{"action":"token_revoked","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-19 19:59:03.17575+00	
00000000-0000-0000-0000-000000000000	f8025fa6-05b0-47d7-8090-29ca35289056	{"action":"token_refreshed","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-19 21:53:27.641373+00	
00000000-0000-0000-0000-000000000000	26b99f1c-30fd-4840-88c6-8d5bdc8f757f	{"action":"token_revoked","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-19 21:53:27.644068+00	
00000000-0000-0000-0000-000000000000	e2fc2975-e15b-46c5-8dbb-3ac242accc3c	{"action":"token_refreshed","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-19 23:49:12.335207+00	
00000000-0000-0000-0000-000000000000	f02aa780-aceb-4b5a-8ff2-53d5854bc74a	{"action":"token_revoked","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-19 23:49:12.33818+00	
00000000-0000-0000-0000-000000000000	9af63cb7-4b52-488a-851c-89ca6761d677	{"action":"token_refreshed","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-20 13:33:39.839967+00	
00000000-0000-0000-0000-000000000000	6a2643a1-3e4c-48d4-bfb8-0178963c53f7	{"action":"token_revoked","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-20 13:33:39.850181+00	
00000000-0000-0000-0000-000000000000	732baf6f-cd1d-47b7-8061-01604d287e9e	{"action":"token_refreshed","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-20 23:17:04.332985+00	
00000000-0000-0000-0000-000000000000	e66e6f7d-0c44-4b51-82fb-1c6ee20a55f3	{"action":"token_revoked","actor_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","actor_name":"João Vitor Moitinho Silva","actor_username":"moitinho@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-20 23:17:04.347432+00	
00000000-0000-0000-0000-000000000000	4ba525b1-0847-47cf-af58-7555bf509f4e	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"moitinho@openlove.com.br","user_id":"39ee2132-0b1c-4265-aa3c-0509c55e4b86","user_phone":""}}	2025-07-21 02:33:00.139555+00	
00000000-0000-0000-0000-000000000000	7504a9d4-b10c-4c6b-a4aa-82940cde1fbe	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"joao.moitinho@m2z.com.br","user_id":"4c82e9da-8592-4069-a2ca-f4814093911e","user_phone":""}}	2025-07-21 02:33:01.175881+00	
00000000-0000-0000-0000-000000000000	4bd85a88-db2e-4acb-9af8-d7e6904e5a08	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"joao.moitinho@m2z.com.br","user_id":"373f7f81-4522-4959-a997-cd3b5beedff7","user_phone":""}}	2025-07-24 15:44:27.104037+00	
00000000-0000-0000-0000-000000000000	f91045d1-a4f2-4012-b09c-265b2056b161	{"action":"login","actor_id":"373f7f81-4522-4959-a997-cd3b5beedff7","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-24 15:48:28.577361+00	
00000000-0000-0000-0000-000000000000	b7f82eff-5645-4c40-8cbd-422f0c9199eb	{"action":"logout","actor_id":"373f7f81-4522-4959-a997-cd3b5beedff7","actor_name":"João Vitor Moitinho","actor_username":"joao.moitinho@m2z.com.br","actor_via_sso":false,"log_type":"account"}	2025-07-24 15:49:19.044634+00	
00000000-0000-0000-0000-000000000000	5ff6858e-c3f4-4650-ba3f-54df6f1cdeeb	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"matmartins@openlove.com.br","user_id":"92922c12-78e1-4586-9874-970c8c02e41d","user_phone":""}}	2025-07-24 15:57:25.960737+00	
00000000-0000-0000-0000-000000000000	a1b27549-66a9-4f21-a36e-b6fb0537af16	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"assisneto@openlove.com.br","user_id":"35815879-1769-4e32-942d-daa2885b15ef","user_phone":""}}	2025-07-24 16:00:29.700702+00	
00000000-0000-0000-0000-000000000000	083d40f4-34b6-4b13-a21c-e4e60526a625	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"raphazao@openlove.com.br","user_id":"aaa16fdb-14d1-4bfb-a36d-1f5bd01ad6ba","user_phone":""}}	2025-07-24 16:05:35.576969+00	
00000000-0000-0000-0000-000000000000	e3c7111e-0d28-4841-8807-49990c5a509e	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"moitinhoeu@icloud.com","user_id":"971d2d56-cb0e-4443-934e-0f9bca7dd0c8","user_phone":""}}	2025-07-24 16:12:38.868728+00	
00000000-0000-0000-0000-000000000000	a1d49d59-d278-4d9b-9292-2e2807e1c9bf	{"action":"login","actor_id":"971d2d56-cb0e-4443-934e-0f9bca7dd0c8","actor_name":"Vitor Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-24 16:13:31.79216+00	
00000000-0000-0000-0000-000000000000	abe2621a-995c-43cb-8df8-227b67babff8	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"minecraftbrplays@gmail.com","user_id":"fb5c592b-3379-4f34-8c0b-b4b628f9b08b","user_phone":""}}	2025-07-24 16:21:17.196465+00	
00000000-0000-0000-0000-000000000000	be5bec8f-b850-47ad-8b21-dc72f8c7d60d	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"fernando@openlove.com.br","user_id":"0380f356-f516-4c6b-8f8f-3c110124ab9c","user_phone":""}}	2025-07-24 16:43:39.159283+00	
00000000-0000-0000-0000-000000000000	42db1a59-1a5e-4f47-84c9-8bd4a420e2df	{"action":"login","actor_id":"0380f356-f516-4c6b-8f8f-3c110124ab9c","actor_name":"fernando raphael","actor_username":"fernando@openlove.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-24 16:43:41.414906+00	
00000000-0000-0000-0000-000000000000	229f01b9-8306-4da2-8aef-b06da1616b6b	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"joao.moitinho@m2z.com.br","user_id":"373f7f81-4522-4959-a997-cd3b5beedff7","user_phone":""}}	2025-07-24 16:45:13.759104+00	
00000000-0000-0000-0000-000000000000	1692e1e0-1e68-44a2-a1aa-80dd01afc870	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"raphazao@openlove.com.br","user_id":"aaa16fdb-14d1-4bfb-a36d-1f5bd01ad6ba","user_phone":""}}	2025-07-24 16:45:13.781563+00	
00000000-0000-0000-0000-000000000000	4e0c7dfe-5fdb-4b3d-a914-ed1f1518e4f9	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"matmartins@openlove.com.br","user_id":"92922c12-78e1-4586-9874-970c8c02e41d","user_phone":""}}	2025-07-24 16:45:13.783521+00	
00000000-0000-0000-0000-000000000000	ccda3fdb-444e-49e2-8df4-a361e4bbaaeb	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"minecraftbrplays@gmail.com","user_id":"fb5c592b-3379-4f34-8c0b-b4b628f9b08b","user_phone":""}}	2025-07-24 16:45:13.801172+00	
00000000-0000-0000-0000-000000000000	72f8b4f5-543b-448d-91a3-3760469a7b5a	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"moitinhoeu@icloud.com","user_id":"971d2d56-cb0e-4443-934e-0f9bca7dd0c8","user_phone":""}}	2025-07-24 16:45:13.8141+00	
00000000-0000-0000-0000-000000000000	abcc6bee-9a71-40f1-a869-fb1a2a8266cd	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"assisneto@openlove.com.br","user_id":"35815879-1769-4e32-942d-daa2885b15ef","user_phone":""}}	2025-07-24 16:45:13.815858+00	
00000000-0000-0000-0000-000000000000	4bec4fbf-1f1a-4abf-92ee-efb156e4c8c4	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"fernando@openlove.com.br","user_id":"0380f356-f516-4c6b-8f8f-3c110124ab9c","user_phone":""}}	2025-07-24 16:45:13.819217+00	
00000000-0000-0000-0000-000000000000	6713eee4-d241-4b47-aacb-5d0aa3216509	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"moitinhoeu@icloud.com","user_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","user_phone":""}}	2025-07-25 16:20:21.21215+00	
00000000-0000-0000-0000-000000000000	cdacc50e-fa48-43d1-a7f6-d5517bc91d77	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-25 16:20:23.145652+00	
00000000-0000-0000-0000-000000000000	7b64cfcd-3270-4ec7-ae8f-378728196e8e	{"action":"logout","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account"}	2025-07-25 16:31:34.274296+00	
00000000-0000-0000-0000-000000000000	4522339c-2036-49fb-b520-58beeda55e0e	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"matgon@openlove.com.br","user_id":"f5de8e7a-6a42-45e9-b726-0d385173544e","user_phone":""}}	2025-07-25 16:32:51.225482+00	
00000000-0000-0000-0000-000000000000	e709b77e-55c7-4648-80ee-82c3c62699cb	{"action":"login","actor_id":"f5de8e7a-6a42-45e9-b726-0d385173544e","actor_name":"Mateus Gonçalves","actor_username":"matgon@openlove.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-25 16:32:52.912931+00	
00000000-0000-0000-0000-000000000000	f1203209-a632-4751-825e-28245f239e3a	{"action":"logout","actor_id":"f5de8e7a-6a42-45e9-b726-0d385173544e","actor_name":"Mateus Gonçalves","actor_username":"matgon@openlove.com.br","actor_via_sso":false,"log_type":"account"}	2025-07-25 16:35:12.139421+00	
00000000-0000-0000-0000-000000000000	b47a1e72-04d1-471a-a489-5ef0482df85f	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"raphaalves@openlove.com.br","user_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","user_phone":""}}	2025-07-25 16:36:24.24203+00	
00000000-0000-0000-0000-000000000000	5a012511-0534-438f-ac95-b9945465d58d	{"action":"login","actor_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","actor_name":"Raphael Alves","actor_username":"raphaalves@openlove.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-25 16:36:26.041087+00	
00000000-0000-0000-0000-000000000000	17c31e7d-c71d-4a1e-b53a-569f67eb0e93	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-25 17:37:25.365373+00	
00000000-0000-0000-0000-000000000000	db572a9e-72f3-41fa-a56d-e152fcb8f1fa	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-25 17:51:47.245172+00	
00000000-0000-0000-0000-000000000000	b78ea487-3e90-4f89-93b1-dd6b299a5a55	{"action":"token_refreshed","actor_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","actor_name":"Raphael Alves","actor_username":"raphaalves@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-25 19:45:35.790397+00	
00000000-0000-0000-0000-000000000000	9494be8a-e4a5-48e6-8e76-152250399615	{"action":"token_revoked","actor_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","actor_name":"Raphael Alves","actor_username":"raphaalves@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-25 19:45:35.792559+00	
00000000-0000-0000-0000-000000000000	8a4db0b5-829d-4076-b678-5fca69458d7e	{"action":"token_refreshed","actor_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","actor_name":"Raphael Alves","actor_username":"raphaalves@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-25 19:45:36.585719+00	
00000000-0000-0000-0000-000000000000	7c0aa1aa-8608-4054-a796-e23eb3bb7289	{"action":"token_refreshed","actor_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","actor_name":"Raphael Alves","actor_username":"raphaalves@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-25 20:43:45.837247+00	
00000000-0000-0000-0000-000000000000	872b8656-c988-47e4-8bb7-b1b5d0202e69	{"action":"token_revoked","actor_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","actor_name":"Raphael Alves","actor_username":"raphaalves@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-25 20:43:45.843643+00	
00000000-0000-0000-0000-000000000000	d1315f32-1ee8-4e7b-873e-735293708b73	{"action":"logout","actor_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","actor_name":"Raphael Alves","actor_username":"raphaalves@openlove.com.br","actor_via_sso":false,"log_type":"account"}	2025-07-25 20:52:25.357575+00	
00000000-0000-0000-0000-000000000000	aacb42b0-9cb4-44ee-9af0-755b9c99aafa	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-25 20:53:47.132642+00	
00000000-0000-0000-0000-000000000000	c6793edb-2109-4d9e-a7d9-c70f5357375c	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-26 12:59:30.360762+00	
00000000-0000-0000-0000-000000000000	ca37f89c-dc12-4d74-9680-40ba56abb7aa	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-26 15:33:56.306911+00	
00000000-0000-0000-0000-000000000000	5653ec9c-0f66-438b-8796-3246005e869f	{"action":"token_revoked","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-26 15:33:56.309465+00	
00000000-0000-0000-0000-000000000000	f8038586-46b7-4b9a-b6ae-9336274b10b0	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-26 15:33:56.421674+00	
00000000-0000-0000-0000-000000000000	d1375036-dfdc-4e71-9bd7-7c4b40b61244	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-26 16:32:40.091219+00	
00000000-0000-0000-0000-000000000000	ed03ff0b-ec86-408d-b7cf-365f9ccaf0b6	{"action":"token_revoked","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-26 16:32:40.094072+00	
00000000-0000-0000-0000-000000000000	9d1c5a0c-6a6d-4af1-a613-6aba91b2de1f	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"jose.ronca@openlove.com.br","user_id":"3587e268-c229-4c95-888f-f3b94aa1fb15","user_phone":""}}	2025-07-26 16:37:49.235069+00	
00000000-0000-0000-0000-000000000000	663c6912-d13b-49c5-ba61-771707dd7abf	{"action":"login","actor_id":"3587e268-c229-4c95-888f-f3b94aa1fb15","actor_name":"José Renato","actor_username":"jose.ronca@openlove.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-26 16:37:51.339314+00	
00000000-0000-0000-0000-000000000000	91b0d30e-9450-4fed-9ba7-16ae2ae9848e	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-26 17:32:44.167049+00	
00000000-0000-0000-0000-000000000000	b0fc6427-af75-43dd-956c-64a65729a71f	{"action":"token_revoked","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-26 17:32:44.169243+00	
00000000-0000-0000-0000-000000000000	cfeeafd3-716f-46e3-9b31-bc0ee201f7ab	{"action":"logout","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account"}	2025-07-26 18:23:03.732155+00	
00000000-0000-0000-0000-000000000000	63fdf6e5-092c-4688-94fc-ea142d463dfe	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-26 18:23:52.922901+00	
00000000-0000-0000-0000-000000000000	bcaf027b-695e-4ebd-b405-806eb45b565b	{"action":"login","actor_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","actor_name":"Raphael Alves","actor_username":"raphaalves@openlove.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-26 18:24:07.48608+00	
00000000-0000-0000-0000-000000000000	52dc6956-9b6b-49e7-8fbf-376e2841e44b	{"action":"login","actor_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","actor_name":"Raphael Alves","actor_username":"raphaalves@openlove.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-26 18:56:23.566293+00	
00000000-0000-0000-0000-000000000000	356e4094-ca11-4c22-9904-e118e2124c44	{"action":"logout","actor_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","actor_name":"Raphael Alves","actor_username":"raphaalves@openlove.com.br","actor_via_sso":false,"log_type":"account"}	2025-07-26 19:08:17.592665+00	
00000000-0000-0000-0000-000000000000	b2dfc955-82ce-4cbc-aca6-df4dd207737e	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-26 19:08:35.053419+00	
00000000-0000-0000-0000-000000000000	d5b6081f-737f-4ae8-8a78-3cc8a651d7d8	{"action":"logout","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account"}	2025-07-26 19:14:20.077353+00	
00000000-0000-0000-0000-000000000000	9b17998c-e75f-46da-a857-98b047039e0a	{"action":"login","actor_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","actor_name":"Raphael Alves","actor_username":"raphaalves@openlove.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-26 19:14:38.315311+00	
00000000-0000-0000-0000-000000000000	4c0fbcf6-10f6-4a5b-9704-c62914b54b3c	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-26 19:17:08.198821+00	
00000000-0000-0000-0000-000000000000	d80f3acb-d310-44d5-a00c-74cc3971d97a	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-26 20:11:53.25685+00	
00000000-0000-0000-0000-000000000000	c13e169a-9934-4695-abee-a95ef9796907	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-26 20:38:44.510214+00	
00000000-0000-0000-0000-000000000000	69728704-372b-4edb-a3f8-105edf86a329	{"action":"token_revoked","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-26 20:38:44.513934+00	
00000000-0000-0000-0000-000000000000	898fc14b-2022-47c3-b3c8-b7b66ba1bd8b	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-26 23:53:43.8847+00	
00000000-0000-0000-0000-000000000000	e6f6ccbc-69cd-4e8e-8223-edbf99b43681	{"action":"token_revoked","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-26 23:53:43.891867+00	
00000000-0000-0000-0000-000000000000	1ec1a5b0-25ce-48c6-bcf9-296149314d24	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-27 00:52:27.256449+00	
00000000-0000-0000-0000-000000000000	f2cbb3b7-5162-4d42-a22d-50c528b0544b	{"action":"token_revoked","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-27 00:52:27.258135+00	
00000000-0000-0000-0000-000000000000	06f37376-8e7b-4eb4-8211-66037ae93c3b	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-27 00:52:27.311874+00	
00000000-0000-0000-0000-000000000000	5d6818dc-13f3-4f9c-a30e-1e5b19127b09	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-27 00:52:27.396058+00	
00000000-0000-0000-0000-000000000000	11747802-e4b6-497c-b5b9-c7872568783a	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-27 00:52:27.48736+00	
00000000-0000-0000-0000-000000000000	6ffe7201-8b39-4b4c-8419-8953a16d9b5f	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-27 00:52:29.222923+00	
00000000-0000-0000-0000-000000000000	8679cc4a-391d-4736-bc38-211bccee22ce	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-27 00:52:45.116508+00	
00000000-0000-0000-0000-000000000000	afe82b55-df67-475c-bcb5-7b675ac6ee92	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-27 00:52:47.513993+00	
00000000-0000-0000-0000-000000000000	c4667464-c08e-4298-a6b3-8fa8fe1773ae	{"action":"token_refreshed","actor_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","actor_name":"Raphael Alves","actor_username":"raphaalves@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-27 01:54:57.195701+00	
00000000-0000-0000-0000-000000000000	a28157d0-fb49-41d8-a577-6312cb5983e2	{"action":"token_revoked","actor_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","actor_name":"Raphael Alves","actor_username":"raphaalves@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-27 01:54:57.200584+00	
00000000-0000-0000-0000-000000000000	ab34e03f-9bb8-49c2-b2ac-8d68ba529eab	{"action":"token_refreshed","actor_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","actor_name":"Raphael Alves","actor_username":"raphaalves@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-27 01:54:58.193015+00	
00000000-0000-0000-0000-000000000000	10500a5d-cedb-4318-9581-c8be18460c36	{"action":"token_refreshed","actor_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","actor_name":"Raphael Alves","actor_username":"raphaalves@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-27 16:09:27.881926+00	
00000000-0000-0000-0000-000000000000	2add06c8-6155-4ec1-918c-3db0149ae1eb	{"action":"token_revoked","actor_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","actor_name":"Raphael Alves","actor_username":"raphaalves@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-27 16:09:27.889944+00	
00000000-0000-0000-0000-000000000000	c0107b5c-5885-459d-ac1b-8182d5d8bff1	{"action":"token_refreshed","actor_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","actor_name":"Raphael Alves","actor_username":"raphaalves@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-27 16:17:36.366256+00	
00000000-0000-0000-0000-000000000000	dc09f44f-f47a-4e21-b55b-52bb4e72f6d5	{"action":"token_refreshed","actor_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","actor_name":"Raphael Alves","actor_username":"raphaalves@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-27 16:41:10.53734+00	
00000000-0000-0000-0000-000000000000	8ea78485-675d-43f0-ae3b-a6a78c261c77	{"action":"token_refreshed","actor_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","actor_name":"Raphael Alves","actor_username":"raphaalves@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-27 16:41:11.688442+00	
00000000-0000-0000-0000-000000000000	c0be353f-e2fb-4ffe-a5b6-6076b87ba97a	{"action":"token_refreshed","actor_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","actor_name":"Raphael Alves","actor_username":"raphaalves@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-27 17:39:53.196784+00	
00000000-0000-0000-0000-000000000000	2aaedc49-bd65-41de-b231-30ef06979527	{"action":"token_revoked","actor_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","actor_name":"Raphael Alves","actor_username":"raphaalves@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-27 17:39:53.198836+00	
00000000-0000-0000-0000-000000000000	006c1f9c-e3d3-4e99-bd14-105d64388d8a	{"action":"token_refreshed","actor_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","actor_name":"Raphael Alves","actor_username":"raphaalves@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-27 19:18:39.521249+00	
00000000-0000-0000-0000-000000000000	6e0a2cdd-8550-4db8-9b39-34d672400209	{"action":"token_revoked","actor_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","actor_name":"Raphael Alves","actor_username":"raphaalves@openlove.com.br","actor_via_sso":false,"log_type":"token"}	2025-07-27 19:18:39.523916+00	
00000000-0000-0000-0000-000000000000	8ea281e3-1677-4b54-8bda-007a5a48ec89	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 05:10:17.496548+00	
00000000-0000-0000-0000-000000000000	83e41fe1-3125-4e94-9053-0b4a4dfa3c76	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 05:10:22.957071+00	
00000000-0000-0000-0000-000000000000	f1bc27b7-0985-4062-9c4e-a5fb65654ee8	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 05:10:44.921947+00	
00000000-0000-0000-0000-000000000000	b50a9246-5ca0-495f-bb39-8177ce4082fa	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 05:10:51.87709+00	
00000000-0000-0000-0000-000000000000	bd8d6245-9837-46ee-832c-70e78fbdc346	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 06:20:57.43992+00	
00000000-0000-0000-0000-000000000000	c9f8ed20-255c-4a50-92c1-74031b52b62c	{"action":"token_revoked","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 06:20:57.442316+00	
00000000-0000-0000-0000-000000000000	a65d7be8-270a-404c-931d-4904aaededdb	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 06:21:08.315389+00	
00000000-0000-0000-0000-000000000000	82f30771-681a-47c1-abd5-ee51945f121c	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 06:21:08.545008+00	
00000000-0000-0000-0000-000000000000	01040ccb-a415-4a29-8f97-1aabea5e79e4	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 06:22:05.971097+00	
00000000-0000-0000-0000-000000000000	dd0eff82-14c1-47bb-a2dc-e71e50f67948	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 06:22:05.98199+00	
00000000-0000-0000-0000-000000000000	90007709-232c-40be-ae59-773f38830b9b	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 06:22:06.019129+00	
00000000-0000-0000-0000-000000000000	4cbeed1a-1699-42cf-91f1-573432ce076d	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 06:22:06.432678+00	
00000000-0000-0000-0000-000000000000	ca87d8fc-ae7d-473d-abb9-957eeeab522a	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 06:22:07.085237+00	
00000000-0000-0000-0000-000000000000	691866e4-498b-4940-bb81-876ac1ac2886	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 14:13:38.122985+00	
00000000-0000-0000-0000-000000000000	8386c83a-a423-4f2a-8d0a-cdbd8ac25577	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 14:24:16.747101+00	
00000000-0000-0000-0000-000000000000	1d777497-3d76-4cc1-926e-58244af1b631	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 14:58:55.987229+00	
00000000-0000-0000-0000-000000000000	67e0438c-0b28-4c40-bf43-0bb7f0fc8317	{"action":"token_revoked","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 14:58:55.988729+00	
00000000-0000-0000-0000-000000000000	f16e57b0-2c53-4994-b60b-4b67203f0316	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 14:58:56.424364+00	
00000000-0000-0000-0000-000000000000	88297fc1-60e1-43c4-8341-20b5f0d35574	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 15:09:21.432907+00	
00000000-0000-0000-0000-000000000000	d0707612-4db2-4773-83c6-5ebe6f234c3e	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 15:09:21.638797+00	
00000000-0000-0000-0000-000000000000	06f3a1ae-3baf-4d69-bffd-c37256e07f68	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 15:09:21.695976+00	
00000000-0000-0000-0000-000000000000	29789d47-f763-4807-8f1b-ab6d97b4569c	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 15:09:21.709688+00	
00000000-0000-0000-0000-000000000000	c5c8a3c8-2482-41d8-8ca4-de1934da4878	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 15:09:21.766217+00	
00000000-0000-0000-0000-000000000000	c4517533-888a-414b-a7a6-8304b17cfa56	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 15:09:31.43276+00	
00000000-0000-0000-0000-000000000000	ffd16a0e-1279-4e01-98ba-2dd3c341e565	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 15:13:49.490411+00	
00000000-0000-0000-0000-000000000000	a4cf79cb-156b-480d-95fa-6167b4bf5cb5	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 15:21:35.95907+00	
00000000-0000-0000-0000-000000000000	9e068c3b-dc83-4765-ae7a-e9e20ec52af4	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 15:22:25.965653+00	
00000000-0000-0000-0000-000000000000	b0f773ca-257b-4d0a-9d29-5cbbcb322071	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 15:22:26.24175+00	
00000000-0000-0000-0000-000000000000	f4c4a1e7-17e4-4bbc-bdee-c0f81d471a8f	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 15:22:26.303847+00	
00000000-0000-0000-0000-000000000000	7c17af51-7170-4655-9369-a11d73186791	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 15:22:26.357019+00	
00000000-0000-0000-0000-000000000000	24d76412-5198-4bc6-a355-37ef389e8e5e	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 15:22:36.609282+00	
00000000-0000-0000-0000-000000000000	ebc8cd5a-858a-478a-ba4d-e3394a5a6f22	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 15:23:45.470144+00	
00000000-0000-0000-0000-000000000000	dc83b8e3-23b8-470b-8bd1-6d27af1662eb	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 15:23:45.485205+00	
00000000-0000-0000-0000-000000000000	45b35e3c-0c8e-4bfc-b1a2-0b3b6ebdc6a7	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 15:23:59.603817+00	
00000000-0000-0000-0000-000000000000	c6524d01-5923-4be7-8ed1-09d96eec89f7	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 20:05:01.760436+00	
00000000-0000-0000-0000-000000000000	5dc78000-6d4e-4506-a378-56f02b6df38b	{"action":"token_revoked","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 20:05:01.768749+00	
00000000-0000-0000-0000-000000000000	d1edd585-1386-4bfd-9d21-cbc723696d27	{"action":"user_repeated_signup","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-29 20:44:21.919448+00	
00000000-0000-0000-0000-000000000000	b4acf3f8-8453-4b00-b925-e12f301168ca	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 20:44:25.016965+00	
00000000-0000-0000-0000-000000000000	a1370b31-17d1-41cc-b5d3-16a8e77d518a	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 20:48:32.492015+00	
00000000-0000-0000-0000-000000000000	b15c2270-3290-4e37-b5f9-6f9f0e48df8f	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 20:58:48.375041+00	
00000000-0000-0000-0000-000000000000	c6a4c9b1-ebaf-4de9-80c0-73c25d2de925	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 21:03:47.298792+00	
00000000-0000-0000-0000-000000000000	731a5261-01ca-48e0-a3cc-70db772ce45f	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 21:04:40.136565+00	
00000000-0000-0000-0000-000000000000	fe5534f5-979c-45c4-a3f3-ecb78f16cf67	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 21:07:01.798803+00	
00000000-0000-0000-0000-000000000000	d0efdc74-edb1-4f37-847d-da29f3bf6633	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 21:07:34.774748+00	
00000000-0000-0000-0000-000000000000	22c4a9c4-aaa5-44ed-8d39-fd19081f4a6f	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 21:07:38.71671+00	
00000000-0000-0000-0000-000000000000	35c43e05-a736-43da-b7dd-b6021b0230e6	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 21:07:52.111609+00	
00000000-0000-0000-0000-000000000000	ef22a403-21fe-4b6a-899b-f03ce37a0618	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 21:08:11.042547+00	
00000000-0000-0000-0000-000000000000	39e17ca2-9781-43c2-a0de-7f8f532f9a2a	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 21:09:03.6864+00	
00000000-0000-0000-0000-000000000000	30e3a64a-1330-4133-bb28-20f26a72fcc2	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 21:09:15.704807+00	
00000000-0000-0000-0000-000000000000	a8a2da4c-b8ec-4933-938c-a63ef60fde87	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 21:13:43.694378+00	
00000000-0000-0000-0000-000000000000	c4effadb-1d2a-4ba6-b185-14b47fe6980b	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 21:16:21.181918+00	
00000000-0000-0000-0000-000000000000	19d02a39-0cc1-4adc-95ad-4fcd8a01968c	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 21:16:25.922807+00	
00000000-0000-0000-0000-000000000000	5de36a67-67a6-4461-b66d-eef287f99590	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 21:19:46.276145+00	
00000000-0000-0000-0000-000000000000	e0fd87da-bd70-4971-a7b0-16e959ed6f1b	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 21:25:33.850559+00	
00000000-0000-0000-0000-000000000000	c9042abc-2bd8-4333-9bd9-4661e07686f7	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 21:28:01.587983+00	
00000000-0000-0000-0000-000000000000	29379499-ab48-4aea-b588-7ac297c3cead	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 21:30:30.455102+00	
00000000-0000-0000-0000-000000000000	959131d5-a605-4d41-b29d-f30510cb6f48	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 21:34:28.825531+00	
00000000-0000-0000-0000-000000000000	4d772d03-f2b8-4741-a8b6-c6f7b7831a3f	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 22:15:00.825295+00	
00000000-0000-0000-0000-000000000000	42b9b4c0-8330-43bd-a743-45ead6375d3c	{"action":"token_revoked","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 22:15:00.826881+00	
00000000-0000-0000-0000-000000000000	ae1013c9-6b61-4cf2-8ca8-d8a0d36a3293	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 22:15:01.341209+00	
00000000-0000-0000-0000-000000000000	0b7bb80c-8807-4346-a1be-992afbcf7964	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 22:15:33.900384+00	
00000000-0000-0000-0000-000000000000	d8dd9e92-ec9e-41e8-8872-4f3a1a9cb0af	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 22:30:16.776589+00	
00000000-0000-0000-0000-000000000000	f7a1b646-390f-427e-ab4e-5e80e671e7b8	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 22:30:16.79284+00	
00000000-0000-0000-0000-000000000000	c9cc783c-c56e-4eb7-81fe-93e080278621	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 22:30:16.897308+00	
00000000-0000-0000-0000-000000000000	a26ade19-f63a-4b0e-b089-e73987e52151	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 22:30:16.941009+00	
00000000-0000-0000-0000-000000000000	439be9e9-6a49-4124-9dc4-845237030fa8	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 22:30:28.352797+00	
00000000-0000-0000-0000-000000000000	4068cd68-94fb-46f6-88cf-3746a0db14ec	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 22:31:31.512064+00	
00000000-0000-0000-0000-000000000000	952ee264-3fa0-4cd5-b7c6-7d795994dadb	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 22:31:31.88707+00	
00000000-0000-0000-0000-000000000000	bd3a06fc-7db7-4da8-8386-8e4fb4d3f63a	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 22:32:07.99941+00	
00000000-0000-0000-0000-000000000000	136a7e04-ba1e-43b3-bcb9-23039eb288bc	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 22:32:08.019028+00	
00000000-0000-0000-0000-000000000000	b813d5e1-9ebe-4668-a86e-a5f9ebe0d717	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 22:32:24.114192+00	
00000000-0000-0000-0000-000000000000	6ffb929d-8ca7-4f6e-86bb-0921394fc5f9	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 23:27:53.414421+00	
00000000-0000-0000-0000-000000000000	b3bf2977-f99b-4859-96e0-376ddb3e434a	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 23:30:26.388256+00	
00000000-0000-0000-0000-000000000000	166543cf-b92d-4471-87e0-251a1be1f518	{"action":"token_revoked","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 23:30:26.390501+00	
00000000-0000-0000-0000-000000000000	d92cefc4-80a9-4cb7-85ae-53f6c95bf330	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 00:37:59.649909+00	
00000000-0000-0000-0000-000000000000	422cc28f-0030-4691-aacf-6c432991be66	{"action":"token_revoked","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 00:37:59.655385+00	
00000000-0000-0000-0000-000000000000	7d2b0cec-4af0-4e28-9649-f58cd0bcbdce	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 00:38:00.275193+00	
00000000-0000-0000-0000-000000000000	56e09e5d-d418-4bee-8e65-89cbadd695bc	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 00:39:17.813338+00	
00000000-0000-0000-0000-000000000000	21057f6a-ce40-4073-b5b3-c8571a55a6c0	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 00:46:41.318229+00	
00000000-0000-0000-0000-000000000000	d71382cb-b83f-4153-81d0-9d6b029eb9a9	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 00:49:46.079231+00	
00000000-0000-0000-0000-000000000000	62bc4663-743e-44d1-b6fd-1be8438fd022	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 00:51:46.639037+00	
00000000-0000-0000-0000-000000000000	424bcc47-cf3b-44a0-a4f5-9f24e247e67c	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 01:06:48.577931+00	
00000000-0000-0000-0000-000000000000	daf0660f-24be-4288-8c1e-3c4e60cc21fb	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 01:11:49.6228+00	
00000000-0000-0000-0000-000000000000	b3f21183-7b5d-49ea-b339-4a523909a303	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 01:16:26.951941+00	
00000000-0000-0000-0000-000000000000	950ad404-4218-458a-b5c9-98b6476b0ed5	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 01:17:53.371296+00	
00000000-0000-0000-0000-000000000000	02ba7e51-9977-4418-a0e2-7143717e2a92	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 01:19:20.20475+00	
00000000-0000-0000-0000-000000000000	77d4155f-0dd6-4d66-a02e-8c7d64cfef8f	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 01:22:47.933886+00	
00000000-0000-0000-0000-000000000000	6e921c93-0893-458b-b0de-1518b17196a2	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 01:23:59.155682+00	
00000000-0000-0000-0000-000000000000	510a3888-af5b-4914-a0a8-5f8ce4040dfa	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 01:26:27.776603+00	
00000000-0000-0000-0000-000000000000	5c0bf841-732c-406a-90dd-13c7313b0103	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 01:27:03.276102+00	
00000000-0000-0000-0000-000000000000	fd0a04c1-b068-4138-9f79-1d4d10cd365f	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 01:27:53.033584+00	
00000000-0000-0000-0000-000000000000	13e27c29-1aa4-4f3c-9102-ccfe4184337d	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 01:30:21.343247+00	
00000000-0000-0000-0000-000000000000	4d77badc-ef44-4469-9643-9d017b609cdc	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 02:11:05.09973+00	
00000000-0000-0000-0000-000000000000	23693d31-0b13-442a-9f59-653cf713dcb2	{"action":"token_revoked","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 02:11:05.102945+00	
00000000-0000-0000-0000-000000000000	98ca5c27-da10-4129-9085-4acc70cd3556	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 02:29:20.639185+00	
00000000-0000-0000-0000-000000000000	88c0e1b0-3a17-42fd-98fe-64511e0550ed	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 02:29:58.908898+00	
00000000-0000-0000-0000-000000000000	05e0666a-b13f-43d1-ada9-5d9bbcff02cd	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 02:30:04.670722+00	
00000000-0000-0000-0000-000000000000	7afbd6a6-e1ee-489f-8796-82f5295232b8	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 03:00:11.366601+00	
00000000-0000-0000-0000-000000000000	eba674e7-f93d-40fc-b44b-6d8d55f1cd1d	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 03:48:45.555368+00	
00000000-0000-0000-0000-000000000000	dfffd6ff-aeac-4536-9650-8e30e8298864	{"action":"token_revoked","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 03:48:45.557477+00	
00000000-0000-0000-0000-000000000000	0fcc467d-1157-4d78-b1f3-9040bf082c6e	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 03:59:02.933294+00	
00000000-0000-0000-0000-000000000000	ed85c1da-7617-42c6-a7db-2a6cc986de2a	{"action":"token_revoked","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 03:59:02.936985+00	
00000000-0000-0000-0000-000000000000	7d89db50-ab84-4355-a133-6053668fe822	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 03:59:03.156859+00	
00000000-0000-0000-0000-000000000000	26ba27be-e804-4590-9188-e0050b628f8a	{"action":"token_refreshed","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 03:59:09.856539+00	
00000000-0000-0000-0000-000000000000	d40c91fe-0ba8-4f3f-bfdd-5c670d12eba4	{"action":"login","actor_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","actor_name":"João Moitinho","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 04:03:55.579569+00	
00000000-0000-0000-0000-000000000000	b290af8c-e65e-423c-9324-2fb8f9e3a6d0	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"raphaalves@openlove.com.br","user_id":"3907e703-4a4e-48fe-8f52-221c5ce03ddc","user_phone":""}}	2025-07-30 04:11:51.300791+00	
00000000-0000-0000-0000-000000000000	81a859b6-f390-46b5-b83e-677edd141ad9	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"moitinhoeu@icloud.com","user_id":"f4ef8d6e-f609-4598-abcd-7e17b3c8853b","user_phone":""}}	2025-07-30 04:11:51.302826+00	
00000000-0000-0000-0000-000000000000	3acc27c4-73d8-46cb-b4d9-667eb9c4b463	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jose.ronca@openlove.com.br","user_id":"3587e268-c229-4c95-888f-f3b94aa1fb15","user_phone":""}}	2025-07-30 04:11:51.308577+00	
00000000-0000-0000-0000-000000000000	c6285f22-d15e-4551-a58d-42f4fbcf26b8	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"matgon@openlove.com.br","user_id":"f5de8e7a-6a42-45e9-b726-0d385173544e","user_phone":""}}	2025-07-30 04:11:51.328917+00	
00000000-0000-0000-0000-000000000000	d70aaf1e-86d6-4380-b13f-2fb3e33789ea	{"action":"user_signedup","actor_id":"dccfe9e5-277d-4369-a4eb-115e4960937c","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-07-30 04:54:35.781438+00	
00000000-0000-0000-0000-000000000000	e7a863fd-5452-47dc-893e-42b206d97f5e	{"action":"login","actor_id":"dccfe9e5-277d-4369-a4eb-115e4960937c","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 04:54:35.789147+00	
00000000-0000-0000-0000-000000000000	8406d5a2-b320-47bc-9842-b565fbd5173d	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"moitinhoeu@icloud.com","user_id":"dccfe9e5-277d-4369-a4eb-115e4960937c","user_phone":""}}	2025-07-30 04:54:36.412634+00	
00000000-0000-0000-0000-000000000000	c78c869d-4859-4e37-b1a6-fec01ffd5454	{"action":"user_signedup","actor_id":"23ebf208-2f0d-4ec6-b625-03a9e12e7e45","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-07-30 04:54:45.331901+00	
00000000-0000-0000-0000-000000000000	14376036-b011-4f10-94d6-04bceda542b0	{"action":"login","actor_id":"23ebf208-2f0d-4ec6-b625-03a9e12e7e45","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 04:54:45.335708+00	
00000000-0000-0000-0000-000000000000	48ec0eeb-2e53-460f-b16a-10cb7229f683	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"moitinhoeu@icloud.com","user_id":"23ebf208-2f0d-4ec6-b625-03a9e12e7e45","user_phone":""}}	2025-07-30 04:54:46.177908+00	
00000000-0000-0000-0000-000000000000	faeec03a-3d82-42d7-89e8-eaf610cd7597	{"action":"user_signedup","actor_id":"e06d384d-0954-42c3-a954-7a6eea8e538d","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-07-30 04:56:32.668954+00	
00000000-0000-0000-0000-000000000000	71f61a7a-8508-45a1-be27-976a5aff0993	{"action":"login","actor_id":"e06d384d-0954-42c3-a954-7a6eea8e538d","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 04:56:32.674285+00	
00000000-0000-0000-0000-000000000000	1f534e60-841f-4d9d-a319-3e8f129f4a38	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"moitinhoeu@icloud.com","user_id":"e06d384d-0954-42c3-a954-7a6eea8e538d","user_phone":""}}	2025-07-30 04:56:33.534095+00	
00000000-0000-0000-0000-000000000000	0425a12e-48db-4bcf-b1f0-e9d4dc23903b	{"action":"user_signedup","actor_id":"36544843-b303-4404-9c7c-921340a1f536","actor_username":"moitinhoru@icloud.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-07-30 04:58:36.641333+00	
00000000-0000-0000-0000-000000000000	9d34b614-3af0-4439-903b-f7ebe395fb36	{"action":"login","actor_id":"36544843-b303-4404-9c7c-921340a1f536","actor_username":"moitinhoru@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 04:58:36.64891+00	
00000000-0000-0000-0000-000000000000	8bde209b-3715-4bee-b3f1-4724bee49820	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"moitinhoru@icloud.com","user_id":"36544843-b303-4404-9c7c-921340a1f536","user_phone":""}}	2025-07-30 04:58:37.532027+00	
00000000-0000-0000-0000-000000000000	245b2b49-340b-4ea8-9c51-205faa314062	{"action":"user_signedup","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoru@icloud.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-07-30 05:03:32.60626+00	
00000000-0000-0000-0000-000000000000	6932fc52-e259-4db0-8841-d291dde2c6e1	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoru@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 05:03:32.613688+00	
00000000-0000-0000-0000-000000000000	ba551ca9-97fc-4e4a-8bdb-186df90f9aa6	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoru@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 05:03:35.427278+00	
00000000-0000-0000-0000-000000000000	7e6dc51a-587b-4848-ad61-76fa5ec0d706	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 05:28:13.393498+00	
00000000-0000-0000-0000-000000000000	4c9618b1-be67-492c-b1ae-6bb9e7970af8	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 05:44:56.826821+00	
00000000-0000-0000-0000-000000000000	a2cb10f0-5bc7-46c0-b5ab-2ce279fcb236	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 05:50:28.834299+00	
00000000-0000-0000-0000-000000000000	85c4f0e5-8611-46c6-9629-493ebded546f	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 05:54:44.834688+00	
00000000-0000-0000-0000-000000000000	26fc6f8d-9baa-4bb0-9ec7-aa7e6bcae6c4	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 06:02:18.466603+00	
00000000-0000-0000-0000-000000000000	258e509c-ab74-4e6b-a956-cbd2e05f2283	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 06:14:32.898838+00	
00000000-0000-0000-0000-000000000000	3382b601-221b-4a78-99c2-f989bc7709c4	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 06:17:43.565055+00	
00000000-0000-0000-0000-000000000000	d9fd0b44-cc4e-4aa2-87e3-402e89319ea6	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 06:22:38.786599+00	
00000000-0000-0000-0000-000000000000	58ab95d3-19d4-4a29-8b8a-37e0a948efbf	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 06:23:20.098027+00	
00000000-0000-0000-0000-000000000000	7d98cfa5-f8f1-473c-8ecf-a230476071a6	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 06:24:22.375537+00	
00000000-0000-0000-0000-000000000000	23396d74-a489-4444-8313-ae49cdb089a2	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 06:27:08.581246+00	
00000000-0000-0000-0000-000000000000	2f329c14-8a06-4736-bdab-b2fae23b6899	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 06:33:23.715681+00	
00000000-0000-0000-0000-000000000000	39a3f84b-7245-4acf-8f77-e357a50789c9	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 06:41:51.096772+00	
00000000-0000-0000-0000-000000000000	7288a506-c2eb-4167-acc0-a9fc00f83ee0	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 07:00:47.584414+00	
00000000-0000-0000-0000-000000000000	55f69aca-1530-4d2b-a06f-23474cc65d43	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 07:13:38.049229+00	
00000000-0000-0000-0000-000000000000	0d437380-5779-4056-8132-e510972391ff	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 07:15:49.104707+00	
00000000-0000-0000-0000-000000000000	4261f41b-8f00-4866-b723-1c2b76713ac4	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 07:37:47.346556+00	
00000000-0000-0000-0000-000000000000	4c908156-d880-4dce-88dd-7e9f90295093	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 07:43:48.534122+00	
00000000-0000-0000-0000-000000000000	bfa1fb64-1830-49a8-ac93-9cb46c6638ce	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 07:47:38.393608+00	
00000000-0000-0000-0000-000000000000	3fefa97d-4af9-4197-b339-a73536af9ed4	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 08:02:40.649221+00	
00000000-0000-0000-0000-000000000000	0f4c2e49-cd60-4c6b-a528-7aad33c17cca	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 08:15:54.105154+00	
00000000-0000-0000-0000-000000000000	a2b3c91d-1c64-4396-b3ad-1e485aec835b	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 08:30:34.319267+00	
00000000-0000-0000-0000-000000000000	02521661-c752-4707-8d1f-79774f985706	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 08:50:08.762882+00	
00000000-0000-0000-0000-000000000000	1c45bf6a-7511-4b20-9eb2-b08cca68ffdd	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 09:00:44.501499+00	
00000000-0000-0000-0000-000000000000	f4073fcd-14a4-4c09-8193-0e90b469bad8	{"action":"token_refreshed","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 09:03:27.32334+00	
00000000-0000-0000-0000-000000000000	2667e08e-c04b-494e-aad4-302f1e9026d7	{"action":"token_revoked","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 09:03:27.327905+00	
00000000-0000-0000-0000-000000000000	e89ae437-ac34-47f7-9010-16aa114a31d5	{"action":"token_refreshed","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 09:03:27.619855+00	
00000000-0000-0000-0000-000000000000	ce1f35f9-494a-4cc1-8da4-62dfad2825c2	{"action":"user_signedup","actor_id":"0956c6c2-0b06-4de2-99d2-66c27197436f","actor_username":"joao.silva489@academico.ufgd.edu.br","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-07-30 09:06:20.667514+00	
00000000-0000-0000-0000-000000000000	1f15ea72-42c3-49f7-9bbc-690558a27a5b	{"action":"login","actor_id":"0956c6c2-0b06-4de2-99d2-66c27197436f","actor_username":"joao.silva489@academico.ufgd.edu.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 09:06:20.675835+00	
00000000-0000-0000-0000-000000000000	8adefa82-47ef-441c-954a-95d168a38b72	{"action":"login","actor_id":"0956c6c2-0b06-4de2-99d2-66c27197436f","actor_username":"joao.silva489@academico.ufgd.edu.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 09:06:24.462508+00	
00000000-0000-0000-0000-000000000000	0c16d61f-6650-4f26-9338-464f8b7e1ff0	{"action":"token_refreshed","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 09:28:39.571923+00	
00000000-0000-0000-0000-000000000000	4dfdd08f-ccae-494b-9f64-6bd657c17f63	{"action":"token_revoked","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 09:28:39.580569+00	
00000000-0000-0000-0000-000000000000	27ba548d-1ff9-456e-bff5-9d14ab61b96b	{"action":"token_refreshed","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 09:28:39.991234+00	
00000000-0000-0000-0000-000000000000	aaa9b556-4455-4bfa-b1b4-bb70b5baf6d3	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 09:41:37.934265+00	
00000000-0000-0000-0000-000000000000	1db203cb-4e91-4a13-8957-9b990b78dc0c	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 09:43:09.590902+00	
00000000-0000-0000-0000-000000000000	fea1c403-7261-4f79-b918-5b01cd565f03	{"action":"token_refreshed","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 11:54:21.722346+00	
00000000-0000-0000-0000-000000000000	a46b9f3c-2f14-4ee9-a57d-deb8ba4d9418	{"action":"token_revoked","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 11:54:21.733152+00	
00000000-0000-0000-0000-000000000000	07002ce3-391b-4b46-b1d6-737fb0c764f7	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 14:14:18.628832+00	
00000000-0000-0000-0000-000000000000	89402e54-35f3-41e1-a0d5-1e2b443fb2fc	{"action":"token_refreshed","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 15:07:39.064212+00	
00000000-0000-0000-0000-000000000000	ca9b3835-04a7-4d23-886e-50a8e65478be	{"action":"token_revoked","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 15:07:39.0712+00	
00000000-0000-0000-0000-000000000000	c6560e11-52c3-4fd3-9296-b4eb53f8ab20	{"action":"token_refreshed","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 15:07:41.450134+00	
00000000-0000-0000-0000-000000000000	3b9ce260-afa2-45ac-8827-94490ca364fb	{"action":"token_refreshed","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 15:07:44.402791+00	
00000000-0000-0000-0000-000000000000	aa013026-17ae-433a-8ddb-ce26abcb8cbe	{"action":"token_refreshed","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 15:07:44.971114+00	
00000000-0000-0000-0000-000000000000	259db995-a129-4123-8aad-88563c422800	{"action":"token_refreshed","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 19:00:45.999105+00	
00000000-0000-0000-0000-000000000000	dfaf0fc1-c60b-4739-86a2-75bae5a6b7fe	{"action":"token_revoked","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 19:00:46.011098+00	
00000000-0000-0000-0000-000000000000	ee0f7b10-119d-447a-b832-5b6196a41ff2	{"action":"token_refreshed","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-30 19:00:46.460664+00	
00000000-0000-0000-0000-000000000000	34a73414-d454-441a-bcf6-983f7874b223	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 19:23:14.627174+00	
00000000-0000-0000-0000-000000000000	89d7c864-15ee-4b86-95c0-d8eb19569393	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 19:25:31.97422+00	
00000000-0000-0000-0000-000000000000	9a8dff6a-691a-4508-ba75-7fae96ce7281	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 19:26:10.008698+00	
00000000-0000-0000-0000-000000000000	c61d096f-641c-441c-9a4d-937fec32df2b	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 19:27:42.597941+00	
00000000-0000-0000-0000-000000000000	01821693-3267-45f4-ae3f-e2e4ae8004fe	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 19:33:58.597931+00	
00000000-0000-0000-0000-000000000000	3b5c0fc5-60c0-4653-bcf1-3bdeb169e7fd	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-30 20:33:49.378065+00	
00000000-0000-0000-0000-000000000000	a25b63ee-77cd-4219-acc6-5770588c0190	{"action":"token_refreshed","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-31 00:46:26.627277+00	
00000000-0000-0000-0000-000000000000	0caeb23d-b24c-4c91-a105-78396b8cc91c	{"action":"token_revoked","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-31 00:46:26.633698+00	
00000000-0000-0000-0000-000000000000	b0578563-9305-4409-9b45-2266aa9c006b	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 01:25:18.949593+00	
00000000-0000-0000-0000-000000000000	da3accaa-d42f-4fe6-b3ef-3e2a74f20c31	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 01:27:50.578171+00	
00000000-0000-0000-0000-000000000000	bd2e88db-6469-4f02-9d0d-42834a635f94	{"action":"token_refreshed","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-31 01:40:33.37576+00	
00000000-0000-0000-0000-000000000000	280e5811-89b8-4243-afbf-c48c3c21f2d1	{"action":"token_revoked","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-31 01:40:33.380361+00	
00000000-0000-0000-0000-000000000000	5962671c-fd87-458d-aa84-87e35a6264ad	{"action":"token_refreshed","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-31 02:03:50.372623+00	
00000000-0000-0000-0000-000000000000	09a5fd35-e8f3-45b0-bb60-8c936ee1637d	{"action":"token_revoked","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-31 02:03:50.37554+00	
00000000-0000-0000-0000-000000000000	5fedb1da-f314-4acc-8094-87cf48df37db	{"action":"token_refreshed","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-31 04:40:09.472404+00	
00000000-0000-0000-0000-000000000000	3e31573b-a323-40fa-baf7-fd1d51fac0a3	{"action":"token_revoked","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-31 04:40:09.478966+00	
00000000-0000-0000-0000-000000000000	40f56383-ec2e-44c5-a01c-6db202f2fa8a	{"action":"token_refreshed","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-31 04:40:09.988801+00	
00000000-0000-0000-0000-000000000000	a63360a7-5537-45e8-b71d-c5e6eee1cba8	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 05:05:33.88474+00	
00000000-0000-0000-0000-000000000000	5c2bdfcd-a30c-4813-b0b4-304db7afe13f	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-31 05:32:48.931939+00	
00000000-0000-0000-0000-000000000000	15d49ebd-67ca-4394-94f8-ab6e223971f1	{"action":"token_refreshed","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-31 06:27:23.115224+00	
00000000-0000-0000-0000-000000000000	b8a43a9e-8e7b-40e8-8dad-9385dc1c303f	{"action":"token_revoked","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-31 06:27:23.118929+00	
00000000-0000-0000-0000-000000000000	f40e3d6e-91cd-4a4b-8519-d96acc3b39e3	{"action":"token_refreshed","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-07-31 06:27:23.598866+00	
00000000-0000-0000-0000-000000000000	415519df-17c2-40ec-a42e-c44aecf75c17	{"action":"token_refreshed","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-08-02 03:22:19.546572+00	
00000000-0000-0000-0000-000000000000	4ad97150-1f51-4883-8fff-58a9f745a04c	{"action":"token_revoked","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"token"}	2025-08-02 03:22:19.56176+00	
00000000-0000-0000-0000-000000000000	fd7b10d9-fc16-4574-ab07-ade6d4fcb984	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 03:55:03.738937+00	
00000000-0000-0000-0000-000000000000	95495d60-2e8c-404f-a4da-b5383054966a	{"action":"user_signedup","actor_id":"0eef5428-bc4a-4169-bf9b-55d5616b08d4","actor_username":"mand.souza18@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-02 04:01:27.734228+00	
00000000-0000-0000-0000-000000000000	6aa716fb-9d70-40de-ac90-2c5887a3a734	{"action":"login","actor_id":"0eef5428-bc4a-4169-bf9b-55d5616b08d4","actor_username":"mand.souza18@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 04:01:27.746317+00	
00000000-0000-0000-0000-000000000000	bbb2d64d-0e79-40fc-af24-4d8afefeee4e	{"action":"login","actor_id":"0eef5428-bc4a-4169-bf9b-55d5616b08d4","actor_username":"mand.souza18@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 04:01:35.75523+00	
00000000-0000-0000-0000-000000000000	11fbc20c-e298-4ef7-ac26-6e6963f5d283	{"action":"login","actor_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","actor_username":"moitinhoeu@icloud.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 04:07:34.57914+00	
00000000-0000-0000-0000-000000000000	514bddc8-c32f-4483-8472-81148a65bde7	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"moitinhoeu@icloud.com","user_id":"34d0164c-3ba4-403a-9c15-b896efb27e5f","user_phone":""}}	2025-08-02 04:52:23.122511+00	
00000000-0000-0000-0000-000000000000	4438a531-f374-4445-b0fe-f997b8b0cc06	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"joao.silva489@academico.ufgd.edu.br","user_id":"0956c6c2-0b06-4de2-99d2-66c27197436f","user_phone":""}}	2025-08-02 04:52:23.170054+00	
00000000-0000-0000-0000-000000000000	0a89d1c8-f6ec-4173-8386-6b23e2c94a19	{"action":"user_signedup","actor_id":"0a7f73c7-a6db-4975-a466-ff286025789a","actor_username":"contato@moitinho.dev","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-02 04:55:38.289125+00	
00000000-0000-0000-0000-000000000000	143145a8-fbd0-49b9-8265-a9f2143ee7b8	{"action":"login","actor_id":"0a7f73c7-a6db-4975-a466-ff286025789a","actor_username":"contato@moitinho.dev","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 04:55:38.295129+00	
00000000-0000-0000-0000-000000000000	2c20c479-be1d-496b-8a14-68e4b3edbb23	{"action":"login","actor_id":"0a7f73c7-a6db-4975-a466-ff286025789a","actor_username":"contato@moitinho.dev","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 04:56:39.89603+00	
00000000-0000-0000-0000-000000000000	c39383c9-3976-4bce-b2e9-80c013013237	{"action":"login","actor_id":"0a7f73c7-a6db-4975-a466-ff286025789a","actor_username":"contato@moitinho.dev","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 04:57:31.548671+00	
00000000-0000-0000-0000-000000000000	1c31eefc-bc87-4c58-8717-298d3445a2b8	{"action":"token_refreshed","actor_id":"0eef5428-bc4a-4169-bf9b-55d5616b08d4","actor_username":"mand.souza18@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-02 05:00:17.393367+00	
00000000-0000-0000-0000-000000000000	85229831-4fee-4df0-ab13-5dc8081185fb	{"action":"token_revoked","actor_id":"0eef5428-bc4a-4169-bf9b-55d5616b08d4","actor_username":"mand.souza18@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-02 05:00:17.395019+00	
00000000-0000-0000-0000-000000000000	a2d8beca-cc10-4df1-ae92-db31875ea3c5	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"mand.souza18@gmail.com","user_id":"0eef5428-bc4a-4169-bf9b-55d5616b08d4","user_phone":""}}	2025-08-02 05:09:15.50638+00	
00000000-0000-0000-0000-000000000000	5303f5f6-f37d-4999-8b6e-4adc56178e3a	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"contato@moitinho.dev","user_id":"0a7f73c7-a6db-4975-a466-ff286025789a","user_phone":""}}	2025-08-02 05:09:15.523923+00	
00000000-0000-0000-0000-000000000000	1fa1b40f-761e-4771-928f-d7838d80549d	{"action":"user_signedup","actor_id":"0023c227-1dd0-448a-bfb8-4e13a1f61e9f","actor_username":"teste@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-02 05:31:05.820765+00	
00000000-0000-0000-0000-000000000000	7a89ede8-948a-4a2c-95b9-a1c7ce030aca	{"action":"login","actor_id":"0023c227-1dd0-448a-bfb8-4e13a1f61e9f","actor_username":"teste@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 05:31:05.827461+00	
00000000-0000-0000-0000-000000000000	edb80391-cc35-44ca-804b-6e896aafa1ee	{"action":"user_signedup","actor_id":"2eac03d5-b876-4e03-ad7c-ae3b50105db3","actor_username":"completo@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-02 05:31:35.231412+00	
00000000-0000-0000-0000-000000000000	ed798be2-20cc-4b82-b086-304b12312b69	{"action":"login","actor_id":"2eac03d5-b876-4e03-ad7c-ae3b50105db3","actor_username":"completo@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 05:31:35.235087+00	
00000000-0000-0000-0000-000000000000	d1d3156f-e150-4e89-bca6-df45313d7911	{"action":"user_signedup","actor_id":"b14caa6d-9cce-4a3a-8286-58788cc6bb68","actor_username":"moitinho@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-02 05:41:04.101716+00	
00000000-0000-0000-0000-000000000000	96833cb0-ecf4-4ab4-9919-eaaa01700f28	{"action":"login","actor_id":"b14caa6d-9cce-4a3a-8286-58788cc6bb68","actor_username":"moitinho@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 05:41:04.105982+00	
00000000-0000-0000-0000-000000000000	7e4ee1cc-df69-4b03-a28f-7ef551a2314c	{"action":"user_signedup","actor_id":"e73a42b6-e83f-4b0a-86b0-8a7cfaf0b244","actor_username":"contato@moitinho.dev","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-02 05:47:27.376724+00	
00000000-0000-0000-0000-000000000000	46678540-7c2e-480e-ab52-d9baa6f39004	{"action":"login","actor_id":"e73a42b6-e83f-4b0a-86b0-8a7cfaf0b244","actor_username":"contato@moitinho.dev","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 05:47:27.3819+00	
00000000-0000-0000-0000-000000000000	293ddff2-5be6-487b-8d22-8458de8309aa	{"action":"login","actor_id":"e73a42b6-e83f-4b0a-86b0-8a7cfaf0b244","actor_username":"contato@moitinho.dev","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 05:47:37.216675+00	
00000000-0000-0000-0000-000000000000	539db19a-ef43-4b2d-b705-4ab072433f91	{"action":"login","actor_id":"e73a42b6-e83f-4b0a-86b0-8a7cfaf0b244","actor_username":"contato@moitinho.dev","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 05:49:23.105423+00	
00000000-0000-0000-0000-000000000000	e3e988bc-c4ca-4837-97f2-78bf24f3a2ca	{"action":"user_repeated_signup","actor_id":"e73a42b6-e83f-4b0a-86b0-8a7cfaf0b244","actor_username":"contato@moitinho.dev","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-08-02 06:16:37.540332+00	
00000000-0000-0000-0000-000000000000	608d43af-b607-4b74-b0de-ed45376cd2e7	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"completo@example.com","user_id":"2eac03d5-b876-4e03-ad7c-ae3b50105db3","user_phone":""}}	2025-08-02 06:17:20.0277+00	
00000000-0000-0000-0000-000000000000	37c26369-cca0-47d8-bca5-df50068cf062	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"moitinho@example.com","user_id":"b14caa6d-9cce-4a3a-8286-58788cc6bb68","user_phone":""}}	2025-08-02 06:17:20.033112+00	
00000000-0000-0000-0000-000000000000	ffc0c546-cfe4-47c2-8c03-853f19594edd	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"teste@example.com","user_id":"0023c227-1dd0-448a-bfb8-4e13a1f61e9f","user_phone":""}}	2025-08-02 06:17:20.059478+00	
00000000-0000-0000-0000-000000000000	6bad8feb-f1a3-423e-ba83-27f8132687e5	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"contato@moitinho.dev","user_id":"e73a42b6-e83f-4b0a-86b0-8a7cfaf0b244","user_phone":""}}	2025-08-02 06:17:20.093968+00	
00000000-0000-0000-0000-000000000000	798b7816-a1c8-4bc2-ab7a-516602f6639b	{"action":"user_signedup","actor_id":"fc8a79dc-3c32-42ed-b110-889cf5119479","actor_username":"contato@moitinho.dev","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-02 06:17:27.285168+00	
00000000-0000-0000-0000-000000000000	267cc8cd-725f-437f-9494-952e7e9caa8d	{"action":"login","actor_id":"fc8a79dc-3c32-42ed-b110-889cf5119479","actor_username":"contato@moitinho.dev","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 06:17:27.289982+00	
00000000-0000-0000-0000-000000000000	22bf82dc-f51f-4ccd-98fc-40508122b2c1	{"action":"login","actor_id":"fc8a79dc-3c32-42ed-b110-889cf5119479","actor_username":"contato@moitinho.dev","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 06:17:28.22322+00	
00000000-0000-0000-0000-000000000000	2c6d6079-8e9e-4115-8694-b1e7f616d820	{"action":"login","actor_id":"fc8a79dc-3c32-42ed-b110-889cf5119479","actor_username":"contato@moitinho.dev","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 06:52:49.337837+00	
00000000-0000-0000-0000-000000000000	813264ee-653a-4b74-9487-65b975b4f0d1	{"action":"login","actor_id":"fc8a79dc-3c32-42ed-b110-889cf5119479","actor_username":"contato@moitinho.dev","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 06:56:53.752677+00	
00000000-0000-0000-0000-000000000000	78cb4ce6-e99b-451f-b824-3f13762d4823	{"action":"login","actor_id":"fc8a79dc-3c32-42ed-b110-889cf5119479","actor_username":"contato@moitinho.dev","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 07:00:57.876427+00	
00000000-0000-0000-0000-000000000000	431a3b6f-3e03-4d17-8933-6fa5204ece62	{"action":"user_signedup","actor_id":"13724550-d2af-40f3-9bac-38371c55717e","actor_username":"mand.souza18@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-02 07:17:48.886448+00	
00000000-0000-0000-0000-000000000000	42fb682d-d971-4235-be42-ab555ff473e9	{"action":"login","actor_id":"13724550-d2af-40f3-9bac-38371c55717e","actor_username":"mand.souza18@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 07:17:48.893916+00	
00000000-0000-0000-0000-000000000000	2bbb5cee-4b87-4665-a989-7c018774d8c1	{"action":"login","actor_id":"13724550-d2af-40f3-9bac-38371c55717e","actor_username":"mand.souza18@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 07:17:49.888841+00	
00000000-0000-0000-0000-000000000000	9d95a7a0-b2bd-4ee4-846a-03a7c56d3a32	{"action":"token_refreshed","actor_id":"fc8a79dc-3c32-42ed-b110-889cf5119479","actor_username":"contato@moitinho.dev","actor_via_sso":false,"log_type":"token"}	2025-08-02 07:24:28.617638+00	
00000000-0000-0000-0000-000000000000	fda8e2d6-7eee-4376-8e10-d09748da8f0e	{"action":"token_revoked","actor_id":"fc8a79dc-3c32-42ed-b110-889cf5119479","actor_username":"contato@moitinho.dev","actor_via_sso":false,"log_type":"token"}	2025-08-02 07:24:28.620939+00	
00000000-0000-0000-0000-000000000000	6c57a42b-6956-48b7-9e5c-7afb7862c24f	{"action":"token_refreshed","actor_id":"13724550-d2af-40f3-9bac-38371c55717e","actor_username":"mand.souza18@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-02 08:16:43.853964+00	
00000000-0000-0000-0000-000000000000	5191e3d7-1fd9-4a31-8b44-3b2a63af8a33	{"action":"token_revoked","actor_id":"13724550-d2af-40f3-9bac-38371c55717e","actor_username":"mand.souza18@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-02 08:16:43.861428+00	
00000000-0000-0000-0000-000000000000	f4793dd0-7a89-4e8f-bafb-ac31a829de6f	{"action":"token_refreshed","actor_id":"13724550-d2af-40f3-9bac-38371c55717e","actor_username":"mand.souza18@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-02 09:15:32.885811+00	
00000000-0000-0000-0000-000000000000	abde4204-484d-426f-898f-cc45dd061ce8	{"action":"token_revoked","actor_id":"13724550-d2af-40f3-9bac-38371c55717e","actor_username":"mand.souza18@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-02 09:15:32.890501+00	
00000000-0000-0000-0000-000000000000	35ab5650-c9b5-4ede-a847-495f0d5c9f66	{"action":"token_refreshed","actor_id":"13724550-d2af-40f3-9bac-38371c55717e","actor_username":"mand.souza18@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-02 10:15:10.282051+00	
00000000-0000-0000-0000-000000000000	e8143536-6f94-4db3-b61e-7ce72b441dc4	{"action":"token_revoked","actor_id":"13724550-d2af-40f3-9bac-38371c55717e","actor_username":"mand.souza18@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-02 10:15:10.286708+00	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
fc8a79dc-3c32-42ed-b110-889cf5119479	fc8a79dc-3c32-42ed-b110-889cf5119479	{"sub": "fc8a79dc-3c32-42ed-b110-889cf5119479", "name": "João Vitor Moitinho", "email": "contato@moitinho.dev", "username": "eumoitinho", "birth_date": "2000-11-14", "email_verified": false, "phone_verified": false}	email	2025-08-02 06:17:27.277908+00	2025-08-02 06:17:27.277963+00	2025-08-02 06:17:27.277963+00	68d052bf-069a-4d3f-afdd-02d0e80a0d2b
13724550-d2af-40f3-9bac-38371c55717e	13724550-d2af-40f3-9bac-38371c55717e	{"sub": "13724550-d2af-40f3-9bac-38371c55717e", "name": "Amanda Aparecida de Souza ", "email": "mand.souza18@gmail.com", "username": "discretamentesua", "birth_date": "1999-08-18", "email_verified": false, "phone_verified": false}	email	2025-08-02 07:17:48.880193+00	2025-08-02 07:17:48.880248+00	2025-08-02 07:17:48.880248+00	a9e71479-643b-4449-902b-13b76c6f298c
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
c1f82426-93c0-4f85-96f7-7eac2d778cfd	2025-08-02 06:17:27.300758+00	2025-08-02 06:17:27.300758+00	password	7fde67d3-eac0-4e57-9e66-c078a90bf9c8
334ddebb-357c-49d4-a663-661357b3696c	2025-08-02 06:17:28.226485+00	2025-08-02 06:17:28.226485+00	password	f9c6c7e3-26f0-4b5d-a210-9693e3abd7f3
43be8d0a-2f5c-4dd1-8abc-894522b99405	2025-08-02 06:52:49.355074+00	2025-08-02 06:52:49.355074+00	password	c3493c63-5b6e-4550-80d2-fa4212e0df15
736b1a69-af6c-45dc-a6a4-482394aa6539	2025-08-02 06:56:53.761622+00	2025-08-02 06:56:53.761622+00	password	d27df094-52e9-4b0c-a2a9-a03c07f943bb
723c48be-c41d-4e61-b11d-382b28a9b023	2025-08-02 07:00:57.886191+00	2025-08-02 07:00:57.886191+00	password	0ef98a48-6372-440d-a944-a553c90466e3
bbf43ac9-fb2f-4b20-b2d9-d291a298b426	2025-08-02 07:17:48.898145+00	2025-08-02 07:17:48.898145+00	password	4e1fe737-813f-4fd6-9dd8-e0bf69a8091b
2a29dab3-68de-4137-b142-8d46cbbef0c5	2025-08-02 07:17:49.894336+00	2025-08-02 07:17:49.894336+00	password	6521c941-6ee0-4c6e-94c7-66b73f75152d
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	366	ixe7u5xdhw2r	fc8a79dc-3c32-42ed-b110-889cf5119479	f	2025-08-02 06:52:49.351049+00	2025-08-02 06:52:49.351049+00	\N	43be8d0a-2f5c-4dd1-8abc-894522b99405
00000000-0000-0000-0000-000000000000	368	ksucphykag5h	fc8a79dc-3c32-42ed-b110-889cf5119479	f	2025-08-02 07:00:57.882722+00	2025-08-02 07:00:57.882722+00	\N	723c48be-c41d-4e61-b11d-382b28a9b023
00000000-0000-0000-0000-000000000000	371	p2ubgjj365p5	fc8a79dc-3c32-42ed-b110-889cf5119479	f	2025-08-02 07:24:28.624297+00	2025-08-02 07:24:28.624297+00	xl62uvtsa56m	334ddebb-357c-49d4-a663-661357b3696c
00000000-0000-0000-0000-000000000000	373	fiksz4ln4bcz	13724550-d2af-40f3-9bac-38371c55717e	t	2025-08-02 09:15:32.89434+00	2025-08-02 10:15:10.29666+00	g7nnk5y5x27f	2a29dab3-68de-4137-b142-8d46cbbef0c5
00000000-0000-0000-0000-000000000000	364	uqwdfz6lpv2z	fc8a79dc-3c32-42ed-b110-889cf5119479	f	2025-08-02 06:17:27.293815+00	2025-08-02 06:17:27.293815+00	\N	c1f82426-93c0-4f85-96f7-7eac2d778cfd
00000000-0000-0000-0000-000000000000	367	exbmr2ytstfa	fc8a79dc-3c32-42ed-b110-889cf5119479	f	2025-08-02 06:56:53.756814+00	2025-08-02 06:56:53.756814+00	\N	736b1a69-af6c-45dc-a6a4-482394aa6539
00000000-0000-0000-0000-000000000000	369	7bhwhr75te6i	13724550-d2af-40f3-9bac-38371c55717e	f	2025-08-02 07:17:48.896312+00	2025-08-02 07:17:48.896312+00	\N	bbf43ac9-fb2f-4b20-b2d9-d291a298b426
00000000-0000-0000-0000-000000000000	365	xl62uvtsa56m	fc8a79dc-3c32-42ed-b110-889cf5119479	t	2025-08-02 06:17:28.225362+00	2025-08-02 07:24:28.622035+00	\N	334ddebb-357c-49d4-a663-661357b3696c
00000000-0000-0000-0000-000000000000	370	jxk26542jsrx	13724550-d2af-40f3-9bac-38371c55717e	t	2025-08-02 07:17:49.892804+00	2025-08-02 08:16:43.862053+00	\N	2a29dab3-68de-4137-b142-8d46cbbef0c5
00000000-0000-0000-0000-000000000000	372	g7nnk5y5x27f	13724550-d2af-40f3-9bac-38371c55717e	t	2025-08-02 08:16:43.865308+00	2025-08-02 09:15:32.892894+00	jxk26542jsrx	2a29dab3-68de-4137-b142-8d46cbbef0c5
00000000-0000-0000-0000-000000000000	374	iwl57qwc6pxk	13724550-d2af-40f3-9bac-38371c55717e	f	2025-08-02 10:15:10.298684+00	2025-08-02 10:15:10.298684+00	fiksz4ln4bcz	2a29dab3-68de-4137-b142-8d46cbbef0c5
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
c1f82426-93c0-4f85-96f7-7eac2d778cfd	fc8a79dc-3c32-42ed-b110-889cf5119479	2025-08-02 06:17:27.291591+00	2025-08-02 06:17:27.291591+00	\N	aal1	\N	\N	node	179.94.46.78	\N
736b1a69-af6c-45dc-a6a4-482394aa6539	fc8a79dc-3c32-42ed-b110-889cf5119479	2025-08-02 06:56:53.755018+00	2025-08-02 06:56:53.755018+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	179.94.46.78	\N
bbf43ac9-fb2f-4b20-b2d9-d291a298b426	13724550-d2af-40f3-9bac-38371c55717e	2025-08-02 07:17:48.894585+00	2025-08-02 07:17:48.894585+00	\N	aal1	\N	\N	node	179.94.46.78	\N
334ddebb-357c-49d4-a663-661357b3696c	fc8a79dc-3c32-42ed-b110-889cf5119479	2025-08-02 06:17:28.224658+00	2025-08-02 07:24:28.627557+00	\N	aal1	\N	2025-08-02 07:24:28.627486	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	179.94.46.78	\N
2a29dab3-68de-4137-b142-8d46cbbef0c5	13724550-d2af-40f3-9bac-38371c55717e	2025-08-02 07:17:49.889752+00	2025-08-02 10:15:10.303299+00	\N	aal1	\N	2025-08-02 10:15:10.30322	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36	179.94.46.78	\N
43be8d0a-2f5c-4dd1-8abc-894522b99405	fc8a79dc-3c32-42ed-b110-889cf5119479	2025-08-02 06:52:49.347741+00	2025-08-02 06:52:49.347741+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	179.94.46.78	\N
723c48be-c41d-4e61-b11d-382b28a9b023	fc8a79dc-3c32-42ed-b110-889cf5119479	2025-08-02 07:00:57.878944+00	2025-08-02 07:00:57.878944+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	179.94.46.78	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	13724550-d2af-40f3-9bac-38371c55717e	authenticated	authenticated	mand.souza18@gmail.com	$2a$10$149bswB4qdswhfu4VIh3TueFZl4wRH5jJQs09A3nc5f9NrcjWZlF.	2025-08-02 07:17:48.889525+00	\N		\N		\N			\N	2025-08-02 07:17:49.889676+00	{"provider": "email", "providers": ["email"]}	{"sub": "13724550-d2af-40f3-9bac-38371c55717e", "name": "Amanda Aparecida de Souza ", "email": "mand.souza18@gmail.com", "username": "discretamentesua", "birth_date": "1999-08-18", "email_verified": true, "phone_verified": false}	\N	2025-08-02 07:17:48.869803+00	2025-08-02 10:15:10.301189+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	fc8a79dc-3c32-42ed-b110-889cf5119479	authenticated	authenticated	contato@moitinho.dev	$2a$10$tCm1A8Fz63tJNPDwjuDcRu.1ktyoOmrVxJUEdiWXnX/WZAODn.hCq	2025-08-02 06:17:27.286403+00	\N		\N		\N			\N	2025-08-02 07:00:57.878866+00	{"provider": "email", "providers": ["email"]}	{"sub": "fc8a79dc-3c32-42ed-b110-889cf5119479", "name": "João Vitor Moitinho", "email": "contato@moitinho.dev", "username": "eumoitinho", "birth_date": "2000-11-14", "email_verified": true, "phone_verified": false}	\N	2025-08-02 06:17:27.267906+00	2025-08-02 07:24:28.625395+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: ad_campaigns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ad_campaigns (id, business_id, name, description, objective, total_budget, daily_budget, spent_credits, start_date, end_date, schedule_hours, schedule_days, targeting, metrics, optimization_goal, bid_strategy, max_bid_amount, status, approval_status, rejection_reasons, approved_at, paused_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ad_impressions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ad_impressions (id, ad_id, user_id, was_clicked, click_timestamp, placement, created_at) FROM stdin;
\.


--
-- Data for Name: ad_interactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ad_interactions (id, ad_id, campaign_id, user_id, interaction_type, placement, device_type, click_position, time_to_click, conversion_type, conversion_value, user_location, distance_from_business, user_agent, ip_address, referrer, created_at) FROM stdin;
\.


--
-- Data for Name: admin_action_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_action_logs (id, admin_id, action, action_description, target_type, target_id, target_data, changes, reason, notes, ip_address, user_agent, request_id, was_successful, error_message, created_at) FROM stdin;
\.


--
-- Data for Name: admin_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_metrics (id, metric_date, metric_hour, total_users, new_users, active_users, premium_users, verified_users, revenue_total, revenue_subscriptions, revenue_credits, revenue_content, refunds_total, posts_created, posts_removed, messages_sent, reports_created, reports_resolved, users_banned, content_removed, businesses_total, businesses_new, businesses_verified, ads_served, dating_profiles_active, swipes_total, matches_created, api_requests, api_errors, average_response_time, created_at) FROM stdin;
\.


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_users (id, user_id, employee_id, full_name, access_level, departments, is_department_head, permissions, last_login, last_ip, login_count, actions_count, two_factor_enabled, two_factor_secret, password_changed_at, must_change_password, is_active, deactivated_at, deactivation_reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: advertisements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.advertisements (id, advertiser_id, title, content, media_url, cta_text, cta_url, target_age_min, target_age_max, target_genders, target_locations, target_interests, budget, cost_per_impression, cost_per_click, impressions, clicks, status, starts_at, ends_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: blocked_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blocked_users (id, blocker_id, blocked_id, reason, created_at, blocked_at) FROM stdin;
\.


--
-- Data for Name: business_ads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.business_ads (id, campaign_id, business_id, format, placement_priority, content, variations, winning_variation, impressions, unique_impressions, clicks, unique_clicks, conversions, credits_spent, metrics_by_day, metrics_by_hour, metrics_by_placement, status, quality_score, first_served_at, last_served_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: business_team; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.business_team (id, business_id, user_id, role, permissions, department, title, is_active, joined_at, removed_at) FROM stdin;
\.


--
-- Data for Name: businesses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.businesses (id, owner_id, business_type, business_name, legal_name, cnpj, description, short_description, category, subcategories, tags, address, coordinates, business_hours, service_area_radius, contact, social_links, is_verified, verified_at, verification_level, verification_documents, logo_url, cover_image_url, gallery_urls, credit_balance, total_credits_purchased, total_credits_spent, total_revenue, settings, features, stats, status, suspension_reason, slug, meta_description, meta_keywords, created_at, updated_at, last_active_at) FROM stdin;
\.


--
-- Data for Name: calls; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.calls (id, conversation_id, caller_id, call_type, status, participants, started_at, ended_at, duration_seconds, created_at) FROM stdin;
\.


--
-- Data for Name: comment_likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comment_likes (id, comment_id, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, post_id, user_id, parent_id, content, media_urls, stats, is_reported, is_hidden, is_edited, edited_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: communities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.communities (id, creator_id, name, description, avatar_url, cover_url, is_private, requires_approval, is_verified, category, tags, location, city, uf, member_count, post_count, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: community_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.community_members (id, community_id, user_id, role, can_post, can_comment, can_invite, status, joined_at, left_at) FROM stdin;
\.


--
-- Data for Name: content_purchases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content_purchases (id, buyer_id, content_id, amount_paid, original_price, discount_applied, currency, payment_method, payment_reference, platform_fee, platform_fee_percentage, creator_revenue, access_expires_at, download_count, max_downloads, last_accessed, status, refund_reason, refunded_at, created_at) FROM stdin;
\.


--
-- Data for Name: content_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content_reviews (id, content_id, buyer_id, purchase_id, rating, comment, helpful_count, unhelpful_count, is_verified_purchase, is_hidden, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: conversation_participants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversation_participants (id, conversation_id, user_id, role, status, notifications_enabled, is_pinned, last_read_at, unread_count, joined_at, left_at) FROM stdin;
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversations (id, type, name, description, avatar_url, created_by, max_participants, is_archived, last_message_id, last_message_at, last_message_preview, created_at, updated_at, initiated_by, initiated_by_premium, group_type) FROM stdin;
\.


--
-- Data for Name: couple_album_photos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.couple_album_photos (id, album_id, couple_id, uploaded_by, photo_url, thumbnail_url, caption, location, latitude, longitude, file_size, file_type, width, height, taken_at, uploaded_at) FROM stdin;
\.


--
-- Data for Name: couple_diary_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.couple_diary_entries (id, couple_id, author_id, title, content, mood, date, is_private, visible_to, photos, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: couple_game_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.couple_game_sessions (id, couple_id, game_id, status, score_user1, score_user2, current_round, total_rounds, game_data, started_at, completed_at, last_activity_at) FROM stdin;
\.


--
-- Data for Name: couple_games; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.couple_games (id, name, description, category, min_duration_minutes, max_duration_minutes, difficulty_level, is_active, created_at) FROM stdin;
69c610b1-5293-4ed8-9716-cdb8e47d0d1d	Perguntas Íntimas	Descubram mais um sobre o outro com perguntas profundas	Conhecimento	15	30	2	t	2025-07-30 02:22:36.404032+00
44deb620-a32a-47ff-a876-ec76ba6301ea	Desafio da Memória	Testem a memória sobre momentos especiais do relacionamento	Memória	10	20	3	t	2025-07-30 02:22:36.404032+00
2a630e65-b07c-452d-9ed1-ea9281e1cea4	Jogo da Sinceridade	Verdade ou consequência para casais	Diversão	20	45	2	t	2025-07-30 02:22:36.404032+00
aee7a11b-3e21-4973-9b16-7c2f7f1cf7ed	Quiz do Amor	Perguntas sobre preferências e sonhos	Conhecimento	15	25	1	t	2025-07-30 02:22:36.404032+00
a4f8d9f0-f4d2-4e7a-84fe-79f6430a7685	Caça ao Tesouro Romântico	Encontrem pistas escondidas pela casa	Aventura	30	60	4	t	2025-07-30 02:22:36.404032+00
ec528760-4825-4783-96c2-55ec963b8ef8	Planos Futuros	Conversem sobre objetivos e sonhos compartilhados	Planejamento	25	40	3	t	2025-07-30 02:22:36.404032+00
\.


--
-- Data for Name: couple_invitations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.couple_invitations (id, from_user_id, to_user_id, to_email, to_phone, message, status, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: couple_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.couple_payments (id, couple_id, payer_user_id, subscription_id, amount, currency, payment_method, provider, provider_subscription_id, status, current_period_start, current_period_end, trial_ends_at, cancelled_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: couple_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.couple_settings (id, couple_id, shared_profile, shared_stats, allow_partner_posting, auto_tag_partner, shared_calendar, notifications, privacy, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: couple_shared_albums; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.couple_shared_albums (id, couple_id, name, description, cover_image_url, is_private, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: couple_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.couple_users (id, couple_id, user_id, role, joined_at) FROM stdin;
\.


--
-- Data for Name: couples; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.couples (id, couple_name, couple_avatar_url, couple_cover_url, anniversary_date, bio, shared_album_id, shared_diary_id, shared_playlist_url, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: creator_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.creator_subscriptions (id, subscriber_id, creator_id, business_id, tier, price, billing_period, status, benefits, payment_method, last_payment_date, next_payment_date, current_period_start, current_period_end, cancelled_at, cancellation_reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: credit_costs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credit_costs (id, action_type, category, credit_cost, unit, is_active, min_purchase, max_purchase, name, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: credit_packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credit_packages (id, name, credits, bonus_credits, price, is_active, is_promotional, valid_until, description, features, display_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: credit_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credit_transactions (id, business_id, type, amount, balance_before, balance_after, description, reference_id, reference_type, package_id, payment_method, payment_amount, payment_status, payment_reference, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: dating_matches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dating_matches (id, user1_id, user2_id, status, match_type, last_interaction, total_messages, conversation_id, unmatched_by, unmatched_at, unmatch_reason, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: dating_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dating_profiles (id, user_id, is_active, visibility, last_active, preferences, bio, prompts, photos, photo_verified, photo_verified_at, current_location, current_location_name, passport_location, passport_location_name, daily_likes_limit, daily_likes_used, daily_super_likes_limit, daily_super_likes_used, daily_rewinds_limit, daily_rewinds_used, last_limit_reset, boost_active, boost_expires_at, stats, settings, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: dating_swipes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dating_swipes (id, swiper_id, swiped_id, action, shown_at, swiped_at, time_to_swipe, is_match, matched_at, match_id, swiper_location, distance_km, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: dating_top_picks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dating_top_picks (id, user_id, pick_user_id, score, reasons, is_viewed, is_swiped, swipe_action, valid_until, created_at) FROM stdin;
\.


--
-- Data for Name: event_participants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_participants (id, event_id, user_id, status, guest_count, guest_names, joined_at) FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, creator_id, title, description, cover_image_url, event_type, category, tags, start_date, end_date, timezone, is_online, location_name, location_address, latitude, longitude, online_link, max_participants, current_participants, requires_approval, allows_guests, is_paid, price, currency, visibility, min_age, max_age, gender_restriction, stats, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: financial_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.financial_reports (id, report_type, period_start, period_end, revenue, expenses, metrics, is_final, generated_by, generated_at) FROM stdin;
\.


--
-- Data for Name: follows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.follows (id, follower_id, following_id, created_at) FROM stdin;
\.


--
-- Data for Name: friends; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.friends (id, user_id, friend_id, status, created_at, accepted_at) FROM stdin;
\.


--
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.likes (id, user_id, target_id, target_type, reaction_type, created_at) FROM stdin;
\.


--
-- Data for Name: message_reactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.message_reactions (id, message_id, user_id, reaction, created_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, conversation_id, sender_id, content, type, media_urls, reply_to_id, is_edited, edited_at, is_deleted, deleted_at, delivered_at, is_read, read_count, created_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, recipient_id, sender_id, type, title, content, icon, related_data, action_url, is_read, read_at, created_at) FROM stdin;
\.


--
-- Data for Name: paid_content; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.paid_content (id, creator_id, business_id, title, slug, description, category, subcategory, tags, is_adult, preview_urls, preview_type, content_urls, content_type, duration, file_sizes, dimensions, item_count, price, original_price, currency, discount_percentage, discount_valid_until, promo_code, sales_count, total_revenue, views_count, likes_count, rating_average, rating_count, settings, is_exclusive, available_until, stock_limit, stock_sold, status, rejection_reason, meta_description, meta_keywords, published_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: payment_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_history (id, user_id, subscription_id, amount, currency, payment_method, provider, provider_payment_id, status, created_at) FROM stdin;
\.


--
-- Data for Name: poll_votes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.poll_votes (id, poll_id, user_id, option_ids, created_at) FROM stdin;
\.


--
-- Data for Name: polls; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.polls (id, creator_id, question, options, max_options, allows_multiple, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: post_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_comments (id, post_id, user_id, content, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: post_likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_likes (id, post_id, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: post_reactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_reactions (id, post_id, user_id, reaction_type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: post_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_reports (id, reporter_id, post_id, reason, description, status, reviewed_by, reviewed_at, created_at) FROM stdin;
\.


--
-- Data for Name: post_saves; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_saves (id, post_id, user_id, collection_id, saved_at, created_at) FROM stdin;
\.


--
-- Data for Name: post_shares; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_shares (id, post_id, user_id, share_type, message, shared_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.posts (id, user_id, couple_id, content, media_urls, media_types, media_thumbnails, visibility, is_premium_content, price, poll_id, location, latitude, longitude, hashtags, mentions, post_type, story_expires_at, is_event, event_id, stats, is_reported, is_hidden, report_count, created_at, updated_at, saves_count, shares_count, likes_count, comments_count, like_count, love_count, laugh_count, wow_count, sad_count, angry_count) FROM stdin;
bb50e2a1-c134-4841-ae05-5a99a81075f6	fc8a79dc-3c32-42ed-b110-889cf5119479	\N	teste	{}	{}	{}	public	f	\N	\N	\N	\N	\N	{}	{}	regular	\N	f	\N	{"likes_count": 0, "views_count": 0, "shares_count": 0, "comments_count": 0}	f	f	0	2025-08-02 07:07:23.113+00	2025-08-02 07:07:20.262976+00	0	0	0	0	0	0	0	0	0	0
b7cfa121-d35a-4317-b597-f74e34225969	13724550-d2af-40f3-9bac-38371c55717e	\N	Teste 2	{}	{}	{}	public	f	\N	\N	\N	\N	\N	{}	{}	regular	\N	f	\N	{"likes_count": 0, "views_count": 0, "shares_count": 0, "comments_count": 0}	f	f	0	2025-08-02 07:18:37.156+00	2025-08-02 07:18:34.285319+00	0	0	0	0	0	0	0	0	0	0
fb490d65-147a-4335-8823-46495b1c0a36	fc8a79dc-3c32-42ed-b110-889cf5119479	\N	Teste 3	{}	{}	{}	public	f	\N	\N	\N	\N	\N	{}	{}	regular	\N	f	\N	{"likes_count": 0, "views_count": 0, "shares_count": 0, "comments_count": 0}	f	f	0	2025-08-02 07:24:48.981+00	2025-08-02 07:24:46.09722+00	0	0	0	0	0	0	0	0	0	0
\.


--
-- Data for Name: profile_seals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profile_seals (id, name, icon_url, description, credit_cost, is_available, available_until, display_order, category, times_gifted, created_at) FROM stdin;
e8d8b7c3-e75e-449f-85d2-c86c4a4866cf	Coração de Ouro	/seals/golden-heart.svg	Para alguém especial com coração de ouro	50	t	\N	1	romantic	0	2025-07-30 05:26:19.356112+00
aebffc59-ec4a-444d-b224-de96fb67f409	Estrela Brilhante	/seals/shining-star.svg	Você é uma estrela que ilumina meu dia	30	t	\N	2	romantic	0	2025-07-30 05:26:19.356112+00
bcb4fcef-5855-4448-b4df-789bd3366714	Fogo	/seals/fire.svg	Você é puro fogo!	20	t	\N	3	fun	0	2025-07-30 05:26:19.356112+00
2e3898b9-52bd-40eb-8152-c490bf792222	Anjo	/seals/angel.svg	Meu anjo da guarda	40	t	\N	4	romantic	0	2025-07-30 05:26:19.356112+00
0735e20d-8f37-4130-af4f-dfe05a08a900	Diamante	/seals/diamond.svg	Raro e precioso como um diamante	100	t	\N	5	premium	0	2025-07-30 05:26:19.356112+00
b92205d1-946d-47b4-b6b3-d12fce140d88	Coroa	/seals/crown.svg	Realeza total	80	t	\N	6	premium	0	2025-07-30 05:26:19.356112+00
de0e8fbb-9f36-4e3c-8364-a9a646f8172c	Arco-íris	/seals/rainbow.svg	Você colore minha vida	25	t	\N	7	fun	0	2025-07-30 05:26:19.356112+00
9de8954d-0f23-414e-9bc8-d374523f0b0e	Foguete	/seals/rocket.svg	Até o infinito e além!	35	t	\N	8	fun	0	2025-07-30 05:26:19.356112+00
4436ae4f-50b5-4614-8e0e-2a0139cd8ea3	Rosa	/seals/rose.svg	Uma rosa para você	15	t	\N	9	romantic	0	2025-07-30 05:26:19.356112+00
794b71f9-3383-4af3-b8ce-71b9ba3adb7c	Troféu	/seals/trophy.svg	Você é um vencedor!	45	t	\N	10	fun	0	2025-07-30 05:26:19.356112+00
\.


--
-- Data for Name: profile_views; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profile_views (id, viewer_id, viewed_id, view_source, anonymous, created_at) FROM stdin;
\.


--
-- Data for Name: saved_collections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.saved_collections (id, user_id, name, description, is_private, posts_count, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: saved_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.saved_posts (id, user_id, post_id, folder_name, created_at) FROM stdin;
\.


--
-- Data for Name: stories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stories (id, user_id, media_url, media_type, thumbnail_url, caption, duration, width, height, file_size, is_public, is_highlighted, highlight_color, is_boosted, boost_expires_at, boost_credits_spent, boost_impressions, view_count, unique_view_count, reaction_count, reply_count, status, expires_at, created_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: story_boosts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.story_boosts (id, story_id, user_id, credits_spent, boost_duration_hours, impressions_gained, clicks_gained, profile_visits_gained, priority_score, is_active, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: story_daily_limits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.story_daily_limits (id, user_id, daily_limit, stories_posted_today, last_reset_date, created_at, updated_at) FROM stdin;
30d516d5-025a-44e7-8043-57c5993c8505	fc8a79dc-3c32-42ed-b110-889cf5119479	0	0	2025-08-02	2025-08-02 06:17:47.717892+00	2025-08-02 06:17:47.717892+00
5ef14612-ca3a-4cf0-83ba-b1c42900185a	13724550-d2af-40f3-9bac-38371c55717e	0	0	2025-08-02	2025-08-02 07:17:58.696898+00	2025-08-02 07:17:58.696898+00
\.


--
-- Data for Name: story_replies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.story_replies (id, story_id, sender_id, message, media_url, media_type, is_read, read_at, created_at) FROM stdin;
\.


--
-- Data for Name: story_views; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.story_views (id, story_id, viewer_id, viewer_type, viewed_at, view_duration, completion_rate, reaction, reacted_at, device_type, ip_address) FROM stdin;
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, user_id, plan_type, billing_period, payment_method, provider, provider_subscription_id, amount, discount_percentage, final_amount, status, trial_ends_at, current_period_start, current_period_end, cancelled_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: trending_boosts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trending_boosts (id, user_id, boost_type, credits_spent, duration_hours, impressions_gained, interactions_gained, is_active, expires_at, priority_score, created_at) FROM stdin;
\.


--
-- Data for Name: user_credit_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_credit_transactions (id, user_id, type, amount, balance_before, balance_after, reference_type, reference_id, other_user_id, payment_method, payment_amount, payment_reference, description, created_at) FROM stdin;
\.


--
-- Data for Name: user_credits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_credits (id, user_id, credit_balance, total_purchased, total_spent, total_gifted, total_received, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_profile_seals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_profile_seals (id, recipient_id, sender_id, seal_id, message, is_displayed, display_order, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: user_verifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_verifications (id, user_id, full_name, cpf, birth_date, document_type, document_number, document_front_url, document_back_url, selfie_url, face_scan_data, status, verification_score, reviewed_by, reviewer_notes, submitted_at, reviewed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, auth_id, username, email, name, first_name, last_name, bio, birth_date, gender, profile_type, location, city, uf, state, country, latitude, longitude, avatar_url, cover_url, interests, seeking, looking_for, relationship_goals, is_premium, premium_type, premium_status, premium_expires_at, stripe_customer_id, abacatepay_customer_id, is_verified, verified_at, is_active, status, role, couple_id, is_in_couple, daily_message_limit, daily_messages_sent, monthly_photo_limit, monthly_photos_uploaded, monthly_video_limit, monthly_videos_uploaded, monthly_events_created, privacy_settings, notification_settings, stats, website, social_links, last_active_at, created_at, updated_at, account_type, business_id, admin_id) FROM stdin;
fc8a79dc-3c32-42ed-b110-889cf5119479	fc8a79dc-3c32-42ed-b110-889cf5119479	eumoitinho	contato@moitinho.dev	João Vitor Moitinho	\N	\N	Founder, CEO & CTO 	2000-11-14	male	single	\N	Curitiba 	\N	\N	Brazil	\N	\N	\N	\N	{"Sexo ao ar livre","Cera quente",Algemas,Brinquedos}	{}	{couple_mf}	{Ménage,BDSM,Exibicionismo}	f	free	inactive	\N	\N	\N	f	\N	t	active	user	\N	f	0	0	3	0	0	0	0	{"show_ads": true, "show_age": true, "show_location": true, "allow_messages": "everyone", "show_last_active": true, "profile_visibility": "public", "show_online_status": true}	{"like_notifications": true, "push_notifications": true, "email_notifications": true, "event_notifications": true, "follow_notifications": true, "comment_notifications": true, "message_notifications": true}	{"posts": 0, "friends": 0, "followers": 0, "following": 0, "profile_views": 0, "likes_received": 0}	\N	{}	2025-08-02 06:17:27.479923+00	2025-08-02 06:17:30.221+00	2025-08-02 06:17:27.479923+00	personal	\N	\N
13724550-d2af-40f3-9bac-38371c55717e	13724550-d2af-40f3-9bac-38371c55717e	discretamentesua	mand.souza18@gmail.com	Amanda Aparecida de Souza 	\N	\N	A procura de algo casual 	1999-08-18	female	single	\N	Curitiba 	\N	\N	Brazil	\N	\N	https://jgvbwevezjgzsamqnitp.supabase.co/storage/v1/object/public/media/avatars/13724550-d2af-40f3-9bac-38371c55717e/avatar_1754119081199.webp	\N	{"Sexo no carro"}	{}	{single}	{"Sexo casual"}	f	free	inactive	\N	\N	\N	f	\N	t	active	user	\N	f	0	0	3	0	0	0	0	{"show_ads": true, "show_age": true, "show_location": true, "allow_messages": "everyone", "show_last_active": true, "profile_visibility": "public", "show_online_status": true}	{"like_notifications": true, "push_notifications": true, "email_notifications": true, "event_notifications": true, "follow_notifications": true, "comment_notifications": true, "message_notifications": true}	{"posts": 0, "friends": 0, "followers": 0, "following": 0, "profile_views": 0, "likes_received": 0}	\N	{}	2025-08-02 07:17:49.506502+00	2025-08-02 07:17:52.114+00	2025-08-02 07:17:59.493236+00	personal	\N	\N
\.


--
-- Data for Name: verification_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.verification_requests (id, user_id, document_type, document_front_url, document_back_url, selfie_url, verification_code, status, reviewed_by, reviewed_at, rejection_reason, notes, attempt_number, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: messages_2025_07_30; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_07_30 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_07_31; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_07_31 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_08_01; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_08_01 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_08_02; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_08_02 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_08_03; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_08_03 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_08_04; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_08_04 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_08_05; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_08_05 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-07-10 18:51:06
20211116045059	2025-07-10 18:51:09
20211116050929	2025-07-10 18:51:11
20211116051442	2025-07-10 18:51:13
20211116212300	2025-07-10 18:51:16
20211116213355	2025-07-10 18:51:18
20211116213934	2025-07-10 18:51:20
20211116214523	2025-07-10 18:51:23
20211122062447	2025-07-10 18:51:25
20211124070109	2025-07-10 18:51:27
20211202204204	2025-07-10 18:51:29
20211202204605	2025-07-10 18:51:31
20211210212804	2025-07-10 18:51:38
20211228014915	2025-07-10 18:51:40
20220107221237	2025-07-10 18:51:43
20220228202821	2025-07-10 18:51:45
20220312004840	2025-07-10 18:51:47
20220603231003	2025-07-10 18:51:50
20220603232444	2025-07-10 18:51:52
20220615214548	2025-07-10 18:51:55
20220712093339	2025-07-10 18:51:57
20220908172859	2025-07-10 18:51:59
20220916233421	2025-07-10 18:52:01
20230119133233	2025-07-10 18:52:04
20230128025114	2025-07-10 18:52:07
20230128025212	2025-07-10 18:52:09
20230227211149	2025-07-10 18:52:11
20230228184745	2025-07-10 18:52:13
20230308225145	2025-07-10 18:52:15
20230328144023	2025-07-10 18:52:17
20231018144023	2025-07-10 18:52:20
20231204144023	2025-07-10 18:52:23
20231204144024	2025-07-10 18:52:25
20231204144025	2025-07-10 18:52:28
20240108234812	2025-07-10 18:52:30
20240109165339	2025-07-10 18:52:32
20240227174441	2025-07-10 18:52:36
20240311171622	2025-07-10 18:52:39
20240321100241	2025-07-10 18:52:43
20240401105812	2025-07-10 18:52:49
20240418121054	2025-07-10 18:52:52
20240523004032	2025-07-10 18:53:00
20240618124746	2025-07-10 18:53:02
20240801235015	2025-07-10 18:53:05
20240805133720	2025-07-10 18:53:07
20240827160934	2025-07-10 18:53:09
20240919163303	2025-07-10 18:53:12
20240919163305	2025-07-10 18:53:14
20241019105805	2025-07-10 18:53:16
20241030150047	2025-07-10 18:53:24
20241108114728	2025-07-10 18:53:27
20241121104152	2025-07-10 18:53:29
20241130184212	2025-07-10 18:53:32
20241220035512	2025-07-10 18:53:34
20241220123912	2025-07-10 18:53:36
20241224161212	2025-07-10 18:53:38
20250107150512	2025-07-10 18:53:41
20250110162412	2025-07-10 18:53:43
20250123174212	2025-07-10 18:53:45
20250128220012	2025-07-10 18:53:47
20250506224012	2025-07-10 18:53:49
20250523164012	2025-07-10 18:53:51
20250714121412	2025-07-18 14:46:21
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id) FROM stdin;
midia	midia	\N	2025-07-14 01:04:29.039344+00	2025-07-14 01:04:29.039344+00	f	f	52428800	\N	\N
avatars	avatars	\N	2025-07-15 00:17:05.184326+00	2025-07-15 00:17:05.184326+00	t	f	5242880	{image/jpeg,image/png,image/gif,image/webp}	\N
covers	covers	\N	2025-07-15 00:21:10.745881+00	2025-07-15 00:21:10.745881+00	t	f	10485760	{image/jpeg,image/png,image/gif,image/webp}	\N
messages	messages	\N	2025-07-30 00:36:00.984251+00	2025-07-30 00:36:00.984251+00	f	f	\N	\N	\N
verification-documents	verification-documents	\N	2025-07-30 06:03:52.538294+00	2025-07-30 06:03:52.538294+00	f	f	\N	\N	\N
media	media	\N	2025-07-25 17:53:51.311835+00	2025-07-25 17:53:51.311835+00	t	f	52428800	{image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,audio/mp3,audio/wav,audio/ogg}	\N
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-07-10 18:51:04.900546
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-07-10 18:51:04.916438
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-07-10 18:51:04.945468
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-07-10 18:51:05.008619
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-07-10 18:51:05.023829
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-07-10 18:51:05.029942
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-07-10 18:51:05.037517
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-07-10 18:51:05.059989
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-07-10 18:51:05.067404
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-07-10 18:51:05.081829
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-07-10 18:51:05.089406
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-07-10 18:51:05.096289
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-07-10 18:51:05.107675
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-07-10 18:51:05.127421
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-07-10 18:51:05.135317
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-07-10 18:51:05.156853
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-07-10 18:51:05.166457
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-07-10 18:51:05.172722
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-07-10 18:51:05.196947
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-07-10 18:51:05.207414
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-07-10 18:51:05.216729
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-07-10 18:51:05.225243
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-07-10 18:51:05.242461
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-07-10 18:51:05.255775
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-07-10 18:51:05.275824
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-07-10 18:51:05.285646
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
e989dbd0-ad25-40fa-99b9-8d66589a86f3	media	images/1753474157629-p9f8b5.jpg	\N	2025-07-25 20:09:17.727256+00	2025-07-25 20:09:17.727256+00	2025-07-25 20:09:17.727256+00	{"eTag": "\\"f18541c3ca6e9ba4088881331ef64b14\\"", "size": 214358, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-25T20:09:18.000Z", "contentLength": 214358, "httpStatusCode": 200}	660f7700-8f69-4df4-a76e-47554fca5e07	\N	{}
59d766d7-0500-49e5-8c27-62bb6de5e7be	media	images/1753557230954-afhzpo.jpeg	\N	2025-07-26 19:13:51.069275+00	2025-07-26 19:13:51.069275+00	2025-07-26 19:13:51.069275+00	{"eTag": "\\"aaca98fc68dbebf80fac5ca85a96216a\\"", "size": 161709, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-26T19:13:51.000Z", "contentLength": 161709, "httpStatusCode": 200}	35729e78-cfb6-48b9-9a88-456a7e7469fb	\N	{}
f179c0ed-f7ed-4487-a33c-62ad73a9d95d	media	images/1753558249326-d9ntu7.jpg	\N	2025-07-26 19:30:49.960663+00	2025-07-26 19:30:49.960663+00	2025-07-26 19:30:49.960663+00	{"eTag": "\\"f2c596311479a90ec8a52c2ec3326f40\\"", "size": 371393, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-26T19:30:50.000Z", "contentLength": 371393, "httpStatusCode": 200}	561302a2-b4c3-4b62-82d4-a67461efc440	\N	{}
22c32e31-0bd1-48b6-a185-ed0c5bb1905a	media	avatars/13724550-d2af-40f3-9bac-38371c55717e/avatar_1754119081199.webp	13724550-d2af-40f3-9bac-38371c55717e	2025-08-02 07:17:59.27738+00	2025-08-02 07:17:59.27738+00	2025-08-02 07:17:59.27738+00	{"eTag": "\\"07fe00cb20928e145d29eced3ec8e657\\"", "size": 81702, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2025-08-02T07:18:00.000Z", "contentLength": 81702, "httpStatusCode": 200}	3e9e7bb6-7f25-4433-9ab1-1af045e985fb	13724550-d2af-40f3-9bac-38371c55717e	{}
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: supabase_migrations; Owner: postgres
--

COPY supabase_migrations.schema_migrations (version, statements, name) FROM stdin;
20250118	{"-- Adicionar coluna is_edited à tabela comments se não existir\r\nDO $$\r\nBEGIN\r\n    IF NOT EXISTS (\r\n        SELECT 1\r\n        FROM information_schema.columns\r\n        WHERE table_schema = 'public'\r\n        AND table_name = 'comments'\r\n        AND column_name = 'is_edited'\r\n    ) THEN\r\n        ALTER TABLE public.comments\r\n        ADD COLUMN is_edited BOOLEAN DEFAULT FALSE;\r\n    END IF;\r\nEND $$","-- Criar índice para melhor performance se ainda não existir\r\nDO $$\r\nBEGIN\r\n    IF NOT EXISTS (\r\n        SELECT 1\r\n        FROM pg_indexes\r\n        WHERE schemaname = 'public'\r\n        AND tablename = 'comments'\r\n        AND indexname = 'idx_comments_post_id'\r\n    ) THEN\r\n        CREATE INDEX idx_comments_post_id ON public.comments(post_id);\r\n    END IF;\r\nEND $$","-- Criar índice para comentários do usuário se ainda não existir\r\nDO $$\r\nBEGIN\r\n    IF NOT EXISTS (\r\n        SELECT 1\r\n        FROM pg_indexes\r\n        WHERE schemaname = 'public'\r\n        AND tablename = 'comments'\r\n        AND indexname = 'idx_comments_user_id'\r\n    ) THEN\r\n        CREATE INDEX idx_comments_user_id ON public.comments(user_id);\r\n    END IF;\r\nEND $$"}	add_is_edited_to_comments
20250117	{"-- Fix notification system schema to match the application code\r\n-- This migration fixes the schema discrepancies between database and application\r\n\r\n-- 1. Add missing sender_id column to notifications table\r\nALTER TABLE notifications \r\nADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL","-- 2. Add missing content column (alias for message for backward compatibility)\r\nALTER TABLE notifications \r\nADD COLUMN IF NOT EXISTS content TEXT","-- 3. Update existing notifications to populate content field (skip if message column doesn't exist)\r\nDO $$\r\nBEGIN\r\n    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'message') THEN\r\n        UPDATE notifications \r\n        SET content = message \r\n        WHERE content IS NULL AND message IS NOT NULL;\r\n    END IF;\r\nEND $$","-- 4. Create index for sender_id for better performance\r\nCREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications(sender_id)","-- 5. Update the notification creation function to include sender_id\r\nCREATE OR REPLACE FUNCTION create_notification(\r\n    p_user_id UUID,\r\n    p_type VARCHAR(50),\r\n    p_title VARCHAR(255),\r\n    p_message TEXT,\r\n    p_data JSONB DEFAULT '{}',\r\n    p_sender_id UUID DEFAULT NULL\r\n) RETURNS UUID AS $$\r\nDECLARE\r\n    notification_id UUID;\r\n    user_settings RECORD;\r\nBEGIN\r\n    -- Verificar se o usuário existe\r\n    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN\r\n        RAISE EXCEPTION 'Usuário não encontrado: %', p_user_id;\r\n    END IF;\r\n    \r\n    -- Verificar configurações do usuário\r\n    SELECT * INTO user_settings \r\n    FROM notification_settings \r\n    WHERE user_id = p_user_id;\r\n    \r\n    -- Se não existir configuração, criar padrão\r\n    IF user_settings IS NULL THEN\r\n        INSERT INTO notification_settings (user_id)\r\n        VALUES (p_user_id);\r\n        user_settings.in_app_notifications := TRUE;\r\n    END IF;\r\n    \r\n    -- Só criar notificação se o usuário permitir\r\n    IF user_settings.in_app_notifications THEN\r\n        INSERT INTO notifications (user_id, type, title, message, content, data, sender_id)\r\n        VALUES (p_user_id, p_type, p_title, p_message, p_message, p_data, p_sender_id)\r\n        RETURNING id INTO notification_id;\r\n        \r\n        RETURN notification_id;\r\n    ELSE\r\n        RETURN NULL;\r\n    END IF;\r\nEND;\r\n$$ LANGUAGE plpgsql SECURITY DEFINER","-- 6. Update notification functions to include sender_id\r\nCREATE OR REPLACE FUNCTION notify_new_like(\r\n    p_liker_id UUID,\r\n    p_post_owner_id UUID,\r\n    p_post_id UUID\r\n) RETURNS VOID AS $$\r\nDECLARE\r\n    liker_name TEXT;\r\n    post_title TEXT;\r\nBEGIN\r\n    -- Obter nome de quem deu like\r\n    SELECT name INTO liker_name \r\n    FROM users \r\n    WHERE id = p_liker_id;\r\n    \r\n    -- Obter título do post\r\n    SELECT title INTO post_title \r\n    FROM posts \r\n    WHERE id = p_post_id;\r\n    \r\n    -- Criar notificação com sender_id\r\n    PERFORM create_notification(\r\n        p_post_owner_id,\r\n        'like',\r\n        'Novo like',\r\n        liker_name || ' curtiu seu post',\r\n        jsonb_build_object(\r\n            'liker_id', p_liker_id,\r\n            'liker_name', liker_name,\r\n            'post_id', p_post_id,\r\n            'post_title', post_title\r\n        ),\r\n        p_liker_id -- sender_id\r\n    );\r\nEND;\r\n$$ LANGUAGE plpgsql SECURITY DEFINER","-- 7. Update comment notification function\r\nCREATE OR REPLACE FUNCTION notify_new_comment(\r\n    p_commenter_id UUID,\r\n    p_post_owner_id UUID,\r\n    p_post_id UUID,\r\n    p_comment_text TEXT\r\n) RETURNS VOID AS $$\r\nDECLARE\r\n    commenter_name TEXT;\r\n    comment_preview TEXT;\r\nBEGIN\r\n    -- Obter nome de quem comentou\r\n    SELECT name INTO commenter_name \r\n    FROM users \r\n    WHERE id = p_commenter_id;\r\n    \r\n    -- Criar preview do comentário\r\n    comment_preview := LEFT(p_comment_text, 50);\r\n    IF LENGTH(p_comment_text) > 50 THEN\r\n        comment_preview := comment_preview || '...';\r\n    END IF;\r\n    \r\n    -- Criar notificação com sender_id\r\n    PERFORM create_notification(\r\n        p_post_owner_id,\r\n        'comment',\r\n        'Novo comentário',\r\n        commenter_name || ' comentou: ' || comment_preview,\r\n        jsonb_build_object(\r\n            'commenter_id', p_commenter_id,\r\n            'commenter_name', commenter_name,\r\n            'post_id', p_post_id,\r\n            'comment_preview', comment_preview\r\n        ),\r\n        p_commenter_id -- sender_id\r\n    );\r\nEND;\r\n$$ LANGUAGE plpgsql SECURITY DEFINER","-- 8. Update follow notification function\r\nCREATE OR REPLACE FUNCTION notify_new_follower(\r\n    p_follower_id UUID,\r\n    p_followed_id UUID\r\n) RETURNS VOID AS $$\r\nDECLARE\r\n    follower_name TEXT;\r\nBEGIN\r\n    -- Obter nome do seguidor\r\n    SELECT name INTO follower_name \r\n    FROM users \r\n    WHERE id = p_follower_id;\r\n    \r\n    -- Criar notificação com sender_id\r\n    PERFORM create_notification(\r\n        p_followed_id,\r\n        'follow',\r\n        'Novo seguidor',\r\n        follower_name || ' começou a seguir você',\r\n        jsonb_build_object(\r\n            'follower_id', p_follower_id,\r\n            'follower_name', follower_name\r\n        ),\r\n        p_follower_id -- sender_id\r\n    );\r\nEND;\r\n$$ LANGUAGE plpgsql SECURITY DEFINER","-- 9. Update message notification function\r\nCREATE OR REPLACE FUNCTION notify_new_message(\r\n    p_sender_id UUID,\r\n    p_receiver_id UUID,\r\n    p_message_text TEXT\r\n) RETURNS VOID AS $$\r\nDECLARE\r\n    sender_name TEXT;\r\n    message_preview TEXT;\r\nBEGIN\r\n    -- Obter nome do remetente\r\n    SELECT name INTO sender_name \r\n    FROM users \r\n    WHERE id = p_sender_id;\r\n    \r\n    -- Criar preview da mensagem\r\n    message_preview := LEFT(p_message_text, 50);\r\n    IF LENGTH(p_message_text) > 50 THEN\r\n        message_preview := message_preview || '...';\r\n    END IF;\r\n    \r\n    -- Criar notificação com sender_id\r\n    PERFORM create_notification(\r\n        p_receiver_id,\r\n        'message',\r\n        'Nova mensagem de ' || sender_name,\r\n        message_preview,\r\n        jsonb_build_object(\r\n            'sender_id', p_sender_id,\r\n            'sender_name', sender_name,\r\n            'message_preview', message_preview\r\n        ),\r\n        p_sender_id -- sender_id\r\n    );\r\nEND;\r\n$$ LANGUAGE plpgsql SECURITY DEFINER","-- 10. Update mention notification function\r\nCREATE OR REPLACE FUNCTION notify_mention(\r\n    p_mentioner_id UUID,\r\n    p_mentioned_id UUID,\r\n    p_context TEXT,\r\n    p_post_id UUID DEFAULT NULL\r\n) RETURNS VOID AS $$\r\nDECLARE\r\n    mentioner_name TEXT;\r\nBEGIN\r\n    -- Obter nome de quem mencionou\r\n    SELECT name INTO mentioner_name \r\n    FROM users \r\n    WHERE id = p_mentioner_id;\r\n    \r\n    -- Criar notificação com sender_id\r\n    PERFORM create_notification(\r\n        p_mentioned_id,\r\n        'mention',\r\n        'Você foi mencionado',\r\n        mentioner_name || ' mencionou você',\r\n        jsonb_build_object(\r\n            'mentioner_id', p_mentioner_id,\r\n            'mentioner_name', mentioner_name,\r\n            'context', p_context,\r\n            'post_id', p_post_id\r\n        ),\r\n        p_mentioner_id -- sender_id\r\n    );\r\nEND;\r\n$$ LANGUAGE plpgsql SECURITY DEFINER","-- 11. Create test notification function\r\nCREATE OR REPLACE FUNCTION create_test_notification(p_user_id UUID)\r\nRETURNS UUID AS $$\r\nDECLARE\r\n    notification_id UUID;\r\nBEGIN\r\n    SELECT create_notification(\r\n        p_user_id,\r\n        'system',\r\n        'Notificação de Teste',\r\n        'Esta é uma notificação de teste do sistema OpenLove',\r\n        jsonb_build_object(\r\n            'test', true,\r\n            'timestamp', NOW()\r\n        ),\r\n        NULL -- system notification, no sender\r\n    ) INTO notification_id;\r\n    \r\n    RETURN notification_id;\r\nEND;\r\n$$ LANGUAGE plpgsql SECURITY DEFINER","-- 12. Update RLS policies\r\nDROP POLICY IF EXISTS \\"Users can view their own notifications\\" ON notifications","CREATE POLICY \\"Users can view their own notifications\\" ON notifications\r\n    FOR SELECT USING (auth.uid() = user_id)","DROP POLICY IF EXISTS \\"Users can update their own notifications\\" ON notifications","CREATE POLICY \\"Users can update their own notifications\\" ON notifications\r\n    FOR UPDATE USING (auth.uid() = user_id)","DROP POLICY IF EXISTS \\"System can insert notifications\\" ON notifications","CREATE POLICY \\"System can insert notifications\\" ON notifications\r\n    FOR INSERT WITH CHECK (true)","-- 13. Verify schema\r\nSELECT \r\n    column_name,\r\n    data_type,\r\n    is_nullable\r\nFROM information_schema.columns \r\nWHERE table_name = 'notifications' \r\nAND column_name IN ('id', 'user_id', 'sender_id', 'type', 'title', 'message', 'content', 'data', 'is_read', 'created_at')"}	fix_notifications_schema
20250119	{"-- Limpeza completa de triggers problemáticos na tabela comments\r\nDO $$\r\nDECLARE\r\n    trigger_record RECORD;\r\nBEGIN\r\n    -- Remover todos os triggers da tabela comments\r\n    FOR trigger_record IN \r\n        SELECT tgname \r\n        FROM pg_trigger t\r\n        JOIN pg_class c ON t.tgrelid = c.oid\r\n        WHERE c.relname = 'comments' AND NOT t.tgisinternal\r\n    LOOP\r\n        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.tgname || ' ON comments CASCADE';\r\n    END LOOP;\r\n    \r\n    -- Remover todas as funções que podem estar causando problemas\r\n    DROP FUNCTION IF EXISTS create_notification() CASCADE;\r\n    DROP FUNCTION IF EXISTS create_smart_notification() CASCADE;\r\n    DROP FUNCTION IF EXISTS update_post_stats() CASCADE;\r\n    DROP FUNCTION IF EXISTS update_comment_stats() CASCADE;\r\n    DROP FUNCTION IF EXISTS create_mention_notifications() CASCADE;\r\n    \r\n    -- Recriar apenas a função essencial\r\n    CREATE OR REPLACE FUNCTION update_updated_at_column()\r\n    RETURNS TRIGGER AS $func$\r\n    BEGIN\r\n        NEW.updated_at = NOW();\r\n        RETURN NEW;\r\n    END;\r\n    $func$ language 'plpgsql';\r\n    \r\n    -- Recriar apenas o trigger essencial\r\n    CREATE TRIGGER update_comments_updated_at \r\n    BEFORE UPDATE ON comments \r\n    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();\r\n    \r\nEND $$"}	001_fix_comment_triggers
\.


--
-- Data for Name: seed_files; Type: TABLE DATA; Schema: supabase_migrations; Owner: postgres
--

COPY supabase_migrations.seed_files (path, hash) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 374, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ad_campaigns ad_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_campaigns
    ADD CONSTRAINT ad_campaigns_pkey PRIMARY KEY (id);


--
-- Name: ad_impressions ad_impressions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_impressions
    ADD CONSTRAINT ad_impressions_pkey PRIMARY KEY (id);


--
-- Name: ad_interactions ad_interactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_interactions
    ADD CONSTRAINT ad_interactions_pkey PRIMARY KEY (id);


--
-- Name: admin_action_logs admin_action_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_action_logs
    ADD CONSTRAINT admin_action_logs_pkey PRIMARY KEY (id);


--
-- Name: admin_metrics admin_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_metrics
    ADD CONSTRAINT admin_metrics_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_employee_id_key UNIQUE (employee_id);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_user_id_key UNIQUE (user_id);


--
-- Name: advertisements advertisements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertisements
    ADD CONSTRAINT advertisements_pkey PRIMARY KEY (id);


--
-- Name: blocked_users blocked_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked_users
    ADD CONSTRAINT blocked_users_pkey PRIMARY KEY (id);


--
-- Name: business_ads business_ads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_ads
    ADD CONSTRAINT business_ads_pkey PRIMARY KEY (id);


--
-- Name: business_team business_team_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_team
    ADD CONSTRAINT business_team_pkey PRIMARY KEY (id);


--
-- Name: businesses businesses_cnpj_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_cnpj_key UNIQUE (cnpj);


--
-- Name: businesses businesses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_pkey PRIMARY KEY (id);


--
-- Name: businesses businesses_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_slug_key UNIQUE (slug);


--
-- Name: calls calls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calls
    ADD CONSTRAINT calls_pkey PRIMARY KEY (id);


--
-- Name: comment_likes comment_likes_comment_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT comment_likes_comment_id_user_id_key UNIQUE (comment_id, user_id);


--
-- Name: comment_likes comment_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT comment_likes_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: communities communities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_pkey PRIMARY KEY (id);


--
-- Name: community_members community_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.community_members
    ADD CONSTRAINT community_members_pkey PRIMARY KEY (id);


--
-- Name: content_purchases content_purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_purchases
    ADD CONSTRAINT content_purchases_pkey PRIMARY KEY (id);


--
-- Name: content_reviews content_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_reviews
    ADD CONSTRAINT content_reviews_pkey PRIMARY KEY (id);


--
-- Name: conversation_participants conversation_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: couple_album_photos couple_album_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_album_photos
    ADD CONSTRAINT couple_album_photos_pkey PRIMARY KEY (id);


--
-- Name: couple_diary_entries couple_diary_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_diary_entries
    ADD CONSTRAINT couple_diary_entries_pkey PRIMARY KEY (id);


--
-- Name: couple_game_sessions couple_game_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_game_sessions
    ADD CONSTRAINT couple_game_sessions_pkey PRIMARY KEY (id);


--
-- Name: couple_games couple_games_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_games
    ADD CONSTRAINT couple_games_pkey PRIMARY KEY (id);


--
-- Name: couple_invitations couple_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_invitations
    ADD CONSTRAINT couple_invitations_pkey PRIMARY KEY (id);


--
-- Name: couple_payments couple_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_payments
    ADD CONSTRAINT couple_payments_pkey PRIMARY KEY (id);


--
-- Name: couple_settings couple_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_settings
    ADD CONSTRAINT couple_settings_pkey PRIMARY KEY (id);


--
-- Name: couple_shared_albums couple_shared_albums_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_shared_albums
    ADD CONSTRAINT couple_shared_albums_pkey PRIMARY KEY (id);


--
-- Name: couple_users couple_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_users
    ADD CONSTRAINT couple_users_pkey PRIMARY KEY (id);


--
-- Name: couples couples_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couples
    ADD CONSTRAINT couples_pkey PRIMARY KEY (id);


--
-- Name: creator_subscriptions creator_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creator_subscriptions
    ADD CONSTRAINT creator_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: credit_costs credit_costs_action_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_costs
    ADD CONSTRAINT credit_costs_action_type_key UNIQUE (action_type);


--
-- Name: credit_costs credit_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_costs
    ADD CONSTRAINT credit_costs_pkey PRIMARY KEY (id);


--
-- Name: credit_packages credit_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_packages
    ADD CONSTRAINT credit_packages_pkey PRIMARY KEY (id);


--
-- Name: credit_transactions credit_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_transactions
    ADD CONSTRAINT credit_transactions_pkey PRIMARY KEY (id);


--
-- Name: dating_matches dating_matches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dating_matches
    ADD CONSTRAINT dating_matches_pkey PRIMARY KEY (id);


--
-- Name: dating_profiles dating_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dating_profiles
    ADD CONSTRAINT dating_profiles_pkey PRIMARY KEY (id);


--
-- Name: dating_profiles dating_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dating_profiles
    ADD CONSTRAINT dating_profiles_user_id_key UNIQUE (user_id);


--
-- Name: dating_swipes dating_swipes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dating_swipes
    ADD CONSTRAINT dating_swipes_pkey PRIMARY KEY (id);


--
-- Name: dating_top_picks dating_top_picks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dating_top_picks
    ADD CONSTRAINT dating_top_picks_pkey PRIMARY KEY (id);


--
-- Name: event_participants event_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_participants
    ADD CONSTRAINT event_participants_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: financial_reports financial_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_reports
    ADD CONSTRAINT financial_reports_pkey PRIMARY KEY (id);


--
-- Name: follows follows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_pkey PRIMARY KEY (id);


--
-- Name: friends friends_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_pkey PRIMARY KEY (id);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (id);


--
-- Name: message_reactions message_reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_reactions
    ADD CONSTRAINT message_reactions_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: paid_content paid_content_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paid_content
    ADD CONSTRAINT paid_content_pkey PRIMARY KEY (id);


--
-- Name: paid_content paid_content_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paid_content
    ADD CONSTRAINT paid_content_slug_key UNIQUE (slug);


--
-- Name: payment_history payment_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT payment_history_pkey PRIMARY KEY (id);


--
-- Name: poll_votes poll_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poll_votes
    ADD CONSTRAINT poll_votes_pkey PRIMARY KEY (id);


--
-- Name: polls polls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.polls
    ADD CONSTRAINT polls_pkey PRIMARY KEY (id);


--
-- Name: post_comments post_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_comments
    ADD CONSTRAINT post_comments_pkey PRIMARY KEY (id);


--
-- Name: post_likes post_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_pkey PRIMARY KEY (id);


--
-- Name: post_likes post_likes_post_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_post_id_user_id_key UNIQUE (post_id, user_id);


--
-- Name: post_reactions post_reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_reactions
    ADD CONSTRAINT post_reactions_pkey PRIMARY KEY (id);


--
-- Name: post_reactions post_reactions_post_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_reactions
    ADD CONSTRAINT post_reactions_post_id_user_id_key UNIQUE (post_id, user_id);


--
-- Name: post_reports post_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_reports
    ADD CONSTRAINT post_reports_pkey PRIMARY KEY (id);


--
-- Name: post_saves post_saves_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_saves
    ADD CONSTRAINT post_saves_pkey PRIMARY KEY (id);


--
-- Name: post_saves post_saves_post_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_saves
    ADD CONSTRAINT post_saves_post_id_user_id_key UNIQUE (post_id, user_id);


--
-- Name: post_shares post_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_shares
    ADD CONSTRAINT post_shares_pkey PRIMARY KEY (id);


--
-- Name: post_shares post_shares_post_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_shares
    ADD CONSTRAINT post_shares_post_id_user_id_key UNIQUE (post_id, user_id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: profile_seals profile_seals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_seals
    ADD CONSTRAINT profile_seals_pkey PRIMARY KEY (id);


--
-- Name: profile_views profile_views_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_views
    ADD CONSTRAINT profile_views_pkey PRIMARY KEY (id);


--
-- Name: saved_collections saved_collections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_collections
    ADD CONSTRAINT saved_collections_pkey PRIMARY KEY (id);


--
-- Name: saved_collections saved_collections_user_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_collections
    ADD CONSTRAINT saved_collections_user_id_name_key UNIQUE (user_id, name);


--
-- Name: saved_posts saved_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_posts
    ADD CONSTRAINT saved_posts_pkey PRIMARY KEY (id);


--
-- Name: stories stories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_pkey PRIMARY KEY (id);


--
-- Name: story_boosts story_boosts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_boosts
    ADD CONSTRAINT story_boosts_pkey PRIMARY KEY (id);


--
-- Name: story_daily_limits story_daily_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_daily_limits
    ADD CONSTRAINT story_daily_limits_pkey PRIMARY KEY (id);


--
-- Name: story_daily_limits story_daily_limits_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_daily_limits
    ADD CONSTRAINT story_daily_limits_user_id_key UNIQUE (user_id);


--
-- Name: story_replies story_replies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_replies
    ADD CONSTRAINT story_replies_pkey PRIMARY KEY (id);


--
-- Name: story_views story_views_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_views
    ADD CONSTRAINT story_views_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: trending_boosts trending_boosts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trending_boosts
    ADD CONSTRAINT trending_boosts_pkey PRIMARY KEY (id);


--
-- Name: blocked_users unique_block; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked_users
    ADD CONSTRAINT unique_block UNIQUE (blocker_id, blocked_id);


--
-- Name: business_team unique_business_team_member; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_team
    ADD CONSTRAINT unique_business_team_member UNIQUE (business_id, user_id);


--
-- Name: content_purchases unique_content_purchase; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_purchases
    ADD CONSTRAINT unique_content_purchase UNIQUE (buyer_id, content_id);


--
-- Name: content_reviews unique_content_review; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_reviews
    ADD CONSTRAINT unique_content_review UNIQUE (content_id, buyer_id);


--
-- Name: couple_settings unique_couple_settings; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_settings
    ADD CONSTRAINT unique_couple_settings UNIQUE (couple_id);


--
-- Name: couple_users unique_couple_user; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_users
    ADD CONSTRAINT unique_couple_user UNIQUE (couple_id, user_id);


--
-- Name: creator_subscriptions unique_creator_subscription; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creator_subscriptions
    ADD CONSTRAINT unique_creator_subscription UNIQUE (subscriber_id, creator_id);


--
-- Name: event_participants unique_event_participant; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_participants
    ADD CONSTRAINT unique_event_participant UNIQUE (event_id, user_id);


--
-- Name: follows unique_follow; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT unique_follow UNIQUE (follower_id, following_id);


--
-- Name: friends unique_friendship; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT unique_friendship UNIQUE (user_id, friend_id);


--
-- Name: likes unique_like; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT unique_like UNIQUE (user_id, target_id, target_type);


--
-- Name: dating_matches unique_match; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dating_matches
    ADD CONSTRAINT unique_match UNIQUE (user1_id, user2_id);


--
-- Name: community_members unique_member; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.community_members
    ADD CONSTRAINT unique_member UNIQUE (community_id, user_id);


--
-- Name: message_reactions unique_message_reaction; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_reactions
    ADD CONSTRAINT unique_message_reaction UNIQUE (message_id, user_id, reaction);


--
-- Name: admin_metrics unique_metric_period; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_metrics
    ADD CONSTRAINT unique_metric_period UNIQUE (metric_date, metric_hour);


--
-- Name: conversation_participants unique_participant; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT unique_participant UNIQUE (conversation_id, user_id);


--
-- Name: couple_invitations unique_pending_invitation; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_invitations
    ADD CONSTRAINT unique_pending_invitation UNIQUE (from_user_id, to_user_id, status) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: poll_votes unique_poll_vote; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poll_votes
    ADD CONSTRAINT unique_poll_vote UNIQUE (poll_id, user_id);


--
-- Name: couple_users unique_primary_role_per_couple; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_users
    ADD CONSTRAINT unique_primary_role_per_couple UNIQUE (couple_id, role) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: saved_posts unique_saved_post; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_posts
    ADD CONSTRAINT unique_saved_post UNIQUE (user_id, post_id);


--
-- Name: story_views unique_story_view; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_views
    ADD CONSTRAINT unique_story_view UNIQUE (story_id, viewer_id);


--
-- Name: dating_swipes unique_swipe; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dating_swipes
    ADD CONSTRAINT unique_swipe UNIQUE (swiper_id, swiped_id);


--
-- Name: user_credit_transactions user_credit_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_credit_transactions
    ADD CONSTRAINT user_credit_transactions_pkey PRIMARY KEY (id);


--
-- Name: user_credits user_credits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_credits
    ADD CONSTRAINT user_credits_pkey PRIMARY KEY (id);


--
-- Name: user_credits user_credits_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_credits
    ADD CONSTRAINT user_credits_user_id_key UNIQUE (user_id);


--
-- Name: user_profile_seals user_profile_seals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile_seals
    ADD CONSTRAINT user_profile_seals_pkey PRIMARY KEY (id);


--
-- Name: user_verifications user_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_verifications
    ADD CONSTRAINT user_verifications_pkey PRIMARY KEY (id);


--
-- Name: users users_auth_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_auth_id_key UNIQUE (auth_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: verification_requests verification_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_requests
    ADD CONSTRAINT verification_requests_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_07_30 messages_2025_07_30_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_07_30
    ADD CONSTRAINT messages_2025_07_30_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_07_31 messages_2025_07_31_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_07_31
    ADD CONSTRAINT messages_2025_07_31_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_01 messages_2025_08_01_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_08_01
    ADD CONSTRAINT messages_2025_08_01_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_02 messages_2025_08_02_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_08_02
    ADD CONSTRAINT messages_2025_08_02_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_03 messages_2025_08_03_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_08_03
    ADD CONSTRAINT messages_2025_08_03_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_04 messages_2025_08_04_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_08_04
    ADD CONSTRAINT messages_2025_08_04_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_05 messages_2025_08_05_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_08_05
    ADD CONSTRAINT messages_2025_08_05_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: seed_files seed_files_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.seed_files
    ADD CONSTRAINT seed_files_pkey PRIMARY KEY (path);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_ad_impressions_ad; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ad_impressions_ad ON public.ad_impressions USING btree (ad_id);


--
-- Name: idx_ad_impressions_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ad_impressions_user ON public.ad_impressions USING btree (user_id);


--
-- Name: idx_ads_by_date_range; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ads_by_date_range ON public.advertisements USING btree (starts_at, ends_at);


--
-- Name: idx_ads_by_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ads_by_status ON public.advertisements USING btree (status);


--
-- Name: idx_comment_likes_comment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comment_likes_comment_id ON public.comment_likes USING btree (comment_id);


--
-- Name: idx_comment_likes_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comment_likes_user_id ON public.comment_likes USING btree (user_id);


--
-- Name: idx_communities_search; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_communities_search ON public.communities USING gin (to_tsvector('portuguese'::regconfig, (((name)::text || ' '::text) || description)));


--
-- Name: idx_community_members_community; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_community_members_community ON public.community_members USING btree (community_id) WHERE ((status)::text = 'active'::text);


--
-- Name: idx_community_members_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_community_members_user ON public.community_members USING btree (user_id) WHERE ((status)::text = 'active'::text);


--
-- Name: idx_conversations_initiated_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_conversations_initiated_by ON public.conversations USING btree (initiated_by);


--
-- Name: idx_couple_album_photos_album; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_couple_album_photos_album ON public.couple_album_photos USING btree (album_id);


--
-- Name: idx_couple_album_photos_couple; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_couple_album_photos_couple ON public.couple_album_photos USING btree (couple_id);


--
-- Name: idx_couple_albums_couple; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_couple_albums_couple ON public.couple_shared_albums USING btree (couple_id);


--
-- Name: idx_couple_diary_author; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_couple_diary_author ON public.couple_diary_entries USING btree (author_id);


--
-- Name: idx_couple_diary_couple; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_couple_diary_couple ON public.couple_diary_entries USING btree (couple_id);


--
-- Name: idx_couple_diary_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_couple_diary_date ON public.couple_diary_entries USING btree (date DESC);


--
-- Name: idx_couple_game_sessions_couple; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_couple_game_sessions_couple ON public.couple_game_sessions USING btree (couple_id);


--
-- Name: idx_couple_game_sessions_game; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_couple_game_sessions_game ON public.couple_game_sessions USING btree (game_id);


--
-- Name: idx_couple_game_sessions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_couple_game_sessions_status ON public.couple_game_sessions USING btree (status);


--
-- Name: idx_couple_invitations_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_couple_invitations_expires ON public.couple_invitations USING btree (expires_at) WHERE ((status)::text = 'pending'::text);


--
-- Name: idx_couple_invitations_from_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_couple_invitations_from_user ON public.couple_invitations USING btree (from_user_id);


--
-- Name: idx_couple_invitations_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_couple_invitations_status ON public.couple_invitations USING btree (status);


--
-- Name: idx_couple_invitations_to_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_couple_invitations_to_user ON public.couple_invitations USING btree (to_user_id);


--
-- Name: idx_couple_payments_couple; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_couple_payments_couple ON public.couple_payments USING btree (couple_id);


--
-- Name: idx_couple_payments_payer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_couple_payments_payer ON public.couple_payments USING btree (payer_user_id);


--
-- Name: idx_couple_payments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_couple_payments_status ON public.couple_payments USING btree (status);


--
-- Name: idx_couple_users_couple; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_couple_users_couple ON public.couple_users USING btree (couple_id);


--
-- Name: idx_couple_users_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_couple_users_user ON public.couple_users USING btree (user_id);


--
-- Name: idx_credit_transactions_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_credit_transactions_user ON public.user_credit_transactions USING btree (user_id, created_at DESC);


--
-- Name: idx_event_participants_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_participants_event ON public.event_participants USING btree (event_id);


--
-- Name: idx_event_participants_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_participants_user ON public.event_participants USING btree (user_id);


--
-- Name: idx_events_by_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_by_date ON public.events USING btree (start_date);


--
-- Name: idx_events_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_location ON public.events USING btree (latitude, longitude) WHERE (is_online = false);


--
-- Name: idx_follows_follower; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_follows_follower ON public.follows USING btree (follower_id);


--
-- Name: idx_follows_following; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_follows_following ON public.follows USING btree (following_id);


--
-- Name: idx_friends_friend; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_friends_friend ON public.friends USING btree (friend_id) WHERE (status = 'accepted'::public.friend_status);


--
-- Name: idx_friends_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_friends_user ON public.friends USING btree (user_id) WHERE (status = 'accepted'::public.friend_status);


--
-- Name: idx_messages_conversation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_conversation ON public.messages USING btree (conversation_id, created_at DESC);


--
-- Name: idx_messages_sender; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_sender ON public.messages USING btree (sender_id);


--
-- Name: idx_messages_unread; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_unread ON public.messages USING btree (conversation_id) WHERE (is_read = false);


--
-- Name: idx_notifications_recipient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_recipient ON public.notifications USING btree (recipient_id, created_at DESC) WHERE (is_read = false);


--
-- Name: idx_notifications_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_type ON public.notifications USING btree (type);


--
-- Name: idx_post_comments_post_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_comments_post_id ON public.post_comments USING btree (post_id);


--
-- Name: idx_post_likes_post_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_likes_post_id ON public.post_likes USING btree (post_id);


--
-- Name: idx_post_likes_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_likes_user_id ON public.post_likes USING btree (user_id);


--
-- Name: idx_post_reactions_post_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_reactions_post_id ON public.post_reactions USING btree (post_id);


--
-- Name: idx_post_reactions_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_reactions_type ON public.post_reactions USING btree (reaction_type);


--
-- Name: idx_post_reactions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_reactions_user_id ON public.post_reactions USING btree (user_id);


--
-- Name: idx_post_saves_collection_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_saves_collection_id ON public.post_saves USING btree (collection_id);


--
-- Name: idx_post_saves_post_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_saves_post_id ON public.post_saves USING btree (post_id);


--
-- Name: idx_post_saves_saved_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_saves_saved_at ON public.post_saves USING btree (saved_at DESC);


--
-- Name: idx_post_saves_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_saves_user_id ON public.post_saves USING btree (user_id);


--
-- Name: idx_post_shares_post_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_shares_post_id ON public.post_shares USING btree (post_id);


--
-- Name: idx_post_shares_shared_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_shares_shared_at ON public.post_shares USING btree (shared_at DESC);


--
-- Name: idx_post_shares_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_shares_user_id ON public.post_shares USING btree (user_id);


--
-- Name: idx_posts_hashtags; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_posts_hashtags ON public.posts USING gin (hashtags);


--
-- Name: idx_posts_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_posts_location ON public.posts USING btree (latitude, longitude) WHERE (latitude IS NOT NULL);


--
-- Name: idx_posts_poll_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_posts_poll_id ON public.posts USING btree (poll_id);


--
-- Name: idx_posts_search; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_posts_search ON public.posts USING gin (to_tsvector('portuguese'::regconfig, content));


--
-- Name: idx_posts_timeline; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_posts_timeline ON public.posts USING btree (created_at DESC) WHERE ((visibility = 'public'::public.visibility_type) AND (post_type = 'regular'::public.post_type));


--
-- Name: idx_posts_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_posts_type ON public.posts USING btree (post_type);


--
-- Name: idx_posts_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_posts_user ON public.posts USING btree (user_id, created_at DESC);


--
-- Name: idx_profile_seals_displayed; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_profile_seals_displayed ON public.user_profile_seals USING btree (recipient_id, is_displayed, display_order);


--
-- Name: idx_saved_collections_updated_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_saved_collections_updated_at ON public.saved_collections USING btree (updated_at DESC);


--
-- Name: idx_saved_collections_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_saved_collections_user_id ON public.saved_collections USING btree (user_id);


--
-- Name: idx_stories_feed; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stories_feed ON public.stories USING btree (created_at DESC, status) WHERE (status = 'active'::public.story_status);


--
-- Name: idx_stories_user_feed; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stories_user_feed ON public.stories USING btree (user_id, created_at DESC) WHERE (status = 'active'::public.story_status);


--
-- Name: idx_story_boosts_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_story_boosts_active ON public.story_boosts USING btree (is_active, expires_at, priority_score DESC) WHERE (is_active = true);


--
-- Name: idx_story_replies_sender; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_story_replies_sender ON public.story_replies USING btree (sender_id, created_at);


--
-- Name: idx_story_replies_story; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_story_replies_story ON public.story_replies USING btree (story_id, created_at);


--
-- Name: idx_story_replies_unread; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_story_replies_unread ON public.story_replies USING btree (story_id, is_read) WHERE (is_read = false);


--
-- Name: idx_story_views_story; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_story_views_story ON public.story_views USING btree (story_id, viewed_at);


--
-- Name: idx_story_views_viewer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_story_views_viewer ON public.story_views USING btree (viewer_id, viewed_at);


--
-- Name: idx_trending_boosts_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trending_boosts_active ON public.trending_boosts USING btree (boost_type, is_active, expires_at, priority_score DESC);


--
-- Name: idx_user_credits_balance; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_credits_balance ON public.user_credits USING btree (user_id, credit_balance);


--
-- Name: idx_user_seals_recipient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_seals_recipient ON public.user_profile_seals USING btree (recipient_id, is_displayed, display_order);


--
-- Name: idx_user_verifications_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_verifications_status ON public.user_verifications USING btree (status);


--
-- Name: idx_user_verifications_submitted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_verifications_submitted_at ON public.user_verifications USING btree (submitted_at);


--
-- Name: idx_user_verifications_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_verifications_user_id ON public.user_verifications USING btree (user_id);


--
-- Name: idx_users_account_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_account_type ON public.users USING btree (account_type);


--
-- Name: idx_users_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_active ON public.users USING btree (last_active_at DESC) WHERE (is_active = true);


--
-- Name: idx_users_auth_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_auth_id ON public.users USING btree (auth_id);


--
-- Name: idx_users_business_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_business_id ON public.users USING btree (business_id);


--
-- Name: idx_users_couple; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_couple ON public.users USING btree (couple_id) WHERE (couple_id IS NOT NULL);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_location ON public.users USING btree (city, uf) WHERE (city IS NOT NULL);


--
-- Name: idx_users_premium; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_premium ON public.users USING btree (premium_type) WHERE (premium_type <> 'free'::public.premium_type);


--
-- Name: idx_users_search; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_search ON public.users USING gin (to_tsvector('portuguese'::regconfig, (((name)::text || ' '::text) || bio)));


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- Name: idx_users_verified; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_verified ON public.users USING btree (is_verified) WHERE (is_verified = true);


--
-- Name: unique_daily_pick_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_daily_pick_idx ON public.dating_top_picks USING btree (user_id, pick_user_id, public.immutable_date_extract(created_at));


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: messages_2025_07_30_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_07_30_pkey;


--
-- Name: messages_2025_07_31_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_07_31_pkey;


--
-- Name: messages_2025_08_01_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_01_pkey;


--
-- Name: messages_2025_08_02_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_02_pkey;


--
-- Name: messages_2025_08_03_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_03_pkey;


--
-- Name: messages_2025_08_04_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_04_pkey;


--
-- Name: messages_2025_08_05_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_05_pkey;


--
-- Name: messages check_message_permissions; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER check_message_permissions BEFORE INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.validate_message_permissions();


--
-- Name: stories check_story_limit_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER check_story_limit_trigger BEFORE INSERT ON public.stories FOR EACH ROW EXECUTE FUNCTION public.check_story_limit();


--
-- Name: post_reactions post_reaction_change_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER post_reaction_change_trigger AFTER INSERT OR DELETE OR UPDATE ON public.post_reactions FOR EACH ROW EXECUTE FUNCTION public.handle_post_reaction_change();


--
-- Name: post_saves post_saves_collection_count; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER post_saves_collection_count AFTER INSERT OR DELETE OR UPDATE ON public.post_saves FOR EACH ROW EXECUTE FUNCTION public.handle_post_saves_collection_count();


--
-- Name: post_shares post_shares_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER post_shares_updated_at BEFORE UPDATE ON public.post_shares FOR EACH ROW EXECUTE FUNCTION public.update_post_shares_updated_at();


--
-- Name: user_credit_transactions process_credit_transaction_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER process_credit_transaction_trigger BEFORE INSERT ON public.user_credit_transactions FOR EACH ROW EXECUTE FUNCTION public.process_credit_transaction();


--
-- Name: saved_collections saved_collections_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER saved_collections_updated_at BEFORE UPDATE ON public.saved_collections FOR EACH ROW EXECUTE FUNCTION public.update_saved_collections_updated_at();


--
-- Name: dating_swipes trigger_check_dating_limits; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_check_dating_limits BEFORE INSERT ON public.dating_swipes FOR EACH ROW EXECUTE FUNCTION public.check_dating_limits();


--
-- Name: messages trigger_check_message_limits; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_check_message_limits BEFORE INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.check_message_limits();


--
-- Name: follows trigger_check_mutual_follow; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_check_mutual_follow AFTER INSERT ON public.follows FOR EACH ROW EXECUTE FUNCTION public.check_mutual_follow();


--
-- Name: posts trigger_check_upload_limits; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_check_upload_limits BEFORE INSERT ON public.posts FOR EACH ROW EXECUTE FUNCTION public.check_upload_limits();


--
-- Name: couples trigger_create_couple_settings; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_create_couple_settings AFTER INSERT ON public.couples FOR EACH ROW EXECUTE FUNCTION public.create_couple_settings();


--
-- Name: dating_swipes trigger_create_dating_match; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_create_dating_match AFTER INSERT ON public.dating_swipes FOR EACH ROW EXECUTE FUNCTION public.create_dating_match();


--
-- Name: couples trigger_handle_couple_dissolution; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_handle_couple_dissolution BEFORE DELETE ON public.couples FOR EACH ROW EXECUTE FUNCTION public.handle_couple_dissolution();


--
-- Name: content_purchases trigger_process_content_purchase; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_process_content_purchase BEFORE INSERT ON public.content_purchases FOR EACH ROW EXECUTE FUNCTION public.process_content_purchase();


--
-- Name: users trigger_set_user_limits; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_set_user_limits BEFORE INSERT OR UPDATE OF premium_type, is_verified ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_user_limits();


--
-- Name: users trigger_sync_couple_premium; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_sync_couple_premium AFTER UPDATE OF premium_type ON public.users FOR EACH ROW WHEN ((new.couple_id IS NOT NULL)) EXECUTE FUNCTION public.sync_couple_premium();


--
-- Name: users trigger_sync_couple_premium_status; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_sync_couple_premium_status AFTER UPDATE OF premium_type, premium_status, premium_expires_at ON public.users FOR EACH ROW WHEN ((new.couple_id IS NOT NULL)) EXECUTE FUNCTION public.sync_couple_premium_status();


--
-- Name: messages trigger_update_conversation_last_message; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_conversation_last_message AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_conversation_last_message();


--
-- Name: comments trigger_update_post_comments; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_post_comments AFTER INSERT OR DELETE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_post_stats();


--
-- Name: likes trigger_update_post_likes; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_post_likes AFTER INSERT OR DELETE ON public.likes FOR EACH ROW EXECUTE FUNCTION public.update_post_stats();


--
-- Name: follows trigger_update_user_follow_stats; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_user_follow_stats AFTER INSERT OR DELETE ON public.follows FOR EACH ROW EXECUTE FUNCTION public.update_user_stats();


--
-- Name: post_saves update_collection_posts_count_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_collection_posts_count_trigger AFTER INSERT OR DELETE OR UPDATE ON public.post_saves FOR EACH ROW EXECUTE FUNCTION public.update_collection_posts_count();


--
-- Name: communities update_communities_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON public.communities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: couple_diary_entries update_couple_diary_entries_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_couple_diary_entries_updated_at BEFORE UPDATE ON public.couple_diary_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: couple_invitations update_couple_invitations_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_couple_invitations_updated_at BEFORE UPDATE ON public.couple_invitations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: couple_payments update_couple_payments_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_couple_payments_updated_at BEFORE UPDATE ON public.couple_payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: couple_settings update_couple_settings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_couple_settings_updated_at BEFORE UPDATE ON public.couple_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: couple_shared_albums update_couple_shared_albums_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_couple_shared_albums_updated_at BEFORE UPDATE ON public.couple_shared_albums FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: couples update_couples_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_couples_updated_at BEFORE UPDATE ON public.couples FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: events update_events_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: post_comments update_post_comments_count_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_post_comments_count_trigger AFTER INSERT OR DELETE ON public.post_comments FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();


--
-- Name: post_likes update_post_likes_count_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_post_likes_count_trigger AFTER INSERT OR DELETE ON public.post_likes FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();


--
-- Name: post_saves update_post_saves_count_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_post_saves_count_trigger AFTER INSERT OR DELETE ON public.post_saves FOR EACH ROW EXECUTE FUNCTION public.update_post_saves_count();


--
-- Name: post_shares update_post_shares_count_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_post_shares_count_trigger AFTER INSERT OR DELETE ON public.post_shares FOR EACH ROW EXECUTE FUNCTION public.update_post_shares_count();


--
-- Name: posts update_posts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: story_views update_story_stats_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_story_stats_trigger AFTER INSERT OR UPDATE OF reaction ON public.story_views FOR EACH ROW EXECUTE FUNCTION public.update_story_view_stats();


--
-- Name: user_verifications update_user_verifications_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_user_verifications_updated_at BEFORE UPDATE ON public.user_verifications FOR EACH ROW EXECUTE FUNCTION public.update_user_verifications_updated_at();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: ad_campaigns ad_campaigns_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_campaigns
    ADD CONSTRAINT ad_campaigns_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;


--
-- Name: ad_impressions ad_impressions_ad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_impressions
    ADD CONSTRAINT ad_impressions_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES public.advertisements(id) ON DELETE CASCADE;


--
-- Name: ad_impressions ad_impressions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_impressions
    ADD CONSTRAINT ad_impressions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: ad_interactions ad_interactions_ad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_interactions
    ADD CONSTRAINT ad_interactions_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES public.business_ads(id) ON DELETE CASCADE;


--
-- Name: ad_interactions ad_interactions_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_interactions
    ADD CONSTRAINT ad_interactions_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.ad_campaigns(id) ON DELETE CASCADE;


--
-- Name: ad_interactions ad_interactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_interactions
    ADD CONSTRAINT ad_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: admin_action_logs admin_action_logs_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_action_logs
    ADD CONSTRAINT admin_action_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admin_users(id);


--
-- Name: admin_users admin_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: advertisements advertisements_advertiser_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertisements
    ADD CONSTRAINT advertisements_advertiser_id_fkey FOREIGN KEY (advertiser_id) REFERENCES public.users(id);


--
-- Name: blocked_users blocked_users_blocked_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked_users
    ADD CONSTRAINT blocked_users_blocked_id_fkey FOREIGN KEY (blocked_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: blocked_users blocked_users_blocker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked_users
    ADD CONSTRAINT blocked_users_blocker_id_fkey FOREIGN KEY (blocker_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: business_ads business_ads_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_ads
    ADD CONSTRAINT business_ads_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;


--
-- Name: business_ads business_ads_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_ads
    ADD CONSTRAINT business_ads_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.ad_campaigns(id) ON DELETE CASCADE;


--
-- Name: business_team business_team_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_team
    ADD CONSTRAINT business_team_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;


--
-- Name: business_team business_team_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_team
    ADD CONSTRAINT business_team_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: businesses businesses_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: calls calls_caller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calls
    ADD CONSTRAINT calls_caller_id_fkey FOREIGN KEY (caller_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: calls calls_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calls
    ADD CONSTRAINT calls_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);


--
-- Name: comment_likes comment_likes_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT comment_likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: comment_likes comment_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT comment_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: comments comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.comments(id);


--
-- Name: comments comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: communities communities_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: community_members community_members_community_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.community_members
    ADD CONSTRAINT community_members_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE CASCADE;


--
-- Name: community_members community_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.community_members
    ADD CONSTRAINT community_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: content_purchases content_purchases_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_purchases
    ADD CONSTRAINT content_purchases_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: content_purchases content_purchases_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_purchases
    ADD CONSTRAINT content_purchases_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.paid_content(id) ON DELETE CASCADE;


--
-- Name: content_reviews content_reviews_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_reviews
    ADD CONSTRAINT content_reviews_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: content_reviews content_reviews_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_reviews
    ADD CONSTRAINT content_reviews_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.paid_content(id) ON DELETE CASCADE;


--
-- Name: content_reviews content_reviews_purchase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_reviews
    ADD CONSTRAINT content_reviews_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.content_purchases(id) ON DELETE CASCADE;


--
-- Name: conversation_participants conversation_participants_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: conversation_participants conversation_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: conversations conversations_initiated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_initiated_by_fkey FOREIGN KEY (initiated_by) REFERENCES public.users(id);


--
-- Name: couple_album_photos couple_album_photos_album_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_album_photos
    ADD CONSTRAINT couple_album_photos_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.couple_shared_albums(id) ON DELETE CASCADE;


--
-- Name: couple_album_photos couple_album_photos_couple_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_album_photos
    ADD CONSTRAINT couple_album_photos_couple_id_fkey FOREIGN KEY (couple_id) REFERENCES public.couples(id) ON DELETE CASCADE;


--
-- Name: couple_album_photos couple_album_photos_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_album_photos
    ADD CONSTRAINT couple_album_photos_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: couple_diary_entries couple_diary_entries_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_diary_entries
    ADD CONSTRAINT couple_diary_entries_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: couple_diary_entries couple_diary_entries_couple_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_diary_entries
    ADD CONSTRAINT couple_diary_entries_couple_id_fkey FOREIGN KEY (couple_id) REFERENCES public.couples(id) ON DELETE CASCADE;


--
-- Name: couple_game_sessions couple_game_sessions_couple_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_game_sessions
    ADD CONSTRAINT couple_game_sessions_couple_id_fkey FOREIGN KEY (couple_id) REFERENCES public.couples(id) ON DELETE CASCADE;


--
-- Name: couple_game_sessions couple_game_sessions_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_game_sessions
    ADD CONSTRAINT couple_game_sessions_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.couple_games(id) ON DELETE CASCADE;


--
-- Name: couple_invitations couple_invitations_from_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_invitations
    ADD CONSTRAINT couple_invitations_from_user_id_fkey FOREIGN KEY (from_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: couple_invitations couple_invitations_to_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_invitations
    ADD CONSTRAINT couple_invitations_to_user_id_fkey FOREIGN KEY (to_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: couple_payments couple_payments_couple_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_payments
    ADD CONSTRAINT couple_payments_couple_id_fkey FOREIGN KEY (couple_id) REFERENCES public.couples(id) ON DELETE CASCADE;


--
-- Name: couple_payments couple_payments_payer_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_payments
    ADD CONSTRAINT couple_payments_payer_user_id_fkey FOREIGN KEY (payer_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: couple_payments couple_payments_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_payments
    ADD CONSTRAINT couple_payments_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id);


--
-- Name: couple_settings couple_settings_couple_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_settings
    ADD CONSTRAINT couple_settings_couple_id_fkey FOREIGN KEY (couple_id) REFERENCES public.couples(id) ON DELETE CASCADE;


--
-- Name: couple_shared_albums couple_shared_albums_couple_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_shared_albums
    ADD CONSTRAINT couple_shared_albums_couple_id_fkey FOREIGN KEY (couple_id) REFERENCES public.couples(id) ON DELETE CASCADE;


--
-- Name: couple_shared_albums couple_shared_albums_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_shared_albums
    ADD CONSTRAINT couple_shared_albums_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: couple_users couple_users_couple_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_users
    ADD CONSTRAINT couple_users_couple_id_fkey FOREIGN KEY (couple_id) REFERENCES public.couples(id) ON DELETE CASCADE;


--
-- Name: couple_users couple_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couple_users
    ADD CONSTRAINT couple_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: creator_subscriptions creator_subscriptions_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creator_subscriptions
    ADD CONSTRAINT creator_subscriptions_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id);


--
-- Name: creator_subscriptions creator_subscriptions_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creator_subscriptions
    ADD CONSTRAINT creator_subscriptions_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: creator_subscriptions creator_subscriptions_subscriber_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creator_subscriptions
    ADD CONSTRAINT creator_subscriptions_subscriber_id_fkey FOREIGN KEY (subscriber_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: credit_transactions credit_transactions_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_transactions
    ADD CONSTRAINT credit_transactions_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;


--
-- Name: credit_transactions credit_transactions_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_transactions
    ADD CONSTRAINT credit_transactions_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.credit_packages(id);


--
-- Name: dating_matches dating_matches_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dating_matches
    ADD CONSTRAINT dating_matches_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);


--
-- Name: dating_matches dating_matches_unmatched_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dating_matches
    ADD CONSTRAINT dating_matches_unmatched_by_fkey FOREIGN KEY (unmatched_by) REFERENCES public.users(id);


--
-- Name: dating_matches dating_matches_user1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dating_matches
    ADD CONSTRAINT dating_matches_user1_id_fkey FOREIGN KEY (user1_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: dating_matches dating_matches_user2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dating_matches
    ADD CONSTRAINT dating_matches_user2_id_fkey FOREIGN KEY (user2_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: dating_profiles dating_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dating_profiles
    ADD CONSTRAINT dating_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: dating_swipes dating_swipes_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dating_swipes
    ADD CONSTRAINT dating_swipes_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.dating_matches(id);


--
-- Name: dating_swipes dating_swipes_swiped_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dating_swipes
    ADD CONSTRAINT dating_swipes_swiped_id_fkey FOREIGN KEY (swiped_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: dating_swipes dating_swipes_swiper_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dating_swipes
    ADD CONSTRAINT dating_swipes_swiper_id_fkey FOREIGN KEY (swiper_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: dating_top_picks dating_top_picks_pick_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dating_top_picks
    ADD CONSTRAINT dating_top_picks_pick_user_id_fkey FOREIGN KEY (pick_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: dating_top_picks dating_top_picks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dating_top_picks
    ADD CONSTRAINT dating_top_picks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: event_participants event_participants_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_participants
    ADD CONSTRAINT event_participants_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_participants event_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_participants
    ADD CONSTRAINT event_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: events events_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: financial_reports financial_reports_generated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_reports
    ADD CONSTRAINT financial_reports_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES public.admin_users(id);


--
-- Name: users fk_users_business; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_business FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE SET NULL;


--
-- Name: follows follows_follower_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: follows follows_following_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: friends friends_friend_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_friend_id_fkey FOREIGN KEY (friend_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: friends friends_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: likes likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: message_reactions message_reactions_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_reactions
    ADD CONSTRAINT message_reactions_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: message_reactions message_reactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_reactions
    ADD CONSTRAINT message_reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: messages messages_reply_to_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_reply_to_id_fkey FOREIGN KEY (reply_to_id) REFERENCES public.messages(id);


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: paid_content paid_content_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paid_content
    ADD CONSTRAINT paid_content_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id);


--
-- Name: paid_content paid_content_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paid_content
    ADD CONSTRAINT paid_content_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payment_history payment_history_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT payment_history_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id);


--
-- Name: payment_history payment_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT payment_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: poll_votes poll_votes_poll_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poll_votes
    ADD CONSTRAINT poll_votes_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.polls(id) ON DELETE CASCADE;


--
-- Name: poll_votes poll_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poll_votes
    ADD CONSTRAINT poll_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: polls polls_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.polls
    ADD CONSTRAINT polls_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: post_comments post_comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_comments
    ADD CONSTRAINT post_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_comments post_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_comments
    ADD CONSTRAINT post_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: post_likes post_likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_likes post_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: post_reactions post_reactions_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_reactions
    ADD CONSTRAINT post_reactions_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_reactions post_reactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_reactions
    ADD CONSTRAINT post_reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: post_reports post_reports_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_reports
    ADD CONSTRAINT post_reports_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_reports post_reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_reports
    ADD CONSTRAINT post_reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: post_reports post_reports_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_reports
    ADD CONSTRAINT post_reports_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: post_saves post_saves_collection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_saves
    ADD CONSTRAINT post_saves_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.saved_collections(id) ON DELETE SET NULL;


--
-- Name: post_saves post_saves_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_saves
    ADD CONSTRAINT post_saves_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_saves post_saves_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_saves
    ADD CONSTRAINT post_saves_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: post_shares post_shares_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_shares
    ADD CONSTRAINT post_shares_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_shares post_shares_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_shares
    ADD CONSTRAINT post_shares_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: posts posts_couple_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_couple_id_fkey FOREIGN KEY (couple_id) REFERENCES public.couples(id);


--
-- Name: posts posts_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id);


--
-- Name: posts posts_poll_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.polls(id);


--
-- Name: posts posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: profile_views profile_views_viewed_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_views
    ADD CONSTRAINT profile_views_viewed_id_fkey FOREIGN KEY (viewed_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: profile_views profile_views_viewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_views
    ADD CONSTRAINT profile_views_viewer_id_fkey FOREIGN KEY (viewer_id) REFERENCES public.users(id);


--
-- Name: saved_collections saved_collections_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_collections
    ADD CONSTRAINT saved_collections_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: saved_posts saved_posts_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_posts
    ADD CONSTRAINT saved_posts_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: saved_posts saved_posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_posts
    ADD CONSTRAINT saved_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: stories stories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: story_boosts story_boosts_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_boosts
    ADD CONSTRAINT story_boosts_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE;


--
-- Name: story_boosts story_boosts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_boosts
    ADD CONSTRAINT story_boosts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: story_daily_limits story_daily_limits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_daily_limits
    ADD CONSTRAINT story_daily_limits_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: story_replies story_replies_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_replies
    ADD CONSTRAINT story_replies_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: story_replies story_replies_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_replies
    ADD CONSTRAINT story_replies_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE;


--
-- Name: story_views story_views_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_views
    ADD CONSTRAINT story_views_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE;


--
-- Name: story_views story_views_viewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_views
    ADD CONSTRAINT story_views_viewer_id_fkey FOREIGN KEY (viewer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: trending_boosts trending_boosts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trending_boosts
    ADD CONSTRAINT trending_boosts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_credit_transactions user_credit_transactions_other_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_credit_transactions
    ADD CONSTRAINT user_credit_transactions_other_user_id_fkey FOREIGN KEY (other_user_id) REFERENCES public.users(id);


--
-- Name: user_credit_transactions user_credit_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_credit_transactions
    ADD CONSTRAINT user_credit_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_credits user_credits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_credits
    ADD CONSTRAINT user_credits_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_profile_seals user_profile_seals_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile_seals
    ADD CONSTRAINT user_profile_seals_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_profile_seals user_profile_seals_seal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile_seals
    ADD CONSTRAINT user_profile_seals_seal_id_fkey FOREIGN KEY (seal_id) REFERENCES public.profile_seals(id) ON DELETE CASCADE;


--
-- Name: user_profile_seals user_profile_seals_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile_seals
    ADD CONSTRAINT user_profile_seals_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_verifications user_verifications_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_verifications
    ADD CONSTRAINT user_verifications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: user_verifications user_verifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_verifications
    ADD CONSTRAINT user_verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_auth_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: users users_couple_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_couple_id_fkey FOREIGN KEY (couple_id) REFERENCES public.couples(id);


--
-- Name: verification_requests verification_requests_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_requests
    ADD CONSTRAINT verification_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: verification_requests verification_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_requests
    ADD CONSTRAINT verification_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: user_verifications Admins can manage all verifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage all verifications" ON public.user_verifications USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::public.user_role)))));


--
-- Name: post_comments Anyone can view comments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view comments" ON public.post_comments FOR SELECT USING (true);


--
-- Name: polls Authenticated users can create polls; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can create polls" ON public.polls FOR INSERT WITH CHECK ((auth.uid() = creator_id));


--
-- Name: poll_votes Authenticated users can vote; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can vote" ON public.poll_votes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: couple_diary_entries Authors can update their diary entries; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authors can update their diary entries" ON public.couple_diary_entries FOR UPDATE USING ((author_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))));


--
-- Name: couple_diary_entries Couple members can create diary entries; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Couple members can create diary entries" ON public.couple_diary_entries FOR INSERT WITH CHECK (((couple_id IN ( SELECT users.couple_id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))) AND (author_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid())))));


--
-- Name: couple_album_photos Couple members can manage album photos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Couple members can manage album photos" ON public.couple_album_photos USING ((couple_id IN ( SELECT users.couple_id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))));


--
-- Name: couple_game_sessions Couple members can manage game sessions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Couple members can manage game sessions" ON public.couple_game_sessions USING ((couple_id IN ( SELECT users.couple_id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))));


--
-- Name: couple_settings Couple members can manage settings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Couple members can manage settings" ON public.couple_settings USING ((couple_id IN ( SELECT users.couple_id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))));


--
-- Name: couple_shared_albums Couple members can manage shared albums; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Couple members can manage shared albums" ON public.couple_shared_albums USING ((couple_id IN ( SELECT users.couple_id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))));


--
-- Name: couple_users Couple members can view couple users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Couple members can view couple users" ON public.couple_users FOR SELECT USING ((couple_id IN ( SELECT users.couple_id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))));


--
-- Name: couple_diary_entries Couple members can view diary entries; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Couple members can view diary entries" ON public.couple_diary_entries FOR SELECT USING (((couple_id IN ( SELECT users.couple_id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))) AND (((visible_to)::text = 'both'::text) OR (((visible_to)::text = 'author_only'::text) AND (author_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid())))) OR (((visible_to)::text = 'partner_only'::text) AND (author_id <> ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid())))))));


--
-- Name: couple_payments Couple members can view payments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Couple members can view payments" ON public.couple_payments FOR SELECT USING ((couple_id IN ( SELECT users.couple_id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))));


--
-- Name: comments Create comments with verification; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Create comments with verification" ON public.comments FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = comments.user_id) AND (users.auth_id = auth.uid()) AND ((users.is_verified = true) OR (users.premium_type <> 'free'::public.premium_type))))));


--
-- Name: messages Free users can only reply; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Free users can only reply" ON public.messages FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.users u
     JOIN public.conversations c ON ((c.id = messages.conversation_id)))
  WHERE ((u.id = auth.uid()) AND ((u.premium_type <> 'free'::public.premium_type) OR ((u.premium_type = 'free'::public.premium_type) AND (c.initiated_by <> u.id) AND (c.initiated_by_premium = true)))))));


--
-- Name: conversations Only Diamond+ can create group conversations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only Diamond+ can create group conversations" ON public.conversations FOR INSERT WITH CHECK ((((type)::text = 'direct'::text) OR (((type)::text = 'group'::text) AND (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.premium_type = ANY (ARRAY['diamond'::public.premium_type, 'couple'::public.premium_type])))))) OR (((type)::text = 'group'::text) AND ((group_type)::text = ANY ((ARRAY['event'::character varying, 'community'::character varying])::text[])))));


--
-- Name: poll_votes Poll votes are viewable by everyone; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Poll votes are viewable by everyone" ON public.poll_votes FOR SELECT USING (true);


--
-- Name: polls Polls are viewable by everyone; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Polls are viewable by everyone" ON public.polls FOR SELECT USING (true);


--
-- Name: messages Send messages with limits; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Send messages with limits" ON public.messages FOR INSERT WITH CHECK (((sender_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))) AND (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = messages.sender_id) AND (users.premium_type <> 'free'::public.premium_type))))));


--
-- Name: notifications Update own notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Update own notifications" ON public.notifications FOR UPDATE USING ((recipient_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))));


--
-- Name: blocked_users Users can create blocks; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create blocks" ON public.blocked_users FOR INSERT WITH CHECK ((auth.uid() = blocker_id));


--
-- Name: saved_collections Users can create collections; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create collections" ON public.saved_collections FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: post_comments Users can create comments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create comments" ON public.post_comments FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: couple_invitations Users can create invitations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create invitations" ON public.couple_invitations FOR INSERT WITH CHECK ((from_user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))));


--
-- Name: saved_collections Users can create own collections; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create own collections" ON public.saved_collections FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: post_saves Users can create own saves; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create own saves" ON public.post_saves FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_verifications Users can create own verifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create own verifications" ON public.user_verifications FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: post_reactions Users can create reactions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create reactions" ON public.post_reactions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: post_shares Users can create shares; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create shares" ON public.post_shares FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: blocked_users Users can delete own blocks; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete own blocks" ON public.blocked_users FOR DELETE USING ((auth.uid() = blocker_id));


--
-- Name: saved_collections Users can delete own collections; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete own collections" ON public.saved_collections FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: post_comments Users can delete own comments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete own comments" ON public.post_comments FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: polls Users can delete own polls; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete own polls" ON public.polls FOR DELETE USING ((auth.uid() = creator_id));


--
-- Name: post_reactions Users can delete own reactions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete own reactions" ON public.post_reactions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: post_saves Users can delete own saves; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete own saves" ON public.post_saves FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: post_shares Users can delete own shares; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete own shares" ON public.post_shares FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: comment_likes Users can like comments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can like comments" ON public.comment_likes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: post_likes Users can like posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can like posts" ON public.post_likes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: post_saves Users can save posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can save posts" ON public.post_saves FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: post_shares Users can share posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can share posts" ON public.post_shares FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: comment_likes Users can unlike comments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can unlike comments" ON public.comment_likes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: post_likes Users can unlike posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can unlike posts" ON public.post_likes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: post_saves Users can unsave posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can unsave posts" ON public.post_saves FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: post_shares Users can unshare posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can unshare posts" ON public.post_shares FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: saved_collections Users can update own collections; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own collections" ON public.saved_collections FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: post_comments Users can update own comments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own comments" ON public.post_comments FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_verifications Users can update own pending verifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own pending verifications" ON public.user_verifications FOR UPDATE USING (((auth.uid() = user_id) AND (status = 'pending'::text)));


--
-- Name: polls Users can update own polls; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own polls" ON public.polls FOR UPDATE USING ((auth.uid() = creator_id));


--
-- Name: post_reactions Users can update own reactions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own reactions" ON public.post_reactions FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: couple_invitations Users can update their received invitations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their received invitations" ON public.couple_invitations FOR UPDATE USING (((to_user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))) OR (from_user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid())))));


--
-- Name: comment_likes Users can view comment likes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view comment likes" ON public.comment_likes FOR SELECT USING (true);


--
-- Name: couple_invitations Users can view invitations they sent or received; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view invitations they sent or received" ON public.couple_invitations FOR SELECT USING (((from_user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))) OR (to_user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))) OR ((to_email)::text = (( SELECT users.email
   FROM auth.users
  WHERE (users.id = auth.uid())))::text)));


--
-- Name: post_likes Users can view likes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view likes" ON public.post_likes FOR SELECT USING (true);


--
-- Name: blocked_users Users can view own blocks; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own blocks" ON public.blocked_users FOR SELECT USING ((auth.uid() = blocker_id));


--
-- Name: saved_collections Users can view own collections; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own collections" ON public.saved_collections FOR SELECT USING (((auth.uid() = user_id) OR (is_private = false)));


--
-- Name: post_saves Users can view own saves; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own saves" ON public.post_saves FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: post_shares Users can view own shares; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own shares" ON public.post_shares FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_verifications Users can view own verifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own verifications" ON public.user_verifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: post_shares Users can view public shares; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view public shares" ON public.post_shares FOR SELECT USING (((share_type)::text = 'public'::text));


--
-- Name: post_reactions Users can view reactions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view reactions" ON public.post_reactions FOR SELECT USING (true);


--
-- Name: post_shares Users can view shares; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view shares" ON public.post_shares FOR SELECT USING ((((share_type)::text = 'public'::text) OR (auth.uid() = user_id)));


--
-- Name: comments View comments on visible posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "View comments on visible posts" ON public.comments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.posts
  WHERE (posts.id = comments.post_id))));


--
-- Name: messages View own conversations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "View own conversations" ON public.messages FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.conversation_participants
  WHERE ((conversation_participants.conversation_id = messages.conversation_id) AND (conversation_participants.user_id = ( SELECT users.id
           FROM public.users
          WHERE (users.auth_id = auth.uid())))))));


--
-- Name: notifications View own notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "View own notifications" ON public.notifications FOR SELECT USING ((recipient_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))));


--
-- Name: comment_likes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

--
-- Name: comments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

--
-- Name: comments comments_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY comments_select ON public.comments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.posts
  WHERE ((posts.id = comments.post_id) AND ((posts.visibility = 'public'::public.visibility_type) OR (posts.user_id = auth.uid()))))));


--
-- Name: communities; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

--
-- Name: community_members; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

--
-- Name: conversation_participants; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

--
-- Name: conversations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

--
-- Name: couple_album_photos; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.couple_album_photos ENABLE ROW LEVEL SECURITY;

--
-- Name: couple_diary_entries; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.couple_diary_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: couple_game_sessions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.couple_game_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: couple_invitations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.couple_invitations ENABLE ROW LEVEL SECURITY;

--
-- Name: couple_payments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.couple_payments ENABLE ROW LEVEL SECURITY;

--
-- Name: couple_settings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.couple_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: couple_shared_albums; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.couple_shared_albums ENABLE ROW LEVEL SECURITY;

--
-- Name: couple_users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.couple_users ENABLE ROW LEVEL SECURITY;

--
-- Name: user_credit_transactions credit_transactions_insert_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY credit_transactions_insert_own ON public.user_credit_transactions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_credit_transactions credit_transactions_select_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY credit_transactions_select_own ON public.user_credit_transactions FOR SELECT USING (((auth.uid() = user_id) OR (auth.uid() = other_user_id)));


--
-- Name: event_participants; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: follows; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

--
-- Name: follows follows_create_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY follows_create_own ON public.follows FOR INSERT WITH CHECK ((follower_id = auth.uid()));


--
-- Name: follows follows_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY follows_delete_own ON public.follows FOR DELETE USING ((follower_id = auth.uid()));


--
-- Name: follows follows_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY follows_select ON public.follows FOR SELECT USING (true);


--
-- Name: follows follows_view_all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY follows_view_all ON public.follows FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: friends; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

--
-- Name: likes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

--
-- Name: likes likes_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY likes_select ON public.likes FOR SELECT USING (((((target_type)::text = 'post'::text) AND (EXISTS ( SELECT 1
   FROM public.posts
  WHERE ((posts.id = likes.target_id) AND ((posts.visibility = 'public'::public.visibility_type) OR (posts.user_id = auth.uid())))))) OR (((target_type)::text = 'comment'::text) AND (EXISTS ( SELECT 1
   FROM (public.comments c
     JOIN public.posts p ON ((p.id = c.post_id)))
  WHERE ((c.id = likes.target_id) AND ((p.visibility = 'public'::public.visibility_type) OR (p.user_id = auth.uid()))))))));


--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: poll_votes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

--
-- Name: poll_votes poll_votes_create; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY poll_votes_create ON public.poll_votes FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: poll_votes poll_votes_view_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY poll_votes_view_own ON public.poll_votes FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: polls; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

--
-- Name: polls polls_create_with_post; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY polls_create_with_post ON public.polls FOR INSERT WITH CHECK ((creator_id = auth.uid()));


--
-- Name: polls polls_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY polls_update_own ON public.polls FOR UPDATE USING ((creator_id = auth.uid()));


--
-- Name: polls polls_view_if_post_visible; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY polls_view_if_post_visible ON public.polls FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.posts
  WHERE ((posts.poll_id = polls.id) AND ((posts.visibility = 'public'::public.visibility_type) OR (posts.user_id = auth.uid()) OR ((posts.visibility = 'friends'::public.visibility_type) AND (EXISTS ( SELECT 1
           FROM public.follows
          WHERE ((follows.follower_id = auth.uid()) AND (follows.following_id = posts.user_id))))))))));


--
-- Name: post_comments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

--
-- Name: post_likes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

--
-- Name: post_reactions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

--
-- Name: post_saves; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;

--
-- Name: post_shares; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;

--
-- Name: posts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

--
-- Name: posts posts_authenticated_can_create; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY posts_authenticated_can_create ON public.posts FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: posts posts_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY posts_delete_own ON public.posts FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: posts posts_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY posts_update_own ON public.posts FOR UPDATE USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: posts posts_visibility_rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY posts_visibility_rules ON public.posts FOR SELECT USING (((visibility = 'public'::public.visibility_type) OR (user_id = auth.uid()) OR ((visibility = 'friends'::public.visibility_type) AND (EXISTS ( SELECT 1
   FROM public.follows
  WHERE ((follows.follower_id = auth.uid()) AND (follows.following_id = posts.user_id))))) OR ((visibility = 'private'::public.visibility_type) AND (user_id = auth.uid()))));


--
-- Name: profile_seals; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.profile_seals ENABLE ROW LEVEL SECURITY;

--
-- Name: profile_seals profile_seals_select_available; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profile_seals_select_available ON public.profile_seals FOR SELECT USING (((auth.uid() IS NOT NULL) AND (is_available = true)));


--
-- Name: saved_collections; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.saved_collections ENABLE ROW LEVEL SECURITY;

--
-- Name: stories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

--
-- Name: stories stories_create_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY stories_create_own ON public.stories FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: stories stories_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY stories_delete ON public.stories FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: stories stories_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY stories_delete_own ON public.stories FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: stories stories_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY stories_insert ON public.stories FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: stories stories_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY stories_select ON public.stories FOR SELECT USING (((expires_at > now()) AND (auth.uid() IS NOT NULL)));


--
-- Name: stories stories_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY stories_update ON public.stories FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: stories stories_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY stories_update_own ON public.stories FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: stories stories_view_following_or_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY stories_view_following_or_own ON public.stories FOR SELECT USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.follows
  WHERE ((follows.follower_id = auth.uid()) AND (follows.following_id = stories.user_id))))));


--
-- Name: story_boosts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.story_boosts ENABLE ROW LEVEL SECURITY;

--
-- Name: story_boosts story_boosts_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY story_boosts_insert ON public.story_boosts FOR INSERT WITH CHECK ((auth.uid() IN ( SELECT stories.user_id
   FROM public.stories
  WHERE (stories.id = story_boosts.story_id))));


--
-- Name: story_boosts story_boosts_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY story_boosts_select ON public.story_boosts FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: story_daily_limits; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.story_daily_limits ENABLE ROW LEVEL SECURITY;

--
-- Name: story_daily_limits story_limits_all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY story_limits_all ON public.story_daily_limits USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: story_replies; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.story_replies ENABLE ROW LEVEL SECURITY;

--
-- Name: story_replies story_replies_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY story_replies_insert ON public.story_replies FOR INSERT WITH CHECK ((auth.uid() = sender_id));


--
-- Name: story_replies story_replies_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY story_replies_select ON public.story_replies FOR SELECT USING (((auth.uid() = sender_id) OR (auth.uid() IN ( SELECT stories.user_id
   FROM public.stories
  WHERE (stories.id = story_replies.story_id)))));


--
-- Name: story_views; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

--
-- Name: story_views story_views_create; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY story_views_create ON public.story_views FOR INSERT WITH CHECK ((viewer_id = auth.uid()));


--
-- Name: story_views story_views_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY story_views_insert ON public.story_views FOR INSERT WITH CHECK ((auth.uid() = viewer_id));


--
-- Name: story_views story_views_see_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY story_views_see_own ON public.story_views FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.stories
  WHERE ((stories.id = story_views.story_id) AND (stories.user_id = auth.uid())))) OR (viewer_id = auth.uid())));


--
-- Name: story_views story_views_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY story_views_select ON public.story_views FOR SELECT USING (((auth.uid() = viewer_id) OR (auth.uid() IN ( SELECT stories.user_id
   FROM public.stories
  WHERE (stories.id = story_views.story_id)))));


--
-- Name: trending_boosts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.trending_boosts ENABLE ROW LEVEL SECURITY;

--
-- Name: trending_boosts trending_boosts_insert_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY trending_boosts_insert_own ON public.trending_boosts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: trending_boosts trending_boosts_select_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY trending_boosts_select_own ON public.trending_boosts FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_credit_transactions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_credit_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_credits; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

--
-- Name: user_credits user_credits_all_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_credits_all_own ON public.user_credits USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_profile_seals; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_profile_seals ENABLE ROW LEVEL SECURITY;

--
-- Name: user_profile_seals user_seals_insert_as_sender; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_seals_insert_as_sender ON public.user_profile_seals FOR INSERT WITH CHECK ((auth.uid() = sender_id));


--
-- Name: user_profile_seals user_seals_select_visible_or_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_seals_select_visible_or_own ON public.user_profile_seals FOR SELECT USING (((is_displayed = true) OR (auth.uid() = recipient_id) OR (auth.uid() = sender_id)));


--
-- Name: user_verifications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_verifications ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: users users_can_insert_own_profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY users_can_insert_own_profile ON public.users FOR INSERT WITH CHECK (((auth.uid() = id) OR (auth.uid() = auth_id)));


--
-- Name: users users_can_update_own_profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY users_can_update_own_profile ON public.users FOR UPDATE USING (((auth.uid() = id) OR (auth.uid() = auth_id))) WITH CHECK (((auth.uid() = id) OR (auth.uid() = auth_id)));


--
-- Name: users users_can_view_all_profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY users_can_view_all_profiles ON public.users FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: objects storage_avatars_upload; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY storage_avatars_upload ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'media'::text) AND ((storage.foldername(name))[1] = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[2])));


--
-- Name: objects storage_covers_upload; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY storage_covers_upload ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'media'::text) AND ((storage.foldername(name))[1] = 'covers'::text) AND ((auth.uid())::text = (storage.foldername(name))[2])));


--
-- Name: objects storage_delete_own; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY storage_delete_own ON storage.objects FOR DELETE USING (((bucket_id = 'media'::text) AND ((auth.uid())::text = (storage.foldername(name))[2])));


--
-- Name: objects storage_posts_upload_premium_only; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY storage_posts_upload_premium_only ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'media'::text) AND ((storage.foldername(name))[1] = 'posts'::text) AND ((auth.uid())::text = (storage.foldername(name))[2]) AND (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.premium_type = ANY (ARRAY['gold'::public.premium_type, 'diamond'::public.premium_type, 'couple'::public.premium_type])))))));


--
-- Name: objects storage_public_view; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY storage_public_view ON storage.objects FOR SELECT USING ((bucket_id = 'media'::text));


--
-- Name: objects storage_stories_upload_by_plan; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY storage_stories_upload_by_plan ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'media'::text) AND ((storage.foldername(name))[1] = 'stories'::text) AND ((auth.uid())::text = (storage.foldername(name))[2]) AND (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (((users.premium_type = 'free'::public.premium_type) AND (users.is_verified = true)) OR (users.premium_type = ANY (ARRAY['gold'::public.premium_type, 'diamond'::public.premium_type, 'couple'::public.premium_type]))))))));


--
-- Name: objects storage_update_own; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY storage_update_own ON storage.objects FOR UPDATE USING (((bucket_id = 'media'::text) AND ((auth.uid())::text = (storage.foldername(name))[2])));


--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: supabase_admin
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime_messages_publication OWNER TO supabase_admin;

--
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: supabase_admin
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO service_role;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO service_role;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO service_role;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO service_role;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO service_role;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO service_role;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO service_role;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO service_role;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO service_role;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO service_role;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO service_role;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO service_role;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO service_role;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO service_role;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO service_role;
RESET SESSION AUTHORIZATION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO service_role;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO service_role;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO service_role;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO service_role;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO service_role;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO service_role;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO service_role;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO service_role;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO service_role;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO service_role;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO service_role;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO service_role;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO service_role;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO service_role;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO service_role;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO service_role;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO service_role;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO service_role;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO service_role;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO service_role;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO service_role;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO service_role;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO service_role;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO service_role;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO service_role;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO service_role;
RESET SESSION AUTHORIZATION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO service_role;
RESET SESSION AUTHORIZATION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO service_role;
RESET SESSION AUTHORIZATION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO service_role;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO service_role;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO service_role;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO service_role;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO service_role;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO service_role;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO service_role;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO service_role;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO service_role;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO service_role;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO postgres;


--
-- Name: FUNCTION check_message_limits(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.check_message_limits() TO authenticated;
GRANT ALL ON FUNCTION public.check_message_limits() TO service_role;


--
-- Name: FUNCTION check_mutual_follow(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.check_mutual_follow() TO authenticated;
GRANT ALL ON FUNCTION public.check_mutual_follow() TO service_role;


--
-- Name: FUNCTION check_upload_limits(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.check_upload_limits() TO authenticated;
GRANT ALL ON FUNCTION public.check_upload_limits() TO service_role;


--
-- Name: FUNCTION cleanup_expired_stories(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.cleanup_expired_stories() TO authenticated;
GRANT ALL ON FUNCTION public.cleanup_expired_stories() TO service_role;


--
-- Name: FUNCTION decrement_collection_posts(collection_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.decrement_collection_posts(collection_id uuid) TO authenticated;


--
-- Name: FUNCTION decrement_post_comments(post_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.decrement_post_comments(post_id uuid) TO authenticated;


--
-- Name: FUNCTION decrement_post_likes(post_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.decrement_post_likes(post_id uuid) TO authenticated;


--
-- Name: FUNCTION decrement_post_saves(post_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.decrement_post_saves(post_id uuid) TO authenticated;


--
-- Name: FUNCTION decrement_post_shares(post_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.decrement_post_shares(post_id uuid) TO authenticated;


--
-- Name: FUNCTION increment_collection_posts(collection_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.increment_collection_posts(collection_id uuid) TO authenticated;


--
-- Name: FUNCTION increment_post_comments(post_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.increment_post_comments(post_id uuid) TO authenticated;


--
-- Name: FUNCTION increment_post_likes(post_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.increment_post_likes(post_id uuid) TO authenticated;


--
-- Name: FUNCTION increment_post_saves(post_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.increment_post_saves(post_id uuid) TO authenticated;


--
-- Name: FUNCTION increment_post_shares(post_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.increment_post_shares(post_id uuid) TO authenticated;


--
-- Name: FUNCTION reset_daily_limits(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.reset_daily_limits() TO authenticated;
GRANT ALL ON FUNCTION public.reset_daily_limits() TO service_role;


--
-- Name: FUNCTION reset_monthly_limits(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.reset_monthly_limits() TO authenticated;
GRANT ALL ON FUNCTION public.reset_monthly_limits() TO service_role;


--
-- Name: FUNCTION set_user_limits(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.set_user_limits() TO authenticated;
GRANT ALL ON FUNCTION public.set_user_limits() TO service_role;


--
-- Name: FUNCTION sync_couple_premium(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.sync_couple_premium() TO authenticated;
GRANT ALL ON FUNCTION public.sync_couple_premium() TO service_role;


--
-- Name: FUNCTION update_conversation_last_message(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_conversation_last_message() TO authenticated;
GRANT ALL ON FUNCTION public.update_conversation_last_message() TO service_role;


--
-- Name: FUNCTION update_post_reaction_counts(p_post_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_post_reaction_counts(p_post_id uuid) TO authenticated;


--
-- Name: FUNCTION update_post_stats(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_post_stats() TO authenticated;
GRANT ALL ON FUNCTION public.update_post_stats() TO service_role;


--
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;


--
-- Name: FUNCTION update_user_stats(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_user_stats() TO authenticated;
GRANT ALL ON FUNCTION public.update_user_stats() TO service_role;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.users TO service_role;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE ad_campaigns; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ad_campaigns TO authenticated;


--
-- Name: TABLE ad_impressions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ad_impressions TO authenticated;
GRANT ALL ON TABLE public.ad_impressions TO service_role;


--
-- Name: TABLE ad_interactions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ad_interactions TO authenticated;


--
-- Name: TABLE admin_action_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.admin_action_logs TO authenticated;


--
-- Name: TABLE admin_metrics; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.admin_metrics TO authenticated;


--
-- Name: TABLE admin_users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.admin_users TO authenticated;


--
-- Name: TABLE advertisements; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.advertisements TO authenticated;
GRANT ALL ON TABLE public.advertisements TO service_role;


--
-- Name: TABLE blocked_users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.blocked_users TO authenticated;
GRANT ALL ON TABLE public.blocked_users TO service_role;


--
-- Name: TABLE business_ads; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.business_ads TO authenticated;


--
-- Name: TABLE business_team; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.business_team TO authenticated;


--
-- Name: TABLE businesses; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.businesses TO authenticated;


--
-- Name: TABLE calls; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.calls TO authenticated;
GRANT ALL ON TABLE public.calls TO service_role;


--
-- Name: TABLE comments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.comments TO authenticated;
GRANT ALL ON TABLE public.comments TO service_role;


--
-- Name: TABLE communities; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.communities TO authenticated;
GRANT ALL ON TABLE public.communities TO service_role;


--
-- Name: TABLE community_members; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.community_members TO authenticated;
GRANT ALL ON TABLE public.community_members TO service_role;


--
-- Name: TABLE content_purchases; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.content_purchases TO authenticated;


--
-- Name: TABLE content_reviews; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.content_reviews TO authenticated;


--
-- Name: TABLE conversation_participants; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.conversation_participants TO authenticated;
GRANT ALL ON TABLE public.conversation_participants TO service_role;


--
-- Name: TABLE conversations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.conversations TO authenticated;
GRANT ALL ON TABLE public.conversations TO service_role;


--
-- Name: TABLE couple_album_photos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.couple_album_photos TO authenticated;
GRANT ALL ON TABLE public.couple_album_photos TO service_role;


--
-- Name: TABLE couple_diary_entries; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.couple_diary_entries TO authenticated;
GRANT ALL ON TABLE public.couple_diary_entries TO service_role;


--
-- Name: TABLE couple_game_sessions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.couple_game_sessions TO authenticated;
GRANT ALL ON TABLE public.couple_game_sessions TO service_role;


--
-- Name: TABLE couple_games; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.couple_games TO authenticated;
GRANT ALL ON TABLE public.couple_games TO anon;
GRANT ALL ON TABLE public.couple_games TO service_role;


--
-- Name: TABLE couple_invitations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.couple_invitations TO authenticated;
GRANT ALL ON TABLE public.couple_invitations TO service_role;


--
-- Name: TABLE couple_payments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.couple_payments TO authenticated;
GRANT ALL ON TABLE public.couple_payments TO service_role;


--
-- Name: TABLE couple_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.couple_settings TO authenticated;
GRANT ALL ON TABLE public.couple_settings TO service_role;


--
-- Name: TABLE couple_shared_albums; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.couple_shared_albums TO authenticated;
GRANT ALL ON TABLE public.couple_shared_albums TO service_role;


--
-- Name: TABLE couple_users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.couple_users TO authenticated;
GRANT ALL ON TABLE public.couple_users TO service_role;


--
-- Name: TABLE couples; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.couples TO authenticated;
GRANT ALL ON TABLE public.couples TO service_role;


--
-- Name: TABLE creator_subscriptions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.creator_subscriptions TO authenticated;


--
-- Name: TABLE credit_costs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.credit_costs TO authenticated;


--
-- Name: TABLE credit_packages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.credit_packages TO authenticated;


--
-- Name: TABLE credit_transactions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.credit_transactions TO authenticated;


--
-- Name: TABLE dating_matches; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.dating_matches TO authenticated;


--
-- Name: TABLE dating_profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.dating_profiles TO authenticated;


--
-- Name: TABLE dating_swipes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.dating_swipes TO authenticated;


--
-- Name: TABLE dating_top_picks; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.dating_top_picks TO authenticated;


--
-- Name: TABLE event_participants; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.event_participants TO authenticated;
GRANT ALL ON TABLE public.event_participants TO service_role;


--
-- Name: TABLE events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.events TO authenticated;
GRANT ALL ON TABLE public.events TO service_role;


--
-- Name: TABLE financial_reports; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.financial_reports TO authenticated;


--
-- Name: TABLE follows; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.follows TO authenticated;
GRANT ALL ON TABLE public.follows TO service_role;


--
-- Name: TABLE friends; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.friends TO authenticated;
GRANT ALL ON TABLE public.friends TO service_role;


--
-- Name: TABLE likes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.likes TO authenticated;
GRANT ALL ON TABLE public.likes TO service_role;


--
-- Name: TABLE message_reactions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.message_reactions TO authenticated;
GRANT ALL ON TABLE public.message_reactions TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.messages TO authenticated;
GRANT ALL ON TABLE public.messages TO service_role;


--
-- Name: TABLE notifications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.notifications TO authenticated;
GRANT ALL ON TABLE public.notifications TO service_role;


--
-- Name: TABLE paid_content; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.paid_content TO authenticated;


--
-- Name: TABLE payment_history; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_history TO authenticated;
GRANT ALL ON TABLE public.payment_history TO service_role;


--
-- Name: TABLE polls; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.polls TO authenticated;
GRANT ALL ON TABLE public.polls TO service_role;


--
-- Name: TABLE poll_options; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.poll_options TO anon;
GRANT SELECT ON TABLE public.poll_options TO authenticated;


--
-- Name: TABLE poll_votes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.poll_votes TO authenticated;
GRANT ALL ON TABLE public.poll_votes TO service_role;


--
-- Name: TABLE posts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.posts TO authenticated;
GRANT ALL ON TABLE public.posts TO service_role;


--
-- Name: TABLE post_polls; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.post_polls TO anon;
GRANT SELECT ON TABLE public.post_polls TO authenticated;


--
-- Name: TABLE post_reports; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.post_reports TO authenticated;
GRANT ALL ON TABLE public.post_reports TO service_role;


--
-- Name: TABLE post_saves; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.post_saves TO authenticated;


--
-- Name: TABLE post_shares; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.post_shares TO authenticated;


--
-- Name: TABLE profile_seals; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.profile_seals TO authenticated;


--
-- Name: TABLE profile_views; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.profile_views TO authenticated;
GRANT ALL ON TABLE public.profile_views TO service_role;


--
-- Name: TABLE saved_collections; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.saved_collections TO authenticated;


--
-- Name: TABLE saved_posts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.saved_posts TO authenticated;
GRANT ALL ON TABLE public.saved_posts TO service_role;


--
-- Name: TABLE stories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.stories TO authenticated;


--
-- Name: TABLE story_boosts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.story_boosts TO authenticated;


--
-- Name: TABLE story_daily_limits; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.story_daily_limits TO authenticated;


--
-- Name: TABLE story_replies; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.story_replies TO authenticated;


--
-- Name: TABLE story_views; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.story_views TO authenticated;


--
-- Name: TABLE subscriptions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.subscriptions TO authenticated;
GRANT ALL ON TABLE public.subscriptions TO service_role;


--
-- Name: TABLE trending_boosts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.trending_boosts TO authenticated;


--
-- Name: TABLE user_credit_transactions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_credit_transactions TO authenticated;


--
-- Name: TABLE user_credits; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_credits TO authenticated;


--
-- Name: TABLE user_profile_seals; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_profile_seals TO authenticated;


--
-- Name: TABLE user_verifications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_verifications TO authenticated;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;


--
-- Name: TABLE verification_requests; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.verification_requests TO authenticated;
GRANT ALL ON TABLE public.verification_requests TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE messages_2025_07_30; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_07_30 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_07_30 TO dashboard_user;


--
-- Name: TABLE messages_2025_07_31; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_07_31 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_07_31 TO dashboard_user;


--
-- Name: TABLE messages_2025_08_01; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_08_01 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_08_01 TO dashboard_user;


--
-- Name: TABLE messages_2025_08_02; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_08_02 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_08_02 TO dashboard_user;


--
-- Name: TABLE messages_2025_08_03; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_08_03 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_08_03 TO dashboard_user;


--
-- Name: TABLE messages_2025_08_04; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_08_04 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_08_04 TO dashboard_user;


--
-- Name: TABLE messages_2025_08_05; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_08_05 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_08_05 TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database cluster dump complete
--

