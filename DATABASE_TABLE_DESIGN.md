# 3.5 Database Table Design

This document defines the table structure for the requested sections:

- 3.5.1 Admin Table
- 3.5.2 Product Table
- 3.5.3 User Table

The design is aligned with your existing ecommerce backend fields and can be used for report documentation or SQL migration planning.

## 3.5.1 Admin Table

Purpose: Store admin-specific access control and activity details.

### Table Name

`admins`

### Columns

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| admin_id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique admin record ID |
| user_id | BIGINT | NOT NULL, UNIQUE, FOREIGN KEY -> users(user_id) | Links admin record to base user account |
| access_level | VARCHAR(30) | NOT NULL, DEFAULT 'catalog_admin' | Admin level (super_admin, catalog_admin, order_admin, support_admin) |
| can_manage_users | BOOLEAN | NOT NULL, DEFAULT FALSE | Permission to manage users |
| can_manage_products | BOOLEAN | NOT NULL, DEFAULT TRUE | Permission to manage products |
| can_manage_orders | BOOLEAN | NOT NULL, DEFAULT TRUE | Permission to manage orders |
| can_manage_content | BOOLEAN | NOT NULL, DEFAULT FALSE | Permission to manage banners/content |
| last_login_at | TIMESTAMP | NULL | Last admin login time |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | Account status (active, suspended) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update time |

### SQL (MySQL)

```sql
CREATE TABLE admins (
    admin_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    access_level VARCHAR(30) NOT NULL DEFAULT 'catalog_admin',
    can_manage_users BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage_products BOOLEAN NOT NULL DEFAULT TRUE,
    can_manage_orders BOOLEAN NOT NULL DEFAULT TRUE,
    can_manage_content BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMP NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);
```

### Recommended Indexes

- UNIQUE INDEX on user_id
- INDEX on access_level
- INDEX on status

## 3.5.2 Product Table

Purpose: Store product catalog data, pricing, inventory, and merchandising fields.

### Table Name

`products`

### Columns

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| product_id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Internal product record ID |
| external_id | INT | NOT NULL, UNIQUE | Existing product id from your model |
| name | VARCHAR(255) | NOT NULL | Product name |
| description | TEXT | NULL | Product description |
| category | VARCHAR(120) | NOT NULL | Product category |
| brand | VARCHAR(120) | NULL | Product brand |
| image_url | VARCHAR(500) | NOT NULL | Primary product image |
| original_price | DECIMAL(10,2) | NOT NULL | Original listed price |
| price | DECIMAL(10,2) | NOT NULL | Current selling price |
| discount_percent | DECIMAL(5,2) | NOT NULL, DEFAULT 0.00 | Discount percentage |
| on_sale | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether sale is active |
| sale_start_date | DATETIME | NULL | Sale start datetime |
| sale_end_date | DATETIME | NULL | Sale end datetime |
| upcoming_sale | BOOLEAN | NOT NULL, DEFAULT FALSE | Future sale marker |
| delivery_days | INT | NOT NULL, DEFAULT 3 | Estimated delivery days |
| stock | INT | NOT NULL, DEFAULT 1 | Available quantity |
| rating | DECIMAL(3,2) | NOT NULL, DEFAULT 0.00 | Average rating |
| num_reviews | INT | NOT NULL, DEFAULT 0 | Number of reviews |
| specs_json | JSON | NULL | Key-value technical specs |
| features_json | JSON | NULL | Feature list |
| colors_json | JSON | NULL | Available color list |
| bank_offers_json | JSON | NULL | Bank offer list |
| model_3d_url | VARCHAR(500) | NULL | 3D model URL |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update time |

### SQL (MySQL)

```sql
CREATE TABLE products (
    product_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    external_id INT NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    category VARCHAR(120) NOT NULL,
    brand VARCHAR(120) NULL,
    image_url VARCHAR(500) NOT NULL,
    original_price DECIMAL(10,2) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    on_sale BOOLEAN NOT NULL DEFAULT FALSE,
    sale_start_date DATETIME NULL,
    sale_end_date DATETIME NULL,
    upcoming_sale BOOLEAN NOT NULL DEFAULT FALSE,
    delivery_days INT NOT NULL DEFAULT 3,
    stock INT NOT NULL DEFAULT 1,
    rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    num_reviews INT NOT NULL DEFAULT 0,
    specs_json JSON NULL,
    features_json JSON NULL,
    colors_json JSON NULL,
    bank_offers_json JSON NULL,
    model_3d_url VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Recommended Indexes

- INDEX on category
- INDEX on brand
- INDEX on price
- INDEX on on_sale
- INDEX on stock
- INDEX on rating

## 3.5.3 User Table

Purpose: Store customer authentication, profile, and account lifecycle details.

### Table Name

`users`

### Columns

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| user_id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique user ID |
| name | VARCHAR(150) | NOT NULL | Full name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Login email |
| password_hash | VARCHAR(255) | NULL | Password hash (null for social login only users) |
| avatar_url | VARCHAR(500) | NULL | Profile image URL |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'user' | Role (user/admin) |
| provider | VARCHAR(30) | NOT NULL, DEFAULT 'local' | Auth provider (local/google/facebook/twitter) |
| google_id | VARCHAR(191) | NULL, UNIQUE | Google OAuth user ID |
| facebook_id | VARCHAR(191) | NULL, UNIQUE | Facebook OAuth user ID |
| twitter_id | VARCHAR(191) | NULL, UNIQUE | Twitter OAuth user ID |
| phone | VARCHAR(30) | NULL | Contact number |
| project_name | VARCHAR(255) | NULL | Optional profile field used in your app |
| email_verified | BOOLEAN | NOT NULL, DEFAULT FALSE | Email verification status |
| email_verification_token | VARCHAR(255) | NULL | Token for verification flow |
| email_verification_expires | DATETIME | NULL | Verification token expiry |
| password_reset_token | VARCHAR(255) | NULL | Token for password reset |
| password_reset_expires | DATETIME | NULL | Password reset token expiry |
| pending_email | VARCHAR(255) | NULL | Pending email change |
| email_change_token | VARCHAR(255) | NULL | Token for email change confirmation |
| email_change_expires | DATETIME | NULL | Email change token expiry |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update time |

### SQL (MySQL)

```sql
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL,
    avatar_url VARCHAR(500) NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    provider VARCHAR(30) NOT NULL DEFAULT 'local',
    google_id VARCHAR(191) NULL UNIQUE,
    facebook_id VARCHAR(191) NULL UNIQUE,
    twitter_id VARCHAR(191) NULL UNIQUE,
    phone VARCHAR(30) NULL,
    project_name VARCHAR(255) NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token VARCHAR(255) NULL,
    email_verification_expires DATETIME NULL,
    password_reset_token VARCHAR(255) NULL,
    password_reset_expires DATETIME NULL,
    pending_email VARCHAR(255) NULL,
    email_change_token VARCHAR(255) NULL,
    email_change_expires DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Recommended Indexes

- UNIQUE INDEX on email
- INDEX on role
- INDEX on provider
- INDEX on email_verified

## Relationship Summary

- One user can have zero or one admin record.
- Admin table references users via user_id.
- Products are independent catalog entities and can be referenced by orders, cart items, and wishlist items.

## Note For Current Project

Your current Node.js backend stores admin as a role in the user model. If you keep that approach, the admins table is optional. You can still include this admins table in academic documentation as a normalized design extension.