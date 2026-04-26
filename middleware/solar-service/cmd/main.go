package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func main() {
	// Initialize logger
	logger, _ := zap.NewProduction()
	defer logger.Sync()

	// Initialize Gin router
	router := gin.Default()

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "healthy",
			"service": "solar-service",
		})
	})

	// Ready check endpoint
	router.GET("/ready", func(c *gin.Context) {
		// Add readiness checks (DB connection, cache, etc)
		c.JSON(200, gin.H{
			"ready": true,
		})
	})

	// API v1 routes (to be implemented)
	v1 := router.Group("/api/v1")
	{
		// Authentication endpoints
		auth := v1.Group("/auth")
		{
			auth.POST("/register", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Register endpoint"})
			})
			auth.POST("/login", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Login endpoint"})
			})
		}

		// Installations endpoints
		installations := v1.Group("/installations")
		{
			installations.GET("", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "List installations"})
			})
			installations.POST("", func(c *gin.Context) {
				c.JSON(201, gin.H{"message": "Create installation"})
			})
			installations.GET("/:id", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Get installation"})
			})
		}

		// Monitoring endpoints
		monitoring := v1.Group("/monitoring")
		{
			monitoring.GET("/:id/current", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Current monitoring data"})
			})
			monitoring.GET("/:id/daily", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Daily monitoring data"})
			})
		}

		// Marketplace endpoints
		marketplace := v1.Group("/marketplace")
		{
			marketplace.GET("/products", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "List marketplace products"})
			})
		}

		// Assessment endpoints
		assessment := v1.Group("/assessment")
		{
			assessment.POST("/calculate", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Calculate assessment"})
			})
		}

		// Contract endpoints
		contracts := v1.Group("/contracts")
		{
			contracts.GET("", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "List contracts"})
			})
		}

		// User profile endpoints
		profile := v1.Group("/users")
		{
			profile.GET("/profile", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Get user profile"})
			})
		}
	}

	// Start server
	port := os.Getenv("API_PORT")
	if port == "" {
		port = "8080"
	}

	logger.Info(fmt.Sprintf("Starting solar-service on port %s", port))
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
