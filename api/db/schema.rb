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

ActiveRecord::Schema.define(version: 2019_04_29_075652) do

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

  add_foreign_key "users", "regional_centers"
  add_foreign_key "users", "roles"
end
