/**
 * @jest-environment jsdom
 */

/* eslint-disable */

import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import NewBill from '../containers/NewBill.js';
import NewBillUI from '../views/NewBillUI.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import mockStore from '../__mocks__/store.js';
import router from '../app/Router';

jest.mock('../app/store', () => mockStore);

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    test('Then the mail icon inside the vertical navbar should be highlighted', async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
      }));
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
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
        const html = NewBillUI();
        document.body.innerHTML = html;
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
        }));
        const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
        const fileInput = screen.getByTestId('file');
        // Create file with valid extension
        const validFile = new File(['valid file'], 'valid-file.jpg', {type: 'image/jpg'});
        userEvent.upload(fileInput, validFile);
        expect(fileInput.files[0]).toStrictEqual(validFile);
        expect(fileInput.files[0].name).toBe('valid-file.jpg');
        expect(fileInput.files).toHaveLength(1);
        expect(newBill.fileTypeIsValid).toBeTruthy;
      });
    });
    describe('When I click on the "Choose file" button and select a file with the txt extension', () => {
      test('Then the file should not be added to the form', () => {
        const html = NewBillUI();
        document.body.innerHTML = html;
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
        }));
        const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
        const fileInput = screen.getByTestId('file');
        // Create file with invalid extension
        const invalidFile = new File(['invalid file'], 'invalid-file.txt', {type: 'text/plain'});
        userEvent.upload(fileInput, invalidFile);
        expect(fileInput.files[0]).toStrictEqual(invalidFile);
        expect(fileInput.files[0].name).toBe('invalid-file.txt');
        expect(fileInput.files).toHaveLength(1);
        expect(newBill.fileTypeIsValid).toBeFalsy();
      });
    });
    describe('When I fill in all required fields and click on submit button', () => {
      test('Then the form should be submitted', () => {
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
        const submitBtn = screen.getByText('Envoyer');
        const handleSubmit = jest.fn(() => {
          if (date.value && amount.value && vatPerc.value && fileInput.files[0].name === 'valid-file.png') {
            return true;
          }

          return false;
        });
        submitBtn.addEventListener('click', handleSubmit);
        userEvent.click(submitBtn);
        expect(handleSubmit).toHaveBeenCalled();
        expect(handleSubmit).toHaveReturnedWith(true);
      });
    });
  });
});
