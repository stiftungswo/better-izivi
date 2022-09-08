class AddCertificateOfEmploymentTemplateAndConfirmationOfEmploymentTemplateToServiceSpecification < ActiveRecord::Migration[6.1]
  def change
    add_column :service_specifications, :certificate_of_employment_template, :string, nullable: true
    add_column :service_specifications, :confirmation_of_employment_template, :string, nullable: true
  end
end
