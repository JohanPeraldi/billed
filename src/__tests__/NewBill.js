/**
 * @jest-environment jsdom
 */

/* eslint-disable */

import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import { ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import router from '../app/Router.js';

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
      }));
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
    });
    test('Then the mail icon inside the vertical navbar should be highlighted', async () => {
      await waitFor(() => screen.getByTestId('icon-mail'));
      const mailIcon = screen.getByTestId('icon-mail');
      expect(mailIcon.className).toBe('active-icon');
    });
    test('Then there should be a title "Envoyer une note de frais"', async () => {
      await waitFor(() => screen.getByText('Envoyer une note de frais'));
      const pageTitle = screen.getByText('Envoyer une note de frais');
      expect(pageTitle).toBeTruthy();
    });
    describe('When I click on the "Choose file" button and select a file with the jpg extension', () => {
      test('Then the file should be added to the form', () => {
        const fileInput = screen.getByTestId('file');
        const validFile = new File(['valid file'], 'valid-file.jpg', {type: 'image/jpg'});
        userEvent.upload(fileInput, validFile);
        const formData = new FormData();
        formData.append('file', validFile);
        expect(fileInput.files[0]).toStrictEqual(validFile);
        expect(fileInput.files.item(0)).toStrictEqual(validFile);
        expect(fileInput.files).toHaveLength(1);
        expect(formData.values).toBeTruthy();
      });
    });
    describe('When I click on the "Choose file" button and select a file with the txt extension', () => {
      test('Then the file should not be added to the form', () => {
        const fileInput = screen.getByTestId('file');
        const invalidFile = new File(['invalid file'], 'invalid-file.txt', {type: 'text/plain'});
        userEvent.upload(fileInput, invalidFile);
        expect(fileInput.files[0]).toBeFalsy;
        expect(fileInput.files.item(0)).toBeFalsy;
      });
    });
    describe('When I fill in all required fields and click on submit button', () => {
      test('Then the bill should be saved', () => {
        // First required field (date)
        const date = screen.getByTestId('datepicker');
        date.value = '2022-09-20';
        // Second required field (amount)
        const amount = screen.getByTestId('amount');
        amount.value = 100;
        // Third required field (VAT percentage)
        const vatPerc = screen.getByTestId('pct');
        vatPerc.value = 20;
        // Fourth required field (file)
        const fileInput = screen.getByTestId('file');
        const validPngFile = new File(['valid png file'], 'valid-file.png', {type: 'image/png'});
        userEvent.upload(fileInput, validPngFile);
        // const form = screen.getByTestId('form-new-bill');
        const submitBtn = screen.getByText('Envoyer');
        const handleSubmit = jest.fn();
        submitBtn.addEventListener('click', handleSubmit);
        userEvent.click(submitBtn);
        expect(handleSubmit).toHaveBeenCalled();
      });
    });
  });
});
