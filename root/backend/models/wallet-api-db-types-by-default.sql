--
-- PostgreSQL database dump
--

-- Dumped from database version 15.1
-- Dumped by pg_dump version 15.1

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

--
-- Data for Name: amounts; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: types; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."types" ("id", "movement", "name", "created_at", "creator", "default") OVERRIDING SYSTEM VALUE VALUES (1, 'input', 'salary', '2022-11-22', 1, true);
INSERT INTO "public"."types" ("id", "movement", "name", "created_at", "creator", "default") OVERRIDING SYSTEM VALUE VALUES (2, 'input', 'other', '2022-11-22', 1, true);
INSERT INTO "public"."types" ("id", "movement", "name", "created_at", "creator", "default") OVERRIDING SYSTEM VALUE VALUES (3, 'output', 'taxes', '2022-11-22', 1, true);
INSERT INTO "public"."types" ("id", "movement", "name", "created_at", "creator", "default") OVERRIDING SYSTEM VALUE VALUES (4, 'output', 'food', '2022-11-22', 1, true);
INSERT INTO "public"."types" ("id", "movement", "name", "created_at", "creator", "default") OVERRIDING SYSTEM VALUE VALUES (5, 'output', 'health', '2022-11-22', 1, true);
INSERT INTO "public"."types" ("id", "movement", "name", "created_at", "creator", "default") OVERRIDING SYSTEM VALUE VALUES (6, 'output', 'transport', '2022-11-22', 1, true);
INSERT INTO "public"."types" ("id", "movement", "name", "created_at", "creator", "default") OVERRIDING SYSTEM VALUE VALUES (7, 'output', 'clothes', '2022-11-22', 1, true);
INSERT INTO "public"."types" ("id", "movement", "name", "created_at", "creator", "default") OVERRIDING SYSTEM VALUE VALUES (8, 'output', 'holiday', '2022-11-22', 1, true);
INSERT INTO "public"."types" ("id", "movement", "name", "created_at", "creator", "default") OVERRIDING SYSTEM VALUE VALUES (9, 'output', 'rent', '2022-11-22', 1, true);
INSERT INTO "public"."types" ("id", "movement", "name", "created_at", "creator", "default") OVERRIDING SYSTEM VALUE VALUES (10, 'output', 'education', '2022-11-22', 1, true);
INSERT INTO "public"."types" ("id", "movement", "name", "created_at", "creator", "default") OVERRIDING SYSTEM VALUE VALUES (11, 'output', 'credit', '2022-11-22', 1, true);
INSERT INTO "public"."types" ("id", "movement", "name", "created_at", "creator", "default") OVERRIDING SYSTEM VALUE VALUES (12, 'output', 'pet', '2022-11-22', 1, true);
INSERT INTO "public"."types" ("id", "movement", "name", "created_at", "creator", "default") OVERRIDING SYSTEM VALUE VALUES (13, 'output', 'recreation', '2022-11-22', 1, true);
INSERT INTO "public"."types" ("id", "movement", "name", "created_at", "creator", "default") OVERRIDING SYSTEM VALUE VALUES (14, 'output', 'saving', '2022-11-22', 1, true);
INSERT INTO "public"."types" ("id", "movement", "name", "created_at", "creator", "default") OVERRIDING SYSTEM VALUE VALUES (15, 'output', 'phone', '2022-11-22', 1, true);
INSERT INTO "public"."types" ("id", "movement", "name", "created_at", "creator", "default") OVERRIDING SYSTEM VALUE VALUES (16, 'output', 'vehicle', '2022-11-22', 1, true);
INSERT INTO "public"."types" ("id", "movement", "name", "created_at", "creator", "default") OVERRIDING SYSTEM VALUE VALUES (17, 'output', 'other', '2022-11-22', 1, true);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Name: amounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."amounts_id_seq"', 1, false);


--
-- Name: types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."types_id_seq"', 17, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."users_id_seq"', 2, true);


--
-- PostgreSQL database dump complete
--

