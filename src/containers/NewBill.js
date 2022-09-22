/* eslint-disable */

import { ROUTES_PATH } from '../constants/routes.js';
import Logout from './Logout.js';

export default class NewBill {
  constructor({
    document, onNavigate, store, localStorage,
  }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector('form[data-testid="form-new-bill"]');
    formNewBill.addEventListener('submit', this.handleSubmit);
    const file = this.document.querySelector('input[data-testid="file"]');
    file.addEventListener('change', this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    this.fileTypeIsValid;
    new Logout({ document, localStorage, onNavigate });
  }

  handleChangeFile = (e) => {
    e.preventDefault();
    // A regular expression to match strings ending with either .jpeg, .jpg or .png
    const regex = /(.\.)(jpeg|jpg|png)$/;
    const file = this.document.querySelector('input[data-testid="file"]').files[0];
    const filePath = e.target.value.split(/\\/g);
    const fileName = filePath[filePath.length - 1];
    const formData = new FormData();
    const { email } = JSON.parse(localStorage.getItem('user'));
    if (!regex.test(fileName)) {
      // Empty the input
      this.document.querySelector('input[data-testid="file"]').value = null;
      this.fileTypeIsValid = false;
      // console.log('Invalid file type!');
    } else {
      formData.append('file', file);
      formData.append('email', email);
      this.fileTypeIsValid = true;
      // console.log('File type is valid');

      this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true,
          },
        })
        .then(({ fileUrl, key }) => {
          this.billId = key;
          if (fileUrl) {
            this.fileUrl = fileUrl;
            this.fileName = fileName;
          }
        }).catch((error) => console.error(error));
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    // console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector('input[data-testid="datepicker"]').value);
    const { email } = JSON.parse(localStorage.getItem('user'));
    const bill = {
      email,
      type: e.target.querySelector('select[data-testid="expense-type"]').value,
      name: e.target.querySelector('input[data-testid="expense-name"]').value,
      amount: parseInt(e.target.querySelector('input[data-testid="amount"]').value),
      date: e.target.querySelector('input[data-testid="datepicker"]').value,
      vat: e.target.querySelector('input[data-testid="vat"]').value,
      pct: parseInt(e.target.querySelector('input[data-testid="pct"]').value) || 20,
      commentary: e.target.querySelector('textarea[data-testid="commentary"]').value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending',
    };
    this.updateBill(bill);
    this.onNavigate(ROUTES_PATH.Bills);
  };

  // no need to test this function
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH.Bills);
        })
        .catch((error) => console.error(error));
    }
  };
}
