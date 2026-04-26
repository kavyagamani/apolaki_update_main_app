package database

import (
	"fmt"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB is the database connection instance
var DB *gorm.DB

// InitNetlifyDB initializes connection to Netlify DB using GORM ORM
func InitNetlifyDB() error {
	// Get database URL from environment
	// Netlify DB provides DATABASE_URL environment variable
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		// Fallback for local development
		databaseURL = os.Getenv("POSTGRES_URL")
		if databaseURL == "" {
			return fmt.Errorf("DATABASE_URL or POSTGRES_URL environment variable not set")
		}
	}

	// Open database connection
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return fmt.Errorf("failed to connect to Netlify DB: %w", err)
	}

	// Get underlying SQL database
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("failed to get database instance: %w", err)
	}

	// Set connection pool settings
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	DB = db

	return nil
}

// MigrateModels runs all migrations for Netlify DB
func MigrateModels() error {
	if DB == nil {
		return fmt.Errorf("database not initialized")
	}

	return DB.AutoMigrate(
		&User{},
		&SolarInstallation{},
		&MonitoringData{},
		&PerformanceData{},
		&MaintenanceLog{},
		&Contract{},
		&Assessment{},
		&MarketplaceProduct{},
		&Finance{},
	)
}

// CloseDB closes the database connection
func CloseDB() error {
	if DB == nil {
		return nil
	}
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

// HealthCheck verifies database connection
func HealthCheck() error {
	if DB == nil {
		return fmt.Errorf("database not initialized")
	}
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Ping()
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return DB
}
