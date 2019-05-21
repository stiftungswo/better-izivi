# frozen_string_literal: true

require 'rails_helper'

RSpec.describe V1::ServiceSpecificationsController, type: :request do
  context 'when the user is signed in' do
    let(:user) { create :user }

    before { sign_in user }

    describe '#index' do
      it_behaves_like 'renders a successful http status code' do
        before { create :service_specification }

        let(:request) { get v1_service_specifications_path }
      end
    end

    describe '#create' do
      subject { -> { post_request } }

      let(:post_request) { post v1_service_specifications_path(service_specification: params) }

      context 'when params are valid' do
        let(:params) { attributes_for(:service_specification) }

        it_behaves_like 'renders a successful http status code' do
          let(:request) { post_request }
        end

        it { is_expected.to change(ServiceSpecification, :count).by(1) }

        it 'returns the created service specification' do
          post_request
          expect(parse_response_json(response)).to include(
            id: ServiceSpecification.last.id,
            name: params[:name],
            short_name: params[:short_name],
            working_clothes_expenses: params[:working_clothes_expenses].to_i,
            accommodation_expenses: params[:accommodation_expenses].to_i,
            location: params[:location],
            active: params[:active],
            work_days_expenses: params[:work_days_expenses],
            paid_vacation_expenses: params[:paid_vacation_expenses],
            first_day_expenses: params[:first_day_expenses],
            last_day_expenses: params[:last_day_expenses]
          )
        end
      end

      context 'when params are invalid' do
        let(:params) do
          attributes_for(:service_specification).merge(short_name: '', accommodation_expenses: 'I am invalid')
        end

        it { is_expected.to change(ServiceSpecification, :count).by(0) }

        describe 'returned error' do
          it_behaves_like 'renders a validation error response' do
            let(:request) { post_request }
          end

          it 'renders all validation errors' do
            post_request
            expect(parse_response_json(response)[:errors]).to include(
              short_name: be_an_instance_of(Array),
              accommodation_expenses: be_an_instance_of(Array)
            )
          end
        end
      end
    end

    describe '#update' do
      let!(:service_specification) { create :service_specification }
      let(:put_request) do
        put v1_service_specification_path(service_specification, params: { service_specification: params })
      end

      context 'with valid params' do
        subject { -> { put_request } }

        let(:params) { { name: 'New name' } }
        let(:expected_attributes) do
          extract_to_json(service_specification,
                          :name,
                          :short_name,
                          :working_clothes_expenses,
                          :accommodation_expenses,
                          :location,
                          :active,
                          :work_days_expenses,
                          :paid_vacation_expenses,
                          :first_day_expenses,
                          :last_day_expenses)
        end

        it { is_expected.to(change { service_specification.reload.name }.to('New name')) }

        it_behaves_like 'renders a successful http status code' do
          let(:request) { put_request }
        end

        it 'returns the updated service specification' do
          put_request
          p expected_attributes
          expect(parse_response_json(response)).to include(expected_attributes)
        end
      end

      context 'with invalid params' do
        let(:params) { { working_clothes_expenses: 'ab' } }

        it_behaves_like 'renders a validation error response' do
          let(:request) { put_request }
        end

        it 'renders all validation errors' do
          put_request
          expect(parse_response_json(response)[:errors]).to include(
            working_clothes_expenses: be_an_instance_of(Array)
          )
        end
      end

      context 'when the requested resource does not exist' do
        it_behaves_like 'renders a not found error response' do
          let(:request) { put v1_service_specification_path(-2) }
        end
      end
    end
  end

  context 'when no user is signed in' do
    describe '#index' do
      it_behaves_like 'protected resource' do
        let(:request) { get v1_service_specifications_path }
      end
    end

    describe '#create' do
      let(:params) { attributes_for(:service_specification) }
      let(:request) { post v1_service_specifications_path(service_specification: params) }

      it_behaves_like 'protected resource'

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

      it_behaves_like 'protected resource'

      it 'does not update the service specification' do
        expect { request }.not_to(change { service_specification.reload.name })
      end
    end
  end
end