# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2019_04_29_132515) do

  create_table "expense_sheets", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.date "start_date", null: false
    t.date "end_date", null: false
    t.bigint "user_id", null: false
    t.integer "work_days", null: false
    t.string "work_comment"
    t.integer "company_holiday_unpaid_days", default: 0
    t.integer "company_holiday_paid_days", default: 0
    t.string "company_holiday_comment"
    t.integer "workfree_days", default: 0
    t.integer "ill_days", default: 0
    t.string "ill_comment"
    t.integer "holiday_days", default: 0
    t.integer "paid_vacation_days", default: 0
    t.string "paid_vacation_comment"
    t.integer "unpaid_vacation_days", default: 0
    t.string "unpaid_vacation_comment"
    t.integer "driving_charges", default: 0
    t.string "driving_charges_comment"
    t.integer "extraordinarily_expenses", default: 0
    t.string "extraordinarily_expenses_comment"
    t.integer "clothes_expenses", default: 0
    t.string "clothes_expenses_comment"
    t.string "bank_account_number", null: false
    t.integer "state", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_expense_sheets_on_user_id"
  end

  create_table "food_expenses", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.integer "breakfast", null: false
    t.integer "lunch", null: false
    t.integer "dinner", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "payments", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "xml_id", null: false
    t.string "xml_date", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "regional_centers", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "name"
    t.string "address"
    t.string "short_name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "roles", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "service_specifications", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "name"
    t.string "short_name"
    t.integer "working_clothes_expenses"
    t.integer "accommodation_expenses"
    t.json "work_days_expenses"
    t.json "paid_vacation_expense"
    t.json "first_day_expense"
    t.json "last_day_expense"
    t.string "language"
    t.boolean "active"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "email", null: false
    t.bigint "role_id", null: false
    t.integer "zdp", null: false
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "address", null: false
    t.integer "zip", null: false
    t.string "city", null: false
    t.string "hometown", null: false
    t.date "birthday", null: false
    t.string "phone", null: false
    t.string "bank_iban", null: false
    t.string "health_insurance", null: false
    t.text "work_experience"
    t.boolean "driving_licence_b", default: false, null: false
    t.boolean "driving_licence_be", default: false, null: false
    t.bigint "regional_center_id"
    t.text "internal_note"
    t.boolean "chainsaw_workshop", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["regional_center_id"], name: "index_users_on_regional_center_id"
    t.index ["role_id"], name: "index_users_on_role_id"
  end

  add_foreign_key "expense_sheets", "users"
  add_foreign_key "users", "regional_centers"
  add_foreign_key "users", "roles"
end
