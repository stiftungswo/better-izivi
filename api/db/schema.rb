# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2022_09_14_055352) do

  create_table "allowlisted_jwts", charset: "utf8", force: :cascade do |t|
    t.string "jti", null: false
    t.string "aud"
    t.datetime "exp", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["jti"], name: "index_allowlisted_jwts_on_jti", unique: true
    t.index ["user_id"], name: "index_allowlisted_jwts_on_user_id"
  end

  create_table "expense_sheets", charset: "utf8", force: :cascade do |t|
    t.date "beginning", null: false
    t.date "ending", null: false
    t.bigint "user_id", null: false
    t.integer "work_days", null: false
    t.integer "unpaid_company_holiday_days", default: 0, null: false
    t.integer "paid_company_holiday_days", default: 0, null: false
    t.string "company_holiday_comment"
    t.integer "workfree_days", default: 0, null: false
    t.integer "sick_days", default: 0, null: false
    t.string "sick_comment"
    t.integer "paid_vacation_days", default: 0, null: false
    t.string "paid_vacation_comment"
    t.integer "unpaid_vacation_days", default: 0, null: false
    t.string "unpaid_vacation_comment"
    t.integer "driving_expenses", default: 0, null: false
    t.string "driving_expenses_comment"
    t.integer "extraordinary_expenses", default: 0, null: false
    t.string "extraordinary_expenses_comment"
    t.integer "clothing_expenses", default: 0, null: false
    t.string "clothing_expenses_comment"
    t.string "bank_account_number", null: false
    t.integer "state", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "payment_timestamp"
    t.boolean "ignore_first_day", default: false, null: false
    t.boolean "ignore_last_day", default: false, null: false
    t.integer "included_in_download_at"
    t.index ["user_id"], name: "index_expense_sheets_on_user_id"
  end

  create_table "holidays", charset: "utf8", force: :cascade do |t|
    t.date "beginning", null: false
    t.date "ending", null: false
    t.integer "holiday_type", default: 1, null: false
    t.string "description", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "regional_centers", charset: "utf8", force: :cascade do |t|
    t.string "name", null: false
    t.string "address", null: false
    t.string "short_name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "service_specifications", charset: "utf8", force: :cascade do |t|
    t.string "name", null: false
    t.string "short_name", null: false
    t.integer "work_clothing_expenses", null: false
    t.integer "accommodation_expenses", null: false
    t.text "work_days_expenses", null: false
    t.text "paid_vacation_expenses", null: false
    t.text "first_day_expenses", null: false
    t.text "last_day_expenses", null: false
    t.string "location", default: "zh"
    t.boolean "active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "identification_number", null: false
    t.string "certificate_of_employment_template"
    t.string "confirmation_of_employment_template"
    t.index ["identification_number"], name: "index_service_specifications_on_identification_number", unique: true
  end

  create_table "services", charset: "utf8", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "service_specification_id", null: false
    t.date "beginning", null: false
    t.date "ending", null: false
    t.date "confirmation_date"
    t.integer "service_type", default: 0, null: false
    t.boolean "first_swo_service", default: true, null: false
    t.boolean "long_service", default: false, null: false
    t.boolean "probation_service", default: false, null: false
    t.boolean "feedback_mail_sent", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "starts_on_saturday", default: false, null: false
    t.index ["service_specification_id"], name: "index_services_on_service_specification_id"
    t.index ["user_id"], name: "index_services_on_user_id"
  end

  create_table "users", charset: "utf8", force: :cascade do |t|
    t.string "email", null: false
    t.integer "zdp", null: false
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "address", null: false
    t.integer "zip", null: false
    t.integer "role", default: 2, null: false
    t.string "city", null: false
    t.string "hometown", null: false
    t.date "birthday", null: false
    t.string "phone", null: false
    t.string "bank_iban", null: false
    t.string "health_insurance", null: false
    t.text "work_experience"
    t.boolean "driving_licence_b", default: false, null: false
    t.boolean "driving_licence_be", default: false, null: false
    t.bigint "regional_center_id", null: false
    t.text "internal_note"
    t.boolean "chainsaw_workshop", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.integer "dime_id", default: 0
    t.boolean "photographs_accepted", default: false, null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["regional_center_id"], name: "index_users_on_regional_center_id"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["zdp"], name: "index_users_on_zdp", unique: true
  end

  add_foreign_key "allowlisted_jwts", "users", on_delete: :cascade
  add_foreign_key "expense_sheets", "users"
  add_foreign_key "services", "service_specifications"
  add_foreign_key "services", "users"
  add_foreign_key "users", "regional_centers"
end
