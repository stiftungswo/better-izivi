SET sql_mode = '';

USE stiftun8_izivi;

-- Drop unused tables

ALTER TABLE users
    DROP FOREIGN KEY users_canton_foreign,
    DROP FOREIGN KEY users_hometown_canton_foreign,
    DROP FOREIGN KEY users_regional_center_foreign,
    DROP FOREIGN KEY users_role_foreign;

DROP TABLE no_iban;
DROP TABLE cantons;
DROP TABLE user_feedbacks;
DROP TABLE user_feedback_questions;
DROP TABLE logs;

-- Alter users table

UPDATE users
    SET birthday = '2019-08-23'
    WHERE birthday = '0000-00-00';

ALTER TABLE users
    DROP PRIMARY KEY,
    CHANGE id id BIGINT AUTO_INCREMENT PRIMARY KEY,
    CHANGE role role INT DEFAULT 2 NOT NULL,
    CHANGE zdp zdp INT NOT NULL,
    DROP COLUMN canton,
    DROP COLUMN phone_business,
    DROP COLUMN phone_mobile,
    DROP COLUMN phone_private,
    DROP COLUMN bank_bic,
    DROP COLUMN driving_licence,
    DROP COLUMN ga_travelcard,
    DROP COLUMN half_fare_travelcard,
    DROP COLUMN other_fare_network,
    DROP COLUMN hometown_canton,
    DROP COLUMN deleted_at,
    DROP COLUMN remember_token,

    RENAME COLUMN regional_center TO regional_center_id,
    RENAME COLUMN password TO legacy_password,

    ADD COLUMN encrypted_password VARCHAR(255) DEFAULT '' NOT NULL,
    ADD COLUMN reset_password_token VARCHAR(255) NULL,
    ADD COLUMN reset_password_sent_at DATETIME NULL,

    DROP INDEX users_email_unique,

    ADD CONSTRAINT index_users_on_email UNIQUE (email),
    ADD CONSTRAINT index_users_on_reset_password_token UNIQUE (reset_password_token),
    ADD CONSTRAINT fk_rails_0402495f12 FOREIGN KEY (regional_center_id) REFERENCES REGIONAL_CENTERS (id);


-- Alter specifications ==> service specifications
RENAME TABLE specifications TO service_specifications;

ALTER TABLE missions
    DROP FOREIGN KEY missions_specification_foreign;

ALTER TABLE service_specifications
    DROP PRIMARY KEY,
    RENAME COLUMN id TO identification_number,
    ADD COLUMN id BIGINT AUTO_INCREMENT PRIMARY KEY,

    DROP COLUMN pocket,
    DROP COLUMN manual_file,
    DROP COLUMN working_clothes_payment,
    DROP COLUMN working_time_model,
    DROP COLUMN working_time_weekly,
    CHANGE active active TINYINT(1) DEFAULT 1 NULL,

    RENAME COLUMN working_clothes_expense TO work_clothing_expenses,
    RENAME COLUMN accommodation TO accommodation_expenses,

    ADD COLUMN work_days_expenses TEXT NOT NULL,
    ADD COLUMN paid_vacation_expenses TEXT NOT NULL,
    ADD COLUMN first_day_expenses TEXT NOT NULL,
    ADD COLUMN last_day_expenses TEXT NOT NULL,
    ADD COLUMN location VARCHAR(255) DEFAULT 'ZH' NULL,
    ADD COLUMN created_at DATETIME NOT NULL,
    ADD COLUMN updated_at DATETIME NOT NULL,

    ADD CONSTRAINT index_service_specifications_on_identification_number UNIQUE(identification_number);

UPDATE service_specifications SET work_days_expenses = CONCAT(
    '{',
        '"breakfast":', working_breakfast_expenses, ',',
        '"lunch":', working_lunch_expenses, ','
        '"dinner":', working_dinner_expenses,
    '}'
) WHERE 1;

UPDATE service_specifications SET paid_vacation_expenses = CONCAT(
    '{',
        '"breakfast":', sparetime_breakfast_expenses, ',',
        '"lunch":', sparetime_lunch_expenses, ','
        '"dinner":', sparetime_dinner_expenses,
    '}'
) WHERE 1;

UPDATE service_specifications SET first_day_expenses = CONCAT(
    '{',
        '"breakfast":', firstday_breakfast_expenses, ',',
        '"lunch":', firstday_lunch_expenses, ','
        '"dinner":', firstday_dinner_expenses,
    '}'
) WHERE 1;

UPDATE service_specifications SET last_day_expenses = CONCAT(
    '{',
        '"breakfast":', lastday_breakfast_expenses, ',',
        '"lunch":', lastday_lunch_expenses, ','
        '"dinner":', lastday_dinner_expenses,
    '}'
) WHERE 1;


-- Alter missions ==> services

RENAME TABLE missions TO services;

DELETE FROM report_sheets
    WHERE mission IN (SELECT id FROM services WHERE deleted_at IS NOT NULL);
DELETE FROM report_sheets WHERE deleted_at IS NOT NULL;

DELETE FROM services WHERE deleted_at IS NOT NULL;

-- Use db id for foreign key

ALTER TABLE services
    ADD COLUMN service_specification_id BIGINT NOT NULL;

UPDATE services
    LEFT JOIN service_specifications ON services.specification = service_specifications.identification_number
SET services.service_specification_id = service_specifications.id
WHERE 1;

ALTER TABLE services
    DROP PRIMARY KEY,
    CHANGE id id BIGINT AUTO_INCREMENT PRIMARY KEY,
    CHANGE user user_id BIGINT NOT NULL,
    CHANGE start beginning DATE NOT NULL,
    CHANGE end ending DATE NOT NULL,
    CHANGE first_time first_swo_service TINYINT(1) DEFAULT 1 NOT NULL,
    CHANGE long_mission long_service TINYINT(1) DEFAULT 0 NOT NULL,
    CHANGE probation_period probation_service TINYINT(1) DEFAULT 0 NOT NULL,
    CHANGE feedback_mail_sent feedback_mail_sent TINYINT(1) DEFAULT 0 NOT NULL,
    RENAME COLUMN draft TO confirmation_date,
    RENAME COLUMN mission_type TO service_type,
    DROP COLUMN eligible_holiday,
    DROP COLUMN specification,
    DROP COLUMN feedback_done,
    DROP FOREIGN KEY missions_user_foreign,
    DROP FOREIGN KEY missions_specification_foreign,
    ADD CONSTRAINT fk_rails_51a813203f FOREIGN KEY (user_id) REFERENCES users (id),
    ADD CONSTRAINT fk_rails_05245f4b1b FOREIGN KEY (service_specification_id) REFERENCES service_specifications (id);
