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

        it 'returns the created holiday' do
          post_request
          expect(parse_response_json(response)).to include(
            id: Holiday.last.id,
            beginning: params[:beginning],
            ending: params[:ending],
            holiday_type: params[:holiday_type].to_s,
            description: params[:description]
          )
        end
      end

      context 'when params are invalid' do
        let(:params) { { description: '', ending_date: 'I am invalid' } }

        it { is_expected.to change(ServiceSpecification, :count).by(0) }

        describe 'returned error' do
          it_behaves_like 'renders a validation error response' do
            let(:request) { post_request }
          end

          it 'renders all validation errors' do
            post_request
            expect(parse_response_json(response)[:errors]).to include(
              ending: be_an_instance_of(Array),
              beginning: be_an_instance_of(Array),
              description: be_an_instance_of(Array)
            )
          end
        end
      end
    end

    describe '#update' do
      let!(:holiday) { create :holiday }
      let(:put_request) { put v1_service_specifications_path(service_specification, params: { service_specification: params }) }

      context 'with valid params' do
        subject { -> { put_request } }

        let(:params) { { description: 'New description' } }
        let(:expected_attributes) { extract_to_json(service_specification, :beginning, :ending, :description, :holiday_type, :id) }

        it { is_expected.to(change { service_specification.reload.description }.to('New description')) }

        it_behaves_like 'renders a successful http status code' do
          let(:request) { put_request }
        end

        it 'returns the updated holiday' do
          put_request
          expect(parse_response_json(response)).to include(expected_attributes)
        end
      end

      context 'with invalid params' do
        let(:params) { { description: '' } }

        it_behaves_like 'renders a validation error response' do
          let(:request) { put_request }
        end

        it 'renders all validation errors' do
          put_request
          expect(parse_response_json(response)[:errors]).to include(
            description: be_an_instance_of(Array)
          )
        end
      end

      context 'when the requested resource does not exist' do
        it_behaves_like 'renders a not found error response' do
          let(:request) { put v1_service_specifications_path(-2) }
        end
      end
    end

    describe '#destroy' do
      subject { -> { delete_request } }

      let!(:service_specification) { create :service_specification }
      let(:delete_request) { delete v1_service_specifications_path(holiday) }

      it { is_expected.to change(ServiceSpecification, :count).by(-1) }

      it 'returns the deleted resource' do
        expected_response = extract_to_json(service_specification, :id, :beginning, :ending, :description)

        delete_request

        expect(parse_response_json(response)).to include(expected_response)
      end

      context 'when the requested resource does not exist' do
        let(:request) { delete v1_service_specifications_path(-2) }

        it_behaves_like 'renders a not found error response'

        it 'does not delete anything' do
          expect { request }.not_to change(ServiceSpecification, :count)
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

      it 'does not create a new holiday' do
        expect { request }.not_to change(ServiceSpecification, :count)
      end
    end

    describe '#update' do
      let!(:service_specification) { create :service_specification }
      let(:request) { put v1_service_specifications_path(service_specification, params: { service_specification: params }) }
      let(:params) { { description: 'New description' } }

      it_behaves_like 'protected resource'

      it 'does not update the holiday' do
        expect { request }.not_to(change { service_specification.reload.description })
      end
    end

    describe '#destroy' do
      let!(:service_specification) { create :service_specification }
      let(:request) { delete v1_service_specifications_path(service_specification) }

      it_behaves_like 'protected resource'

      it 'does not delete the holiday' do
        expect { request }.not_to change(ServiceSpecification, :count)
      end
    end
  end
end
