import * as yup from 'yup';

const siteSchema = yup.object({
  id: yup.number(),
  name: yup.string().required(),
  language: yup.string().required(),
  terms_pdf_url: yup.string().nullable(),
  terms_pdf: yup.mixed().nullable().test(
    'terms-pdf-required',
    'Bitte eine PDF-Datei auswählen',
    function (value) {
      return Boolean(value) || Boolean(this.parent.terms_pdf_url);
    },
  ),
});

export default siteSchema;
