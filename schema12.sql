-- MySQL dump 10.13  Distrib 9.4.0, for Win64 (x86_64)
--
-- Host: localhost    Database: hospital_db
-- ------------------------------------------------------
-- Server version	9.4.0CREATE DATABASE hospital_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;



/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bacsi`
--

DROP TABLE IF EXISTS `bacsi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bacsi` (
  `id_bacsi` int NOT NULL AUTO_INCREMENT,
  `id_taikhoan` int NOT NULL,
  `ho_ten` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hoc_vi` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `chuyen_mon` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_khoa` int DEFAULT NULL,
  `nam_kinh_nghiem` int DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_bacsi`),
  KEY `id_taikhoan` (`id_taikhoan`),
  KEY `id_khoa` (`id_khoa`),
  CONSTRAINT `bacsi_ibfk_1` FOREIGN KEY (`id_taikhoan`) REFERENCES `taikhoan` (`id_taikhoan`) ON DELETE CASCADE,
  CONSTRAINT `bacsi_ibfk_2` FOREIGN KEY (`id_khoa`) REFERENCES `khoa` (`id_khoa`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `benhnhan`
--

DROP TABLE IF EXISTS `benhnhan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `benhnhan` (
  `id_benhnhan` int NOT NULL AUTO_INCREMENT,
  `ho_ten` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gioi_tinh` enum('Nam','Nu','Khac') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngay_sinh` date DEFAULT NULL,
  `dia_chi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `so_bhyt` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_benhnhan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `datlich`
--

DROP TABLE IF EXISTS `datlich`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `datlich` (
  `id_datlich` int NOT NULL AUTO_INCREMENT,
  `id_benhnhan` int NOT NULL,
  `id_khoa` int NOT NULL,
  `id_bacsi` int DEFAULT NULL,
  `ngay_dat` date NOT NULL,
  `gio_dat` time NOT NULL,
  `trang_thai` enum('Cho xac nhan','Da xac nhan','Huy') COLLATE utf8mb4_unicode_ci DEFAULT 'Cho xac nhan',
  PRIMARY KEY (`id_datlich`),
  KEY `id_benhnhan` (`id_benhnhan`),
  KEY `id_khoa` (`id_khoa`),
  KEY `id_bacsi` (`id_bacsi`),
  CONSTRAINT `datlich_ibfk_1` FOREIGN KEY (`id_benhnhan`) REFERENCES `benhnhan` (`id_benhnhan`) ON DELETE CASCADE,
  CONSTRAINT `datlich_ibfk_2` FOREIGN KEY (`id_khoa`) REFERENCES `khoa` (`id_khoa`) ON DELETE CASCADE,
  CONSTRAINT `datlich_ibfk_3` FOREIGN KEY (`id_bacsi`) REFERENCES `bacsi` (`id_bacsi`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `hosokhambenh`
--

DROP TABLE IF EXISTS `hosokhambenh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hosokhambenh` (
  `id_hoso` int NOT NULL AUTO_INCREMENT,
  `id_lichkham` int NOT NULL,
  `chan_doan` text COLLATE utf8mb4_unicode_ci,
  `trieu_chung` text COLLATE utf8mb4_unicode_ci,
  `thuoc_ke_don` text COLLATE utf8mb4_unicode_ci,
  `ghi_chu` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_hoso`),
  KEY `id_lichkham` (`id_lichkham`),
  CONSTRAINT `hosokhambenh_ibfk_1` FOREIGN KEY (`id_lichkham`) REFERENCES `lichkham` (`id_lichkham`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `khoa`
--

DROP TABLE IF EXISTS `khoa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `khoa` (
  `id_khoa` int NOT NULL AUTO_INCREMENT,
  `ten_khoa` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mo_ta` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_khoa`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `letan`
--

DROP TABLE IF EXISTS `letan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `letan` (
  `id_letan` int NOT NULL AUTO_INCREMENT,
  `id_taikhoan` int NOT NULL,
  `ho_ten` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ca_lam` enum('Sang','Chieu','Toi') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_letan`),
  KEY `id_taikhoan` (`id_taikhoan`),
  CONSTRAINT `letan_ibfk_1` FOREIGN KEY (`id_taikhoan`) REFERENCES `taikhoan` (`id_taikhoan`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lichkham`
--

DROP TABLE IF EXISTS `lichkham`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lichkham` (
  `id_lichkham` int NOT NULL AUTO_INCREMENT,
  `id_datlich` int NOT NULL,
  `id_letan` int NOT NULL,
  `ngay_kham` date NOT NULL,
  `ket_qua` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_lichkham`),
  KEY `id_datlich` (`id_datlich`),
  KEY `id_letan` (`id_letan`),
  CONSTRAINT `lichkham_ibfk_1` FOREIGN KEY (`id_datlich`) REFERENCES `datlich` (`id_datlich`) ON DELETE CASCADE,
  CONSTRAINT `lichkham_ibfk_2` FOREIGN KEY (`id_letan`) REFERENCES `letan` (`id_letan`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lichlamviec`
--

DROP TABLE IF EXISTS `lichlamviec`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lichlamviec` (
  `id_lichlamviec` int NOT NULL AUTO_INCREMENT,
  `id_bacsi` int NOT NULL,
  `ngay` date NOT NULL,
  `ca` enum('Sang','Chieu','Toi') COLLATE utf8mb4_unicode_ci NOT NULL,
  `ghi_chu` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_lichlamviec`),
  KEY `id_bacsi` (`id_bacsi`),
  CONSTRAINT `lichlamviec_ibfk_1` FOREIGN KEY (`id_bacsi`) REFERENCES `bacsi` (`id_bacsi`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lichlamviec_fix`
--

DROP TABLE IF EXISTS `lichlamviec_fix`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lichlamviec_fix` (
  `id_fix` int NOT NULL AUTO_INCREMENT,
  `id_bacsi` int NOT NULL,
  `thu_trong_tuan` enum('2','3','4','5','6','7','CN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `ca` enum('Sang','Chieu','Toi') COLLATE utf8mb4_unicode_ci NOT NULL,
  `ghi_chu` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_fix`),
  KEY `id_bacsi` (`id_bacsi`),
  CONSTRAINT `lichlamviec_fix_ibfk_1` FOREIGN KEY (`id_bacsi`) REFERENCES `bacsi` (`id_bacsi`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `news` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `summary` text COLLATE utf8mb4_unicode_ci,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Admin',
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('draft','published') COLLATE utf8mb4_unicode_ci DEFAULT 'published',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `otp_log`
--

DROP TABLE IF EXISTS `otp_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_log` (
  `id_otp` int NOT NULL AUTO_INCREMENT,
  `id_taikhoan` int NOT NULL,
  `otp_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expired_at` datetime DEFAULT NULL,
  `is_used` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id_otp`),
  KEY `id_taikhoan` (`id_taikhoan`),
  CONSTRAINT `otp_log_ibfk_1` FOREIGN KEY (`id_taikhoan`) REFERENCES `taikhoan` (`id_taikhoan`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taikhoan`
--

DROP TABLE IF EXISTS `taikhoan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `taikhoan` (
  `id_taikhoan` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('BACSI','LETAN','ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  PRIMARY KEY (`id_taikhoan`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-07  1:07:57
