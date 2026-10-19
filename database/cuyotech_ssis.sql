-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: cuyotech_ssis
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin_users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `department_id` bigint(20) unsigned DEFAULT NULL,
  `counter_no` int(11) DEFAULT NULL,
  `account_status` varchar(255) NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admin_users_username_unique` (`username`),
  KEY `admin_users_department_id_foreign` (`department_id`),
  CONSTRAINT `admin_users_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users`
--

LOCK TABLES `admin_users` WRITE;
/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
INSERT INTO `admin_users` VALUES (1,'v.ramos','Victor Ramos','$2y$12$rSIEuWkqdSJmROJU1DZdWOTHorKKnN.qzmjfSpe8VUzWiW2lJpshK','Admin',NULL,NULL,'Active','2026-10-19 00:58:10','2026-10-19 00:58:10'),(2,'r.alcantara','Ramon Alcantara','$2y$12$SPwBJidKOh9Uqw.SKlXwSuhYgQ6bWQFNscyibf7L7e69CdoS4wtya','Registrar',1,1,'Active','2026-10-19 00:58:10','2026-10-19 00:58:10'),(3,'l.navarro','Leah Navarro','$2y$12$0cdHrN7r6IBHLQstXve4W.pqsb3toiuvyNUiJAE5RE1NMGPLKIdN.','Cashier',NULL,3,'Active','2026-10-19 00:58:10','2026-10-19 00:58:10'),(4,'d.flores','Dina Flores','$2y$12$GInW6LEHzDxYcsUnsnctP.gJIT22BsBTy.C4BlLvoVtIqsqf2xjJu','DepartmentStaff',3,NULL,'Active','2026-10-19 00:58:10','2026-10-19 00:58:10');
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assessment_items`
--

DROP TABLE IF EXISTS `assessment_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assessment_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `assessment_id` bigint(20) unsigned NOT NULL,
  `fee_type` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `assessment_items_assessment_id_foreign` (`assessment_id`),
  CONSTRAINT `assessment_items_assessment_id_foreign` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessment_items`
--

LOCK TABLES `assessment_items` WRITE;
/*!40000 ALTER TABLE `assessment_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `assessment_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assessments`
--

DROP TABLE IF EXISTS `assessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assessments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `student_id` bigint(20) unsigned NOT NULL,
  `school_year` varchar(255) NOT NULL DEFAULT '2025-2026',
  `semester` varchar(255) NOT NULL DEFAULT 'Second Semester',
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` varchar(255) NOT NULL DEFAULT 'Unpaid',
  `date_assessed` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `assessments_student_id_foreign` (`student_id`),
  CONSTRAINT `assessments_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessments`
--

LOCK TABLES `assessments` WRITE;
/*!40000 ALTER TABLE `assessments` DISABLE KEYS */;
/*!40000 ALTER TABLE `assessments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `admin_user_id` bigint(20) unsigned DEFAULT NULL,
  `student_id` bigint(20) unsigned DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `table_affected` varchar(255) NOT NULL,
  `record_id` bigint(20) unsigned DEFAULT NULL,
  `logged_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_logs_admin_user_id_foreign` (`admin_user_id`),
  KEY `audit_logs_student_id_foreign` (`student_id`),
  CONSTRAINT `audit_logs_admin_user_id_foreign` FOREIGN KEY (`admin_user_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `audit_logs_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,NULL,'System Initialized','database',1,'2026-10-19 08:00:00','2026-10-19 00:58:10','2026-10-19 00:58:10'),(2,2,NULL,'Curriculum Configured (7 CCS Courses)','courses',1,'2026-10-19 08:30:00','2026-10-19 00:58:10','2026-10-19 00:58:10');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clearances`
--

DROP TABLE IF EXISTS `clearances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clearances` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `student_id` bigint(20) unsigned NOT NULL,
  `department_id` bigint(20) unsigned NOT NULL,
  `school_year` varchar(255) NOT NULL DEFAULT '2025-2026',
  `semester` varchar(255) NOT NULL DEFAULT 'Second Semester',
  `status` varchar(255) NOT NULL DEFAULT 'Pending',
  `remarks` varchar(255) DEFAULT NULL,
  `request_date` date NOT NULL,
  `decision_date` date DEFAULT NULL,
  `decided_by_admin_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `clearances_student_id_foreign` (`student_id`),
  KEY `clearances_department_id_foreign` (`department_id`),
  KEY `clearances_decided_by_admin_id_foreign` (`decided_by_admin_id`),
  CONSTRAINT `clearances_decided_by_admin_id_foreign` FOREIGN KEY (`decided_by_admin_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `clearances_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `clearances_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clearances`
--

LOCK TABLES `clearances` WRITE;
/*!40000 ALTER TABLE `clearances` DISABLE KEYS */;
/*!40000 ALTER TABLE `clearances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `courses` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `course_code` varchar(255) NOT NULL,
  `course_name` varchar(255) NOT NULL,
  `units` int(11) NOT NULL DEFAULT 3,
  `department_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `courses_department_id_foreign` (`department_id`),
  CONSTRAINT `courses_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'CCS109','System Analysis and Design',3,1,'2026-10-19 00:58:10','2026-10-19 00:58:10'),(2,'CCS112','Applications Development and Emerging Technologies',3,1,'2026-10-19 00:58:10','2026-10-19 00:58:10'),(3,'CSP108','Programming Languages',3,1,'2026-10-19 00:58:10','2026-10-19 00:58:10'),(4,'CCS106','Social Issues and Professional Practice',3,1,'2026-10-19 00:58:10','2026-10-19 00:58:10'),(5,'CSEG1','Game Concepts and Production',3,1,'2026-10-19 00:58:10','2026-10-19 00:58:10'),(6,'ENV101','Environmental Science',3,1,'2026-10-19 00:58:10','2026-10-19 00:58:10'),(7,'CSP105','Algorithms and Complexity',3,1,'2026-10-19 00:58:10','2026-10-19 00:58:10');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `departments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `department_name` varchar(255) NOT NULL,
  `building` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'College of Computing Studies','Engineering & IT Bldg','2026-10-19 00:58:10','2026-10-19 00:58:10'),(2,'University Library','Main Library Hall','2026-10-19 00:58:10','2026-10-19 00:58:10'),(3,'Computer Laboratory','Tech Center Wing B','2026-10-19 00:58:10','2026-10-19 00:58:10'),(4,'Student Affairs Office','Student Center','2026-10-19 00:58:10','2026-10-19 00:58:10'),(5,'Cashiering & Accounting Office','Admin Annex','2026-10-19 00:58:10','2026-10-19 00:58:10');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_requests`
--

DROP TABLE IF EXISTS `document_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `document_requests` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `student_id` bigint(20) unsigned NOT NULL,
  `document_type` varchar(255) NOT NULL,
  `purpose` varchar(255) NOT NULL,
  `number_of_copies` int(11) NOT NULL DEFAULT 1,
  `request_date` date NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Pending',
  `processed_by_admin_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `document_requests_student_id_foreign` (`student_id`),
  KEY `document_requests_processed_by_admin_id_foreign` (`processed_by_admin_id`),
  CONSTRAINT `document_requests_processed_by_admin_id_foreign` FOREIGN KEY (`processed_by_admin_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `document_requests_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_requests`
--

LOCK TABLES `document_requests` WRITE;
/*!40000 ALTER TABLE `document_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `document_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `enrollments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `student_id` bigint(20) unsigned NOT NULL,
  `section_id` bigint(20) unsigned NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `enrollments_student_id_foreign` (`student_id`),
  KEY `enrollments_section_id_foreign` (`section_id`),
  CONSTRAINT `enrollments_section_id_foreign` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollments_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` varchar(255) NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grades`
--

DROP TABLE IF EXISTS `grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `grades` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `enrollment_id` bigint(20) unsigned NOT NULL,
  `grade_value` decimal(4,2) NOT NULL DEFAULT 0.00,
  `remarks` varchar(255) NOT NULL DEFAULT 'Passed',
  `date_encoded` date DEFAULT NULL,
  `encoded_by_admin_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `grades_enrollment_id_foreign` (`enrollment_id`),
  KEY `grades_encoded_by_admin_id_foreign` (`encoded_by_admin_id`),
  CONSTRAINT `grades_encoded_by_admin_id_foreign` FOREIGN KEY (`encoded_by_admin_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `grades_enrollment_id_foreign` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grades`
--

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
/*!40000 ALTER TABLE `grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` smallint(5) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_10_05_000001_create_ssis_system_tables',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `student_id` bigint(20) unsigned NOT NULL,
  `assessment_id` bigint(20) unsigned NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_date` date NOT NULL,
  `payment_method` varchar(255) NOT NULL DEFAULT 'Cash',
  `or_number` varchar(255) NOT NULL,
  `processed_by_admin_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_student_id_foreign` (`student_id`),
  KEY `payments_assessment_id_foreign` (`assessment_id`),
  KEY `payments_processed_by_admin_id_foreign` (`processed_by_admin_id`),
  CONSTRAINT `payments_assessment_id_foreign` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_processed_by_admin_id_foreign` FOREIGN KEY (`processed_by_admin_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payments_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programs`
--

DROP TABLE IF EXISTS `programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `programs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `program_code` varchar(255) NOT NULL,
  `program_name` varchar(255) NOT NULL,
  `department_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `programs_department_id_foreign` (`department_id`),
  CONSTRAINT `programs_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programs`
--

LOCK TABLES `programs` WRITE;
/*!40000 ALTER TABLE `programs` DISABLE KEYS */;
INSERT INTO `programs` VALUES (1,'BSCS','BS Computer Science',1,'2026-10-19 00:58:10','2026-10-19 00:58:10'),(2,'BSIT','BS Information Technology',1,'2026-10-19 00:58:10','2026-10-19 00:58:10');
/*!40000 ALTER TABLE `programs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sections`
--

DROP TABLE IF EXISTS `sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sections` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `course_id` bigint(20) unsigned NOT NULL,
  `school_year` varchar(255) NOT NULL DEFAULT '2025-2026',
  `semester` varchar(255) NOT NULL DEFAULT 'Second Semester',
  `schedule` varchar(255) NOT NULL,
  `room` varchar(255) NOT NULL DEFAULT 'Online / TBA',
  `slot_limit` int(11) NOT NULL DEFAULT 40,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sections_course_id_foreign` (`course_id`),
  CONSTRAINT `sections_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sections`
--

LOCK TABLES `sections` WRITE;
/*!40000 ALTER TABLE `sections` DISABLE KEYS */;
INSERT INTO `sections` VALUES (1,1,'2025-2026','Second Semester','M/W 9:00–10:30','CL-101',40,'2026-10-19 00:58:10','2026-10-19 00:58:10'),(2,2,'2025-2026','Second Semester','T/Th 10:30–12:00','CL-102',40,'2026-10-19 00:58:10','2026-10-19 00:58:10'),(3,3,'2025-2026','Second Semester','M/W 13:00–14:30','CL-203',40,'2026-10-19 00:58:10','2026-10-19 00:58:10'),(4,4,'2025-2026','Second Semester','T/Th 13:00–15:00','AS-301',35,'2026-10-19 00:58:10','2026-10-19 00:58:10'),(5,5,'2025-2026','Second Semester','F 8:00–11:00','CL-204',35,'2026-10-19 00:58:10','2026-10-19 00:58:10'),(6,6,'2025-2026','Second Semester','M/W 15:00–16:30','SC-101',45,'2026-10-19 00:58:10','2026-10-19 00:58:10'),(7,7,'2025-2026','Second Semester','T/Th 15:00–17:00','CL-103',40,'2026-10-19 00:58:10','2026-10-19 00:58:10');
/*!40000 ALTER TABLE `sections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `students` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `student_id_number` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `year_level` int(11) NOT NULL DEFAULT 1,
  `program_id` bigint(20) unsigned NOT NULL,
  `username` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `account_status` varchar(255) NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `students_student_id_number_unique` (`student_id_number`),
  UNIQUE KEY `students_email_unique` (`email`),
  UNIQUE KEY `students_username_unique` (`username`),
  KEY `students_program_id_foreign` (`program_id`),
  CONSTRAINT `students_program_id_foreign` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-19 16:59:04
