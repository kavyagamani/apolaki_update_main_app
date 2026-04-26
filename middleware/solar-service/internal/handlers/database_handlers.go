package handlers

import (
	"net/http"

	"github.com/apolaki/solar-service/internal/database"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// CreateUserRequest represents user creation request
type CreateUserRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

// CreateUser creates a new user in Netlify DB
func CreateUser(c *gin.Context) {
	var req CreateUserRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := &database.User{
		ID:        uuid.New(),
		Email:     req.Email,
		Password:  req.Password, // In production, hash the password
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Active:    true,
	}

	db := database.GetDB()
	if err := db.Create(user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, user)
}

// GetUser retrieves a user by ID from Netlify DB
func GetUser(c *gin.Context) {
	userID := c.Param("id")

	var user database.User
	db := database.GetDB()

	if err := db.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// GetUsers retrieves all users from Netlify DB
func GetUsers(c *gin.Context) {
	var users []database.User
	db := database.GetDB()

	if err := db.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	c.JSON(http.StatusOK, users)
}

// CreateSolarInstallation creates a new solar installation
type CreateInstallationRequest struct {
	UserID       string  `json:"user_id" binding:"required"`
	Name         string  `json:"name" binding:"required"`
	Address      string  `json:"address"`
	Capacity     float64 `json:"capacity"`
	PanelCount   int     `json:"panel_count"`
	InverterType string  `json:"inverter_type"`
}

func CreateSolarInstallation(c *gin.Context) {
	var req CreateInstallationRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	installation := &database.SolarInstallation{
		ID:           uuid.New(),
		UserID:       userID,
		Name:         req.Name,
		Address:      req.Address,
		Capacity:     req.Capacity,
		PanelCount:   req.PanelCount,
		InverterType: req.InverterType,
		Status:       "active",
	}

	db := database.GetDB()
	if err := db.Create(installation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create installation"})
		return
	}

	c.JSON(http.StatusCreated, installation)
}

// GetSolarInstallation retrieves a solar installation by ID
func GetSolarInstallation(c *gin.Context) {
	installationID := c.Param("id")

	var installation database.SolarInstallation
	db := database.GetDB()

	if err := db.First(&installation, "id = ?", installationID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Installation not found"})
		return
	}

	c.JSON(http.StatusOK, installation)
}

// GetUserInstallations retrieves all installations for a user
func GetUserInstallations(c *gin.Context) {
	userID := c.Param("user_id")

	var installations []database.SolarInstallation
	db := database.GetDB()

	if err := db.Where("user_id = ?", userID).Find(&installations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch installations"})
		return
	}

	c.JSON(http.StatusOK, installations)
}

// RecordMonitoringData records monitoring data for an installation
type MonitoringDataRequest struct {
	PowerOutput float64 `json:"power_output"`
	VoltageAC   float64 `json:"voltage_ac"`
	CurrentAC   float64 `json:"current_ac"`
	Frequency   float64 `json:"frequency"`
	Temperature float64 `json:"temperature"`
	Status      string  `json:"status"`
}

func RecordMonitoringData(c *gin.Context) {
	installationID := c.Param("installation_id")
	var req MonitoringDataRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id, err := uuid.Parse(installationID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid installation ID"})
		return
	}

	data := &database.MonitoringData{
		ID:             uuid.New(),
		InstallationID: id,
		PowerOutput:    req.PowerOutput,
		VoltageAC:      req.VoltageAC,
		CurrentAC:      req.CurrentAC,
		Frequency:      req.Frequency,
		Temperature:    req.Temperature,
		Status:         req.Status,
	}

	db := database.GetDB()
	if err := db.Create(data).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record monitoring data"})
		return
	}

	c.JSON(http.StatusCreated, data)
}
