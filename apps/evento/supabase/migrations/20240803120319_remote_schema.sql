
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE TYPE "public"."event_duration" AS ENUM (
    'AM_ONLY',
    'PM_ONLY',
    'AM_AND_PM'
);

ALTER TYPE "public"."event_duration" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_attendance_by_date"("attendance_date" "date") RETURNS TABLE("school_id" "text", "date" "date", "time" time without time zone, "is_time_in" boolean)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.school_id,
        a.date,
        a."time",
        a.is_time_in
    FROM
        attendance AS a
    WHERE
        a.date = attendance_date
    ORDER BY
        a.school_id;
END;
$$;

ALTER FUNCTION "public"."get_attendance_by_date"("attendance_date" "date") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_filtered_paginated_school_ids"("current_page" integer, "search_query" "text", "limit_count" integer) RETURNS TABLE("school_id" "text", "total_count" integer)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (a.school_id) 
         a.school_id, 
         COUNT(*) OVER()::INTEGER AS total_count
  FROM attendance a
  WHERE a.school_id ILIKE '%' || search_query || '%'
  ORDER BY a.school_id
  LIMIT limit_count
  OFFSET (current_page - 1) * limit_count;
END;
$$;

ALTER FUNCTION "public"."get_filtered_paginated_school_ids"("current_page" integer, "search_query" "text", "limit_count" integer) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."attendance" (
    "id" bigint NOT NULL,
    "time" time without time zone NOT NULL,
    "date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "school_id" "text" NOT NULL,
    "is_time_in" boolean NOT NULL
);

ALTER TABLE "public"."attendance" OWNER TO "postgres";

ALTER TABLE "public"."attendance" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."attendance_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."departments" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "short_name" "text",
    "name" "text",
    "is_active" boolean DEFAULT true NOT NULL
);

ALTER TABLE "public"."departments" OWNER TO "postgres";

ALTER TABLE "public"."departments" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."departments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "date" "date" NOT NULL,
    "description" "text",
    "location" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "duration" "public"."event_duration" NOT NULL
);

ALTER TABLE "public"."events" OWNER TO "postgres";

ALTER TABLE "public"."events" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."events_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."students" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "school_id" "text" NOT NULL,
    "name" character varying NOT NULL,
    "dept_id" integer,
    "is_active" boolean DEFAULT true NOT NULL
);

ALTER TABLE "public"."students" OWNER TO "postgres";

ALTER TABLE "public"."students" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."students_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "role" smallint NOT NULL
);

ALTER TABLE "public"."users" OWNER TO "postgres";

ALTER TABLE "public"."users" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."users_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE ONLY "public"."attendance"
    ADD CONSTRAINT "attendance_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_school_id_key" UNIQUE ("school_id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_dept_id_fkey" FOREIGN KEY ("dept_id") REFERENCES "public"."departments"("id");

CREATE POLICY "Enable insert for authenticated users only" ON "public"."students" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON "public"."attendance" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."events" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."students" FOR SELECT USING (true);

CREATE PUBLICATION "logflare_pub" WITH (publish = 'insert, update, delete, truncate');

ALTER PUBLICATION "logflare_pub" OWNER TO "postgres";

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."get_attendance_by_date"("attendance_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_attendance_by_date"("attendance_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_attendance_by_date"("attendance_date" "date") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_filtered_paginated_school_ids"("current_page" integer, "search_query" "text", "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_filtered_paginated_school_ids"("current_page" integer, "search_query" "text", "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_filtered_paginated_school_ids"("current_page" integer, "search_query" "text", "limit_count" integer) TO "service_role";

GRANT ALL ON TABLE "public"."attendance" TO "anon";
GRANT ALL ON TABLE "public"."attendance" TO "authenticated";
GRANT ALL ON TABLE "public"."attendance" TO "service_role";

GRANT ALL ON SEQUENCE "public"."attendance_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."attendance_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."attendance_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."departments" TO "anon";
GRANT ALL ON TABLE "public"."departments" TO "authenticated";
GRANT ALL ON TABLE "public"."departments" TO "service_role";

GRANT ALL ON SEQUENCE "public"."departments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."departments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."departments_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";

GRANT ALL ON SEQUENCE "public"."events_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."events_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."events_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."students" TO "anon";
GRANT ALL ON TABLE "public"."students" TO "authenticated";
GRANT ALL ON TABLE "public"."students" TO "service_role";

GRANT ALL ON SEQUENCE "public"."students_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."students_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."students_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";

GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
