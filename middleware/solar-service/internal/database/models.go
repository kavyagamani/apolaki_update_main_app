package database

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	Email     string         `gorm:"uniqueIndex;not null" json:"email"`
	Password  string         `gorm:"not null" json:"-"`
	FirstName string         `json:"first_name"`
	LastName  string         `json:"last_name"`
	Role      string         `gorm:"default:'customer'" json:"role"`
	Active    bool           `gorm:"default:true" json:"active"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relationships
	Installations []SolarInstallation `gorm:"foreignKey:UserID" json:"installations,omitempty"`
	Contracts     []Contract          `gorm:"foreignKey:UserID" json:"contracts,omitempty"`
}

// SolarInstallation represents a solar installation
type SolarInstallation struct {
	ID            uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	UserID        uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	Name          string         `gorm:"not null" json:"name"`
	Address       string         `json:"address"`
	City          string         `json:"city"`
	State         string         `json:"state"`
	ZipCode       string         `json:"zip_code"`
	Latitude      float64        `json:"latitude"`
	Longitude     float64        `json:"longitude"`
	Capacity      float64        `json:"capacity"` // kW
	PanelCount    int            `json:"panel_count"`
	InverterType  string         `json:"inverter_type"`
	InstallDate   time.Time      `json:"install_date"`
	Status        string         `gorm:"default:'active'" json:"status"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relationships
	User            User            `gorm:"foreignKey:UserID" json:"user,omitempty"`
	MonitoringData  []MonitoringData `gorm:"foreignKey:InstallationID" json:"monitoring_data,omitempty"`
	MaintenanceLog  []MaintenanceLog `gorm:"foreignKey:InstallationID" json:"maintenance_log,omitempty"`
	PerformanceData []PerformanceData `gorm:"foreignKey:InstallationID" json:"performance_data,omitempty"`
}

// MonitoringData represents real-time monitoring data
type MonitoringData struct {
	ID               uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	InstallationID   uuid.UUID      `gorm:"type:uuid;not null;index" json:"installation_id"`
	Timestamp        time.Time      `gorm:"index" json:"timestamp"`
	PowerOutput      float64        `json:"power_output"` // Watts
	VoltageAC        float64        `json:"voltage_ac"`   // Volts
	CurrentAC        float64        `json:"current_ac"`   // Amps
	Frequency        float64        `json:"frequency"`    // Hz
	Temperature      float64        `json:"temperature"`  // Celsius
	Efficiency       float64        `json:"efficiency"`   // Percentage
	Status           string         `json:"status"`
	ErrorCode        string         `json:"error_code,omitempty"`
	CreatedAt        time.Time      `json:"created_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relationships
	Installation SolarInstallation `gorm:"foreignKey:InstallationID" json:"installation,omitempty"`
}

// PerformanceData represents aggregated performance metrics
type PerformanceData struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	InstallationID uuid.UUID      `gorm:"type:uuid;not null;index" json:"installation_id"`
	Date           time.Time      `gorm:"index" json:"date"`
	EnergyGenerated float64        `json:"energy_generated"` // kWh
	PeakPower      float64        `json:"peak_power"`        // kW
	AvgEfficiency  float64        `json:"avg_efficiency"`    // Percentage
	DowntimeMinutes int            `json:"downtime_minutes"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relationships
	Installation SolarInstallation `gorm:"foreignKey:InstallationID" json:"installation,omitempty"`
}

// MaintenanceLog represents maintenance records
type MaintenanceLog struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	InstallationID uuid.UUID      `gorm:"type:uuid;not null;index" json:"installation_id"`
	MaintenanceType string         `json:"maintenance_type"` // Preventive, Corrective, Emergency
	Description    string         `json:"description"`
	PerformedDate  time.Time      `json:"performed_date"`
	CompletedDate  time.Time      `json:"completed_date,omitempty"`
	Cost           float64        `json:"cost"`
	Status         string         `gorm:"default:'scheduled'" json:"status"` // Scheduled, In Progress, Completed
	Technician     string         `json:"technician"`
	Notes          string         `json:"notes,omitempty"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relationships
	Installation SolarInstallation `gorm:"foreignKey:InstallationID" json:"installation,omitempty"`
}

// Contract represents a service contract
type Contract struct {
	ID              uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	UserID          uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	ContractType    string         `json:"contract_type"` // Service, Maintenance, Monitoring
	StartDate       time.Time      `json:"start_date"`
	EndDate         time.Time      `json:"end_date"`
	TermMonths      int            `json:"term_months"`
	Amount          float64        `json:"amount"`
	Currency        string         `gorm:"default:'USD'" json:"currency"`
	Status          string         `gorm:"default:'active'" json:"status"` // Active, Expired, Cancelled
	RenewalOption   bool           `json:"renewal_option"`
	Metadata        datatypes.JSON `gorm:"type:jsonb" json:"metadata,omitempty"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relationships
	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// Assessment represents a solar assessment
type Assessment struct {
	ID              uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	UserID          uuid.UUID      `gorm:"type:uuid;index" json:"user_id,omitempty"`
	Address         string         `json:"address"`
	City            string         `json:"city"`
	State           string         `json:"state"`
	ZipCode         string         `json:"zip_code"`
	RoofCondition   string         `json:"roof_condition"`
	RoofArea        float64        `json:"roof_area"` // sq ft
	AnnualUsage     float64        `json:"annual_usage"` // kWh
	SunExposure     string         `json:"sun_exposure"` // High, Medium, Low
	ObstructionLevel string        `json:"obstruction_level"` // None, Minimal, Moderate
	RecommendedCapacity float64    `json:"recommended_capacity"` // kW
	EstimatedCost   float64        `json:"estimated_cost"`
	SavingsEstimate datatypes.JSON `gorm:"type:jsonb" json:"savings_estimate,omitempty"`
	Status          string         `gorm:"default:'draft'" json:"status"` // Draft, Completed, Approved
	Notes           string         `json:"notes,omitempty"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// MarketplaceProduct represents marketplace products/services
type MarketplaceProduct struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	Name        string         `gorm:"not null" json:"name"`
	Category    string         `json:"category"` // Hardware, Services, Training
	Description string         `json:"description"`
	Price       float64        `json:"price"`
	Currency    string         `gorm:"default:'USD'" json:"currency"`
	Inventory   int            `json:"inventory"`
	Rating      float64        `json:"rating"` // 0-5
	Active      bool           `gorm:"default:true" json:"active"`
	Metadata    datatypes.JSON `gorm:"type:jsonb" json:"metadata,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// Finance represents financial information
type Finance struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	UserID         uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	TransactionID  string         `gorm:"uniqueIndex" json:"transaction_id"`
	Amount         float64        `json:"amount"`
	Currency       string         `gorm:"default:'USD'" json:"currency"`
	Type           string         `json:"type"` // Income, Expense, Investment
	Category       string         `json:"category"` // Solar credit, Service fee, Tax incentive
	Status         string         `gorm:"default:'pending'" json:"status"` // Pending, Completed, Failed
	TransactionDate time.Time      `json:"transaction_date"`
	Description    string         `json:"description"`
	Metadata       datatypes.JSON `gorm:"type:jsonb" json:"metadata,omitempty"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}
