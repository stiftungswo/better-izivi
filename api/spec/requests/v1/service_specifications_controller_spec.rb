# frozen_string_literal: true

require 'rails_helper'

RSpec.describe V1::ServiceSpecificationsController, type: :request do
  context 'when the user is signed in' do
    let(:user) { create :user }

    before { sign_in user }

    describe '#index' do
      let(:request) { get v1_service_specifications_path }
      let!(:service_specifications) { create_list :service_specification, 3 }
      let(:json_service_specifications) do
        service_specifications.map do |service_specification|
          extract_to_json(service_specification).except(:created_at, :updated_at,
                                                        :certificate_of_employment_template,
                                                        :confirmation_of_employment_template)
                                                .merge(pocket_money: ServiceSpecification::POCKET_MONEY)
        end
      end

      it 'returns all service specifications' do
        request

        expect(parse_response_json(response)).to include(*json_service_specifications)
      end

      it_behaves_like 'renders a successful http status code' do
        before { create :service_specification }
      end
    end

    describe '#create' do
      let(:post_request) { post v1_service_specifications_path(service_specification: params) }

      context 'when user is admin' do
        let(:user) { create :user, :admin }

        context 'when params are valid' do
          let(:params) { attributes_for(:service_specification) }

          let(:expected_returned_json_keys) do
            %i[
              identification_number
              name
              short_name
              location
              active
              work_days_expenses
              paid_vacation_expenses
              first_day_expenses
              last_day_expenses
            ]
          end

          it_behaves_like 'renders a successful http status code' do
            let(:request) { post_request }
          end

          it 'creates a new ServiceSpecification' do
            expect { post_request }.to change(ServiceSpecification, :count).by(1)
          end

          it 'returns the created service specification' do
            post_request
            # noinspection RubyResolve
            expect(parse_response_json(response)).to include(
              params
                .slice(*expected_returned_json_keys)
                .merge(params.slice(:work_clothing_expenses, :accommodation_expenses).transform_values(&:to_i))
                .merge(pocket_money: ServiceSpecification::POCKET_MONEY)
            )
          end
        end

        context 'when params are invalid' do
          let(:params) do
            attributes_for(:service_specification).merge(short_name: '', accommodation_expenses: 'I am invalid')
          end

          it 'does not create a new ServiceSpecification' do
            expect { post_request }.not_to change(ServiceSpecification, :count)
          end

          it_behaves_like 'renders a validation error response' do
            let(:request) { post_request }
          end

          it 'renders all validation errors', :aggregate_failures do
            post_request
            errors = parse_response_json(response)[:errors]

            expect(errors).to include(
              short_name: be_an_instance_of(Array),
              accommodation_expenses: be_an_instance_of(Array)
            )
            expect(errors.length).to eq 2
          end
        end
      end

      context 'when user is not admin' do
        let(:params) { attributes_for(:service_specification) }

        it_behaves_like 'admin protected resource' do
          let(:request) { post_request }
        end

        it 'does not create a new ServiceSpecification' do
          expect { post_request }.not_to change(ServiceSpecification, :count)
        end
      end
    end

    describe '#update' do
      let!(:service_specification) { create :service_specification }
      let(:put_request) do
        put v1_service_specification_path(service_specification, params: { service_specification: params })
      end

      context 'when user is admin' do
        let(:user) { create :user, :admin }

        context 'with valid params' do
          let(:params) { { name: 'New name' } }
          let(:expected_attributes) do
            extract_to_json(service_specification,
                            :name,
                            :short_name,
                            :work_clothing_expenses,
                            :accommodation_expenses,
                            :location,
                            :active)
          end

          it 'updates service_specification name' do
            expect { put_request }.to(change { service_specification.reload.name }.to('New name'))
          end

          it_behaves_like 'renders a successful http status code' do
            let(:request) { put_request }
          end

          it 'returns the updated service specification' do
            put_request
            expect(parse_response_json(response)).to include(expected_attributes)
          end

          it 'returns updated JSON expenses' do
            put_request
            expect(parse_response_json(response)).to include extract_to_json(
              service_specification, :work_days_expenses,
              :paid_vacation_expenses,
              :first_day_expenses,
              :last_day_expenses
            )
          end
        end

        context 'with invalid params' do
          let(:params) { { work_clothing_expenses: 'ab' } }

          it_behaves_like 'renders a validation error response' do
            let(:request) { put_request }
          end

          it 'renders all validation errors' do
            put_request
            expect(parse_response_json(response)[:errors]).to include(
              work_clothing_expenses: be_an_instance_of(Array)
            )
          end
        end

        context 'when the requested resource does not exist' do
          it_behaves_like 'renders a not found error response' do
            let(:request) { put v1_service_specification_path(-2) }
          end
        end
      end

      context 'when user is not admin' do
        let(:params) { { name: 'New name' } }

        it_behaves_like 'admin protected resource' do
          let(:request) { put_request }
        end

        it 'does not change the ServiceSpecification' do
          expect { put_request }.not_to(change { service_specification.reload.name })
        end
      end
    end
  end

  context 'when no user is signed in' do
    describe '#index' do
      it_behaves_like 'login protected resource' do
        let(:request) { get v1_service_specifications_path }
      end
    end

    describe '#create' do
      let(:params) { attributes_for(:service_specification) }
      let(:request) { post v1_service_specifications_path(service_specification: params) }

      it_behaves_like 'login protected resource'

      it 'does not create a new service specification' do
        expect { request }.not_to change(ServiceSpecification, :count)
      end
    end

    describe '#update' do
      let!(:service_specification) { create :service_specification }
      let(:request) do
        put v1_service_specification_path(service_specification, params: { service_specification: params })
      end
      let(:params) { { name: 'New name' } }

      it_behaves_like 'login protected resource'

      it 'does not update the service specification' do
        expect { request }.not_to(change { service_specification.reload.name })
      end
    end
  end
end
